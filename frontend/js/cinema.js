// CINEMA: A ABERTURA DO SITE E O MOVIMENTO NA ROLAGEM
//
// Usa bibliotecas carregadas antes deste arquivo, no fim de cada página:
//   GSAP           anima qualquer coisa numa linha do tempo (timeline), escolhendo tempo e curva;
//   ScrollTrigger  (do GSAP) liga uma animação à rolagem da página: é ele que faz o parallax;
//   SplitText      (do GSAP) quebra um título em linhas ou palavras, para animar cada pedaço;
//   Lenis          deixa a rolagem do mouse suave, com um pouco de inércia.
//
// O que acontece:
//   1) página inicial aberta direto: a abertura em forma de cofre (contador, scanner, portas
//      se abrindo) e depois a entrada do menu, do título e do cadeado;
//   2) outras páginas abertas direto: só a entrada do menu e do topo;
//   3) chegando por uma aba do menu: nada disso, quem anima é a transição do js/transicao.js;
//   4) sempre: rolagem suave, títulos subindo linha por linha, camadas em velocidades
//      diferentes (parallax) e a faixa verde se abrindo.
//
// O visual de cada peça está no css/cinema.css.

(function () {
    const raiz = document.documentElement;
    const abertura = document.getElementById('abertura');
    const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sem o GSAP (sem internet, por exemplo) ou para quem pediu menos movimento no sistema:
    // tira a abertura, mostra tudo e para por aqui. O site funciona igual, só sem o cinema.
    if (semMovimento || !window.gsap) {
        if (abertura) abertura.remove();
        raiz.classList.add('cinema_pronto');
        return;
    }

    // cada plugin só é usado se tiver carregado
    const temRolagem = !!window.ScrollTrigger;
    const temTexto = !!window.SplitText;
    if (temRolagem) gsap.registerPlugin(ScrollTrigger);
    if (temTexto) gsap.registerPlugin(SplitText);


    // ---------- 1. ROLAGEM SUAVE ----------

    // O Lenis segura a rolagem do mouse e a solta aos poucos (lerp: quanto anda por quadro).
    // O relógio dele passa a ser o do GSAP, para a rolagem e as animações andarem juntas.
    let lenis = null;
    if (window.Lenis) {
        lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
        if (temRolagem) lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (tempo) { lenis.raf(tempo * 1000); });
        gsap.ticker.lagSmoothing(0);
    }


    // ---------- 2. AS ENTRADAS ----------

    // Depois de cada entrada, o clearProps tira os estilos que o GSAP deixou nos elementos.
    // Sem isso, o "transform" que ficou escrito no elemento ganharia do :hover do CSS
    // e os botões parariam de subir com o mouse em cima.
    const LIMPAR = 'transform,opacity,visibility,filter';

    // as três partes do cabeçalho descem, uma depois da outra
    function entradaDoCabecalho() {
        return gsap.from('header .logo_tipos, header .navegacao, header .header_acoes', {
            y: -28, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: LIMPAR
        });
    }

    // Reinicia a animação do cadeado da página inicial, para ela tocar junto com a entrada.
    // Mudar o fim do endereço (o #) faz o navegador desenhar a ilustração de novo, do começo.
    function reiniciarIlustracao() {
        const ilustracao = document.querySelector('.hero_imagem img');
        if (ilustracao) ilustracao.src = ilustracao.getAttribute('src').split('#')[0] + '#de-novo';
    }

    // a entrada da página inicial: menu, título linha por linha, texto, botões e cadeado
    function entradaDoInicio() {
        const linha = gsap.timeline({ defaults: { ease: 'power4.out' } });
        linha.add(entradaDoCabecalho(), 0)
            .from('.hero .titulo_texto', { yPercent: 115, duration: 1.2, stagger: 0.1, clearProps: 'transform' }, 0.05)
            .from('.hero_texto > p', { y: 24, autoAlpha: 0, duration: 0.9, clearProps: LIMPAR }, 0.45)
            .from('.hero_texto > a', { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.1, clearProps: LIMPAR }, 0.6)
            .from('.hero_imagem img', {
                scale: 0.86, autoAlpha: 0, filter: 'blur(14px)', duration: 1.5, ease: 'power3.out',
                clearProps: LIMPAR, onStart: reiniciarIlustracao
            }, 0.15)
            .from('.hero_fundo', { yPercent: 35, autoAlpha: 0, duration: 1.8, ease: 'power3.out' }, 0.3);
        return linha;
    }

    // a entrada das outras páginas: menu, etiqueta, título linha por linha, texto e atalhos
    function entradaDaPagina() {
        const linha = gsap.timeline({ defaults: { ease: 'power4.out' } });
        linha.add(entradaDoCabecalho(), 0);

        const topo = document.querySelector('.pagina_topo');
        if (!topo) return linha;

        linha.from(topo.querySelector('.etiqueta'), { y: 16, autoAlpha: 0, duration: 0.8, clearProps: LIMPAR }, 0.1);

        const titulo = topo.querySelector('h1');
        if (temTexto) {
            // mask: 'lines' põe cada linha numa janela; o texto sobe de baixo para dentro dela.
            // No fim, revert() devolve o título ao HTML original.
            const partes = SplitText.create(titulo, { type: 'lines', mask: 'lines' });
            linha.from(partes.lines, {
                yPercent: 110, duration: 1.1, stagger: 0.1, onComplete: function () { partes.revert(); }
            }, 0.15);
        } else {
            linha.from(titulo, { y: 30, autoAlpha: 0, duration: 1, clearProps: LIMPAR }, 0.15);
        }

        linha.from(topo.querySelectorAll(':scope > p:not(.etiqueta)'), { y: 20, autoAlpha: 0, duration: 0.9, clearProps: LIMPAR }, 0.45);

        const atalhos = topo.querySelectorAll('.atalhos a');
        if (atalhos.length) {
            linha.from(atalhos, { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.06, clearProps: LIMPAR }, 0.6);
        }
        return linha;
    }


    // ---------- 3. A ABERTURA DA PÁGINA INICIAL ----------

    // completa: com contador e motores (a primeira vez na sessão);
    // curta: só a linha do scanner e as portas (nas vezes seguintes, para não cansar).
    function tocarAbertura(completa) {
        // desliga o plano B do CSS (a abertura sumir sozinha em 4 segundos) e trava a rolagem
        abertura.style.animation = 'none';
        if (lenis) lenis.stop();

        const portaCima = abertura.querySelector('.abertura_porta_cima');
        const portaBaixo = abertura.querySelector('.abertura_porta_baixo');
        const conteudo = abertura.querySelector('.abertura_conteudo');
        const linhaScanner = abertura.querySelector('.abertura_linha');
        const barra = abertura.querySelector('.abertura_barra span');
        const numero = abertura.querySelector('.abertura_numero span');
        const texto = abertura.querySelector('.abertura_texto');

        const linha = gsap.timeline();

        // na curta não tem contagem: fica só a linha do scanner e as portas
        if (!completa) {
            gsap.set(abertura.querySelectorAll('.abertura_logo, .abertura_barra, .abertura_hud, .abertura_numero'), { autoAlpha: 0 });
        }

        if (completa) {
            // um objeto qualquer com um número: o GSAP anima o número e a cada quadro
            // a função onUpdate escreve ele na tela e estica a barra
            const contador = { valor: 0 };
            const escrever = function (frase) { texto.textContent = frase; };

            linha.from(abertura.querySelector('.abertura_logo'), { autoAlpha: 0, scale: 0.9, duration: 0.7, ease: 'power3.out' }, 0)
                .from(abertura.querySelectorAll('.abertura_hud, .abertura_numero'), { autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.1)
                .to(contador, {
                    valor: 100, duration: 2, ease: 'power2.inOut',
                    onUpdate: function () {
                        numero.textContent = String(Math.round(contador.valor)).padStart(3, '0');
                        barra.style.transform = 'scaleX(' + (contador.valor / 100) + ')';
                    }
                }, 0.2)
                .call(escrever, ['caçador de segredos ✓'], 0.75)
                .call(escrever, ['mapa de rotas ✓'], 1.3)
                .call(escrever, ['dependências ✓'], 1.85)
                .call(escrever, ['acesso liberado'], 2.2);
        }

        // a saída: a linha do scanner corta o meio, o conteúdo some e as portas se abrem
        const saida = completa ? 2.35 : 0.1;
        linha.fromTo(linhaScanner, { scaleX: 0 }, { scaleX: 1, duration: completa ? 0.55 : 0.4, ease: 'power3.inOut' }, saida)
            .to(conteudo, { autoAlpha: 0, y: -16, duration: 0.35, ease: 'power2.in' }, saida)
            .addLabel('portas', saida + (completa ? 0.45 : 0.3))
            .to(portaCima, { yPercent: -100, duration: 1.05, ease: 'power4.inOut' }, 'portas')
            .to(portaBaixo, { yPercent: 100, duration: 1.05, ease: 'power4.inOut' }, 'portas')
            .to(linhaScanner, { autoAlpha: 0, duration: 0.45 }, 'portas+=0.15')
            .add(entradaDoInicio(), 'portas+=0.35')
            .call(liberar, null, 'portas+=1.05');

        // clicar, apertar uma tecla ou girar a roda do mouse acelera o que falta
        const EVENTOS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
        function acelerar() { linha.timeScale(4); }
        EVENTOS.forEach(function (evento) { addEventListener(evento, acelerar, { passive: true }); });

        // as portas já abriram: some com a abertura e devolve a rolagem
        function liberar() {
            abertura.remove();
            if (lenis) lenis.start();
            EVENTOS.forEach(function (evento) { removeEventListener(evento, acelerar); });
            linha.timeScale(1);
            try { sessionStorage.setItem('spycode-abertura-vista', 'sim'); } catch (erro) { /* sem memória: a próxima também será completa */ }
        }
    }


    // ---------- 4. O MOVIMENTO NA ROLAGEM ----------

    function prepararRolagem() {
        if (!temRolagem) return;

        if (temTexto) {
            // 4.1 Os títulos das seções sobem linha por linha quando aparecem na tela.
            //     autoSplit refaz a divisão em linhas se a largura da tela mudar.
            gsap.utils.toArray('.secao_cabecalho h2, .recurso_texto h2, .dono h2').forEach(function (titulo) {
                SplitText.create(titulo, {
                    type: 'lines', mask: 'lines', autoSplit: true,
                    onSplit: function (partes) {
                        return gsap.from(partes.lines, {
                            yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.1,
                            scrollTrigger: { trigger: titulo, start: 'top 88%', once: true }
                        });
                    }
                });
            });

            // 4.2 A frase da faixa verde sai do desfoque palavra por palavra, conforme a página desce
            //     (scrub: a animação anda junto com a rolagem, para frente e para trás).
            gsap.utils.toArray('.cta h2').forEach(function (frase) {
                SplitText.create(frase, {
                    type: 'words', autoSplit: true,
                    onSplit: function (partes) {
                        return gsap.from(partes.words, {
                            autoAlpha: 0.15, filter: 'blur(8px)', y: 12, stagger: 0.08, ease: 'none',
                            scrollTrigger: { trigger: frase, start: 'top 92%', end: 'top 55%', scrub: true }
                        });
                    }
                });
            });
        }

        // 4.3 A faixa verde se abre dos lados para o meio enquanto entra na tela.
        gsap.utils.toArray('.cta').forEach(function (faixa) {
            gsap.fromTo(faixa,
                { clipPath: 'inset(0% 7% 0% 7% round 20px)' },
                {
                    clipPath: 'inset(0% 0% 0% 0% round 20px)', ease: 'none',
                    scrollTrigger: { trigger: faixa, start: 'top bottom', end: 'top 60%', scrub: true }
                });
        });

        // 4.4 Parallax: cada elemento com data-parallax anda numa velocidade diferente da página.
        //     O número é a força: 0.1 faz o elemento andar 10% da altura da tela
        //     enquanto atravessa a tela inteira, devagar e para cima.
        gsap.utils.toArray('[data-parallax]').forEach(function (camada) {
            const forca = Number(camada.dataset.parallax) || 0.1;
            gsap.fromTo(camada,
                { y: function () { return innerHeight * forca / 2; } },
                {
                    y: function () { return -innerHeight * forca / 2; }, ease: 'none',
                    scrollTrigger: { trigger: camada, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
                });
        });

        // 4.5 A página inicial ganha profundidade ao descer: o texto sobe mais rápido e some,
        //     o cadeado desce devagar e encolhe um pouco, e a palavra gigante desliza para o lado.
        const hero = document.querySelector('.hero');
        if (hero) {
            gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
                .to('.hero_texto', { y: -90, autoAlpha: 0.15, ease: 'none' }, 0)
                .to('.hero_imagem', { y: 70, scale: 0.92, ease: 'none' }, 0)
                .to('.hero_fundo', { xPercent: -14, ease: 'none' }, 0);
        }

        // 4.6 O topo das outras páginas fica para trás devagar e vai sumindo ao descer.
        gsap.utils.toArray('.pagina_topo').forEach(function (topo) {
            gsap.to(topo, {
                y: 40, autoAlpha: 0.2, ease: 'none',
                scrollTrigger: { trigger: topo, start: 'top top', end: 'bottom top', scrub: true }
            });
        });

        // as fontes mudam o tamanho dos textos quando terminam de carregar: refaz as contas
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }


    // ---------- 5. COMEÇO ----------

    let comecou = false;

    // As fontes do Google Fonts chegam um pouco depois da página. Para dividir um título em
    // linhas, o SplitText precisa delas (com outra fonte, as linhas quebrariam em outro lugar).
    // Espera no máximo 1,2 segundo, para a entrada nunca ficar presa.
    function fontesProntas() {
        return Promise.race([
            document.fonts.ready,
            new Promise(function (pronto) { setTimeout(pronto, 1200); })
        ]);
    }

    // As entradas já deixaram tudo no ponto de partida: o CSS pode parar de esconder.
    function liberarPagina() {
        raiz.classList.add('cinema_pronto');
        prepararRolagem();
    }

    function comecar() {
        if (comecou) return;
        comecou = true;

        const direta = raiz.dataset.chegada !== 'aba';

        if (abertura) {
            if (direta) {
                let jaViu = false;
                try { jaViu = sessionStorage.getItem('spycode-abertura-vista') === 'sim'; } catch (erro) { /* segue sem memória */ }
                tocarAbertura(!jaViu);
            } else {
                abertura.remove();
            }
            liberarPagina();
        } else if (direta) {
            fontesProntas().then(function () {
                entradaDaPagina();
                liberarPagina();
            });
        } else {
            liberarPagina();
        }
    }

    // Espera o js/transicao.js dizer como a pessoa chegou (direto ou por uma aba do menu).
    // Se ele não avisar em 1,5 segundo, começa assim mesmo (menos numa página pré-carregada,
    // que ainda nem apareceu: ela espera o aviso, que vem quando a pessoa clica).
    if (raiz.dataset.chegadaPronta) {
        comecar();
    } else {
        document.addEventListener('spycode:chegada', comecar, { once: true });
        if (!document.prerendering) setTimeout(comecar, 1500);
    }
})();
