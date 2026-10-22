// O DOSSIÊ DA PÁGINA DE RECURSOS
//
// Dá vida à seção "O dossiê" (recursos.html):
//   1) quando a nota aparece na tela, roda uma análise de exemplo: o arco gira, os três
//      motores terminam um de cada vez e a nota desce de 100 até o resultado, gravidade por gravidade;
//   2) o simulador: os botões − e + mudam quantos achados de cada gravidade o projeto tem,
//      e a nota é recalculada na hora;
//   3) cada cartão tem uma demonstração: a tradução de um achado, o gráfico do histórico,
//      o botão de falso positivo e o laudo sendo gerado;
//   4) uma luz verde segue o mouse dentro dos cartões e das gravidades.
//
// Sem JavaScript a seção já aparece pronta, com a nota 61. Nada aqui é obrigatório.
// O visual de cada estado (as classes que este arquivo põe e tira) está no recursos.css, seção 8.

(function () {
    const secao = document.getElementById('dossie');
    if (!secao) return;

    // quem pediu "menos movimento" no sistema vê tudo pronto, sem as animações
    const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;


    // ---------- 1. AS PEÇAS DA SEÇÃO ----------

    const nota = document.getElementById('nota');
    const notaValor = document.getElementById('nota_valor');
    const notaCartao = document.getElementById('nota_cartao');
    const notaConta = document.getElementById('nota_conta');
    const notaAviso = document.getElementById('nota_aviso');
    const botaoRepetir = document.getElementById('nota_repetir');
    const etapas = notaCartao.querySelectorAll('.nota_etapas li');
    const miniNota = document.getElementById('simulador_nota');
    const simulador = document.getElementById('simulador');
    const gravidades = secao.querySelectorAll('.gravidade');

    // a ordem em que os achados descontam a nota: do mais grave para o mais leve
    const ORDEM = ['critica', 'alta', 'media', 'baixa'];

    // nomes no singular e no plural, para escrever "1 crítica" e "2 críticas"
    const NOMES = {
        critica: ['crítica', 'críticas'],
        alta: ['alta', 'altas'],
        media: ['média', 'médias'],
        baixa: ['baixa', 'baixas']
    };

    // a cor de cada gravidade, com o nome da variável do style.css
    const COR = { critica: '--critico', alta: '--alto', media: '--medio', baixa: '--baixo' };

    // Quanto cada gravidade tira da nota e quantos achados de cada uma o exemplo tem.
    // Os dois vêm do HTML: o data-peso de cada caixa e o número do contador dela.
    const peso = {};
    const achados = {};
    gravidades.forEach(function (caixa) {
        const nome = caixa.dataset.gravidade;
        peso[nome] = Number(caixa.dataset.peso);
        achados[nome] = Number(caixa.querySelector('.contador_valor').textContent);
    });

    // o número que está no anel agora: as animações começam dele
    let notaNaTela = calcularNota();

    // enquanto a análise roda, o simulador e o botão "Escanear de novo" ficam travados
    let analisando = false;


    // ---------- 2. FERRAMENTAS ----------

    function espera(ms) {
        return new Promise(function (pronto) { setTimeout(pronto, ms); });
    }

    // A nota: começa em 100, cada achado tira o peso da gravidade dele, e nunca fica abaixo de zero.
    function calcularNota() {
        let total = 100;
        ORDEM.forEach(function (nome) {
            total -= peso[nome] * achados[nome];
        });
        return Math.max(0, total);
    }

    // a parte de uma gravidade na conta: "− 25" para um achado, "− 2 × 25" para dois
    function parteDaConta(nome) {
        const n = achados[nome];
        if (n === 0) return '';
        return n === 1 ? ' − ' + peso[nome] : ' − ' + n + ' × ' + peso[nome];
    }

    // a conta inteira, embaixo do anel: "100 − 25 − 10 − 4 = 61"
    function textoDaConta() {
        let conta = '100';
        ORDEM.forEach(function (nome) { conta += parteDaConta(nome); });
        if (conta === '100') return 'Nenhum achado: nota máxima';
        return conta + ' = ' + calcularNota();
    }

    // Conta de "de" até "para" em "duracao" milissegundos, rápido no começo e devagar no fim.
    // requestAnimationFrame chama a função a cada quadro da tela (umas 60 vezes por segundo).
    function animarNumero(elemento, de, para, duracao) {
        if (semMovimento || duracao === 0) {
            elemento.textContent = para;
            return Promise.resolve();
        }
        const inicio = performance.now();
        return new Promise(function (pronto) {
            function quadro(agora) {
                const t = Math.min(1, (agora - inicio) / duracao);
                const freando = 1 - Math.pow(1 - t, 4);
                elemento.textContent = Math.round(de + (para - de) * freando);
                if (t < 1) {
                    requestAnimationFrame(quadro);
                } else {
                    pronto();
                }
            }
            requestAnimationFrame(quadro);
        });
    }

    // Mostra uma nota no anel e nos números. O anel anima sozinho pelo CSS (transition da --valor);
    // aqui só dizemos o valor novo e quanto tempo a animação dura.
    function mostrarNota(valor, duracao) {
        nota.style.setProperty('--duracao_anel', duracao + 'ms');
        nota.style.setProperty('--valor', valor);
        animarNumero(miniNota, notaNaTela, valor, duracao);
        const animacao = animarNumero(notaValor, notaNaTela, valor, duracao);
        notaNaTela = valor;
        return animacao;
    }

    // o pulso que sai do anel, na cor dada (o nome de uma variável do style.css)
    function pulsar(variavelDaCor) {
        nota.style.setProperty('--cor_pulso', 'var(' + variavelDaCor + ')');
        reiniciarAnimacao(nota, 'pulsa');
    }

    // Tira e põe de volta uma classe de animação, para ela tocar de novo.
    // Ler o offsetWidth no meio obriga o navegador a perceber que a classe saiu.
    function reiniciarAnimacao(elemento, classe) {
        elemento.classList.remove(classe);
        void elemento.offsetWidth;
        elemento.classList.add(classe);
    }

    // o item da gravidade na lista embaixo do anel ("1 crítica")
    function itemDaContagem(nome) {
        return notaCartao.querySelector('.nota_contagem [data-gravidade="' + nome + '"]');
    }

    // escreve "1 crítica", "2 altas", "0 baixas"...
    function escreverContagem(nome) {
        const n = achados[nome];
        const palavra = NOMES[nome][n === 1 ? 0 : 1];
        itemDaContagem(nome).querySelector('.nota_quantos').textContent = n + ' ' + palavra;
    }

    // avisa a nota nova para quem usa leitor de tela
    function avisarNota() {
        notaAviso.textContent = 'Nota ' + calcularNota() + ' de 100.';
    }


    // ---------- 3. A ANÁLISE DE EXEMPLO (o carregamento) ----------

    // Deixa o anel no zero, com o arco girando e as etapas à mostra, esperando a análise começar.
    function prepararAnalise() {
        nota.classList.add('sem_transicao');
        nota.style.setProperty('--valor', 0);
        void nota.offsetWidth;
        nota.classList.remove('sem_transicao');
        notaNaTela = 0;
        notaValor.textContent = '0';
        miniNota.textContent = '0';
        etapas.forEach(function (etapa) { etapa.classList.remove('ativa', 'feita'); });
        notaCartao.classList.add('analisando');
    }

    async function analisar() {
        if (analisando) return;
        analisando = true;
        travarControles();
        prepararAnalise();

        // 1. os três motores terminam, um de cada vez
        for (const etapa of etapas) {
            etapa.classList.add('ativa');
            await espera(600);
            etapa.classList.remove('ativa');
            etapa.classList.add('feita');
        }
        await espera(300);

        // 2. o resultado aparece: o anel enche até 100...
        notaCartao.classList.remove('analisando');
        notaCartao.classList.add('revelando');
        notaConta.textContent = '100';
        await mostrarNota(100, 700);

        // 3. ...e cada gravidade desconta a parte dela, da mais grave para a mais leve
        let conta = '100';
        let atual = 100;
        for (const nome of ORDEM) {
            itemDaContagem(nome).classList.add('acesa');
            if (achados[nome] === 0) continue;

            atual = Math.max(0, atual - peso[nome] * achados[nome]);
            conta += parteDaConta(nome);
            notaConta.textContent = conta;
            pulsar(COR[nome]);
            await mostrarNota(atual, 550);
            await espera(150);
        }

        // 4. fim: a conta completa e tudo aceso
        notaConta.textContent = textoDaConta();
        notaCartao.classList.remove('revelando');
        notaCartao.querySelectorAll('.nota_contagem li').forEach(function (item) {
            item.classList.remove('acesa');
        });
        avisarNota();

        analisando = false;
        travarControles();
    }

    botaoRepetir.addEventListener('click', analisar);


    // ---------- 4. O SIMULADOR ----------

    // Liga e desliga os botões: tudo travado durante a análise; fora dela,
    // o − fica desligado no zero e o + no nove.
    function travarControles() {
        botaoRepetir.disabled = analisando;
        secao.querySelectorAll('.contador_botao').forEach(function (botao) {
            const nome = botao.closest('.gravidade').dataset.gravidade;
            const passo = Number(botao.dataset.passo);
            const noLimite = (passo < 0 && achados[nome] === 0) || (passo > 0 && achados[nome] === 9);
            botao.disabled = analisando || noLimite;
        });
    }

    secao.querySelectorAll('.contador_botao').forEach(function (botao) {
        botao.addEventListener('click', function () {
            if (analisando) return;

            const caixa = botao.closest('.gravidade');
            const nome = caixa.dataset.gravidade;
            const passo = Number(botao.dataset.passo);
            achados[nome] = Math.min(9, Math.max(0, achados[nome] + passo));

            // o número do contador salta
            const valor = caixa.querySelector('.contador_valor');
            valor.textContent = achados[nome];
            reiniciarAnimacao(valor, 'muda');

            // a lista e a conta embaixo do anel acompanham
            escreverContagem(nome);
            reiniciarAnimacao(itemDaContagem(nome), 'muda');
            notaConta.textContent = textoDaConta();

            // o anel pulsa na cor da gravidade quando um achado entra, e em verde quando sai (foi corrigido)
            pulsar(passo > 0 ? COR[nome] : '--verde');
            mostrarNota(calcularNota(), 600);
            avisarNota();
            travarControles();
        });
    });


    // ---------- 5. OS CARTÕES ----------

    // A luz que segue o mouse: guarda a posição do mouse dentro da caixa em --x e --y.
    secao.querySelectorAll('.cartao_dossie, .gravidade').forEach(function (caixa) {
        caixa.addEventListener('pointermove', function (evento) {
            const area = caixa.getBoundingClientRect();
            caixa.style.setProperty('--x', (evento.clientX - area.left) + 'px');
            caixa.style.setProperty('--y', (evento.clientY - area.top) + 'px');
        });
    });

    // 1) A TRADUÇÃO. As letras viram símbolos aleatórios e vão se acertando da esquerda
    //    para a direita, como um código sendo decifrado.
    const traducao = document.getElementById('demo_traducao');
    const botaoTraducao = document.getElementById('botao_traducao');
    const cartaoTraducao = document.getElementById('cartao_traducao');
    let emPortugues = true;

    function embaralhar(elemento, textoFinal, duracao) {
        const simbolos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/{}=_-';
        const inicio = performance.now();
        return new Promise(function (pronto) {
            function quadro(agora) {
                const t = Math.min(1, (agora - inicio) / duracao);
                const acertadas = Math.floor(t * textoFinal.length);
                let texto = '';
                for (let i = 0; i < textoFinal.length; i++) {
                    const letra = textoFinal[i];
                    texto += (i < acertadas || letra === ' ') ? letra : simbolos[Math.floor(Math.random() * simbolos.length)];
                }
                elemento.textContent = texto;
                if (t < 1) {
                    requestAnimationFrame(quadro);
                } else {
                    pronto();
                }
            }
            requestAnimationFrame(quadro);
        });
    }

    function mostrarTraducao(paraPortugues, comAnimacao) {
        emPortugues = paraPortugues;
        const texto = paraPortugues ? traducao.dataset.simples : traducao.dataset.tecnico;
        traducao.classList.toggle('tecnico', !paraPortugues);
        botaoTraducao.textContent = paraPortugues ? 'Ver como outras ferramentas mostram' : 'Traduzir para português';
        if (!comAnimacao || semMovimento) {
            traducao.textContent = texto;
            return;
        }
        botaoTraducao.disabled = true;
        embaralhar(traducao, texto, 900).then(function () { botaoTraducao.disabled = false; });
    }

    botaoTraducao.addEventListener('click', function () {
        mostrarTraducao(!emPortugues, true);
    });

    // 2) O GRÁFICO DO HISTÓRICO. Mede o tamanho da linha para o CSS conseguir "desenhá-la".
    const grafico = document.getElementById('grafico');
    const linhaDoGrafico = grafico.querySelector('.grafico_linha');
    grafico.style.setProperty('--comprimento', linhaDoGrafico.getTotalLength());

    // 3) O FALSO POSITIVO: o botão risca o achado e mostra o aviso; de novo, desfaz.
    const linhaFalso = document.getElementById('demo_falso');
    const botaoFalso = document.getElementById('botao_falso');
    const avisoFalso = document.getElementById('aviso_falso');

    botaoFalso.addEventListener('click', function () {
        const dispensado = !linhaFalso.classList.contains('dispensado');
        linhaFalso.classList.toggle('dispensado', dispensado);
        avisoFalso.hidden = !dispensado;
        botaoFalso.textContent = dispensado ? 'Desfazer' : 'Não é problema';
    });

    // 4) O LAUDO: a barra enche em três passos, cada um com o que está sendo feito.
    const laudo = document.getElementById('demo_laudo');
    const barraLaudo = document.getElementById('laudo_barra');
    const statusLaudo = document.getElementById('laudo_status');
    const botaoLaudo = document.getElementById('botao_laudo');

    function encherBarra(porcento, semAnimacao) {
        barraLaudo.classList.toggle('sem_transicao', !!semAnimacao);
        barraLaudo.style.setProperty('--progresso', porcento + '%');
        barraLaudo.setAttribute('aria-valuenow', porcento);
    }

    async function gerarLaudo() {
        botaoLaudo.disabled = true;
        laudo.classList.remove('pronto');
        encherBarra(0, true);
        void barraLaudo.offsetWidth;

        const passos = [
            [35, 'Juntando os achados…'],
            [75, 'Escrevendo as explicações…'],
            [100, 'Montando o PDF…']
        ];
        for (const [ate, texto] of passos) {
            statusLaudo.textContent = texto;
            encherBarra(ate);
            await espera(semMovimento ? 0 : 750);
        }

        statusLaudo.textContent = 'Pronto: 2 páginas, nota ' + calcularNota() + '.';
        laudo.classList.add('pronto');
        botaoLaudo.textContent = 'Gerar de novo';
        botaoLaudo.disabled = false;
    }

    botaoLaudo.addEventListener('click', gerarLaudo);


    // ---------- 6. COMEÇO ----------

    // mostra os botões e o simulador, que no HTML ficam escondidos para quem está sem JavaScript
    secao.querySelectorAll('[data-com-js]').forEach(function (elemento) {
        elemento.hidden = false;
    });

    // a tradução começa no jeito técnico, para a diferença aparecer
    mostrarTraducao(false, false);

    // o laudo começa vazio, esperando o clique
    encherBarra(0, true);
    statusLaudo.textContent = 'Clique para gerar um laudo de exemplo.';

    travarControles();

    // Sem animação (ou em navegador antigo): tudo já fica no estado final.
    if (semMovimento || !('IntersectionObserver' in window)) {
        mostrarTraducao(true, false);
        return;
    }

    // Prepara cada parte para a animação dela, que só começa quando ela aparece na tela.
    prepararAnalise();
    grafico.classList.add('vai_desenhar');
    const pesos = secao.querySelectorAll('.gravidade_peso');
    pesos.forEach(function (elemento) { elemento.textContent = '0'; });

    // O IntersectionObserver avisa quando cada parte entra na tela (metade dela visível).
    const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting) return;
            observador.unobserve(entrada.target);

            if (entrada.target === notaCartao) {
                analisar();
            } else if (entrada.target === cartaoTraducao) {
                // espera um pouco e traduz sozinho, uma vez, para mostrar o efeito
                setTimeout(function () {
                    if (!emPortugues) mostrarTraducao(true, true);
                }, 900);
            } else if (entrada.target === grafico) {
                grafico.classList.add('desenhar');
            } else if (entrada.target === simulador) {
                // os pontos de cada gravidade contam do zero, um depois do outro
                pesos.forEach(function (elemento, i) {
                    const alvo = Number(elemento.closest('.gravidade').dataset.peso);
                    setTimeout(function () { animarNumero(elemento, 0, alvo, 900); }, i * 120);
                });
            }
        });
    }, { threshold: 0.5 });

    [notaCartao, cartaoTraducao, grafico, simulador].forEach(function (alvo) {
        observador.observe(alvo);
    });
})();
