// VARREDURA: A ANIMAÇÃO DOS BOTÕES "ESCANEAR"
//
// Todo link com o atributo data-varredura (o "Escanear repositório" da página inicial e o
// "Escanear agora" da faixa verde) toca esta animação antes de abrir a tela de login:
//   1) a tela se abre num círculo que nasce do botão clicado e vira um editor de código;
//   2) um feixe verde desce pelas linhas; ao passar por um problema, a linha acende na cor
//      da gravidade e ganha uma etiqueta ("chave exposta", "rota sem login"...);
//   3) um cadeado se fecha no meio da tela e pede o login;
//   4) a página troca para a tela de login, que tem a própria entrada (css/login-entrada.css).
//
// Usa o GSAP, que as páginas já carregam para o js/cinema.js. Sem ele, ou para quem pediu
// menos movimento no sistema, o link funciona como um link comum: abre o login direto.
// Clicar, girar a roda do mouse ou apertar Esc durante a animação pula direto para o login.
// O visual está no css/varredura.css.

(function () {
    const links = document.querySelectorAll('a[data-varredura]');
    if (!links.length) return;

    // O código que aparece no editor (um projeto de exemplo, o mesmo do terminal da página inicial).
    // Cada linha é um texto em HTML, com <span> para as cores. As linhas com problema dizem a
    // gravidade e a etiqueta que acende quando o feixe passa por elas.
    const LINHAS = [
        { codigo: `<span class="cod_chave">const</span> express = <span class="cod_funcao">require</span>(<span class="cod_texto">'express'</span>);` },
        { codigo: `<span class="cod_chave">const</span> cors = <span class="cod_funcao">require</span>(<span class="cod_texto">'cors'</span>);` },
        {
            codigo: `<span class="cod_chave">const</span> _ = <span class="cod_funcao">require</span>(<span class="cod_texto">'lodash'</span>); <span class="cod_comentario">// 4.17.15</span>`,
            gravidade: 'alta', etiqueta: 'biblioteca com falha'
        },
        { codigo: `<span class="cod_chave">const</span> app = <span class="cod_funcao">express</span>();` },
        { codigo: `` },
        {
            codigo: `app.<span class="cod_funcao">use</span>(<span class="cod_funcao">cors</span>({ origin: <span class="cod_texto">'*'</span> }));`,
            gravidade: 'media', etiqueta: 'CORS aberto'
        },
        { codigo: `app.<span class="cod_funcao">use</span>(express.<span class="cod_funcao">json</span>());` },
        { codigo: `` },
        {
            codigo: `<span class="cod_chave">const</span> PAGAMENTO_CHAVE = <span class="cod_texto">'sk_live_••••••••••••4f2a'</span>;`,
            gravidade: 'critica', etiqueta: 'chave exposta'
        },
        { codigo: `` },
        { codigo: `app.<span class="cod_funcao">get</span>(<span class="cod_texto">'/api/tarefas'</span>, auth, listarTarefas);` },
        { codigo: `app.<span class="cod_funcao">post</span>(<span class="cod_texto">'/api/tarefas'</span>, auth, criarTarefa);` },
        {
            codigo: `app.<span class="cod_funcao">delete</span>(<span class="cod_texto">'/users/:id'</span>, removerUsuario);`,
            gravidade: 'alta', etiqueta: 'rota sem login'
        },
        {
            codigo: `app.<span class="cod_funcao">get</span>(<span class="cod_texto">'/admin/usuarios'</span>, listarUsuarios);`,
            gravidade: 'alta', etiqueta: 'rota sem login'
        },
        { codigo: `` },
        { codigo: `app.<span class="cod_funcao">listen</span>(<span class="cod_texto">3000</span>);` }
    ];

    // o mesmo desenho do cadeado do botão "Escanear repositório": a argola é separada para poder fechar
    const CADEADO = `
        <svg viewBox="0 0 20 22" aria-hidden="true">
            <path class="varredura_argola" d="M6.5 10V6.5a3.5 3.5 0 0 1 7 0V10" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path fill="currentColor" fill-rule="evenodd"
                d="M5.5 9h9A2.5 2.5 0 0 1 17 11.5v6a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 17.5v-6A2.5 2.5 0 0 1 5.5 9zM10 12.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
        </svg>`;

    // enquanto a animação toca, um segundo clique não começa outra
    let tocando = false;


    // ---------- 1. MONTAR A TELA ----------

    function montarTela() {
        const linhasHTML = LINHAS.map(function (linha, i) {
            const gravidade = linha.gravidade ? ` data-gravidade="${linha.gravidade}"` : '';
            const etiqueta = linha.etiqueta ? `<span class="varredura_etiqueta">${linha.etiqueta}</span>` : '';
            return `<div class="varredura_linha"${gravidade}><span class="numero">${i + 1}</span><code>${linha.codigo}</code>${etiqueta}</div>`;
        }).join('');

        const tela = document.createElement('div');
        tela.className = 'varredura';
        // é só animação: o leitor de tela pula e anuncia direto a tela de login
        tela.setAttribute('aria-hidden', 'true');
        tela.innerHTML = `
            <div class="varredura_editor">
                <div class="terminal_barra">
                    <span></span><span></span><span></span>
                    <small class="terminal_titulo">app-de-tarefas · src/app.js</small>
                </div>
                <div class="varredura_codigo">
                    ${linhasHTML}
                    <span class="varredura_feixe"></span>
                </div>
            </div>
            <div class="varredura_painel">
                <div>
                    <p class="varredura_comando">spycode scan app-de-tarefas</p>
                    <ul class="varredura_motores">
                        <li>segredos</li>
                        <li>rotas</li>
                        <li>dependências</li>
                    </ul>
                </div>
                <p class="varredura_contador"><span>000</span><small>%</small></p>
            </div>
            <div class="varredura_final">
                <span class="varredura_cadeado">${CADEADO}</span>
                <p class="varredura_final_etiqueta">Acesso restrito</p>
                <h2>Identifique-se, agente.</h2>
                <p class="varredura_final_texto">Entre para escanear o seu repositório.</p>
            </div>`;
        return tela;
    }

    // Pede a tela de login ao servidor já no começo da animação: quando ela acabar,
    // o login está pronto e a troca de página é rápida.
    function carregarAntes(endereco) {
        const aviso = document.createElement('link');
        aviso.rel = 'prefetch';
        aviso.href = endereco;
        document.head.appendChild(aviso);
    }


    // ---------- 2. A ANIMAÇÃO ----------

    function tocar(link) {
        tocando = true;
        const destino = link.href;
        carregarAntes(destino);

        const tela = montarTela();
        document.body.appendChild(tela);

        const editor = tela.querySelector('.varredura_editor');
        const codigo = tela.querySelector('.varredura_codigo');
        const linhas = tela.querySelectorAll('.varredura_linha');
        const feixe = tela.querySelector('.varredura_feixe');
        const painel = tela.querySelector('.varredura_painel');
        const numero = tela.querySelector('.varredura_contador span');
        const motores = tela.querySelectorAll('.varredura_motores li');
        const final = tela.querySelector('.varredura_final');
        const cadeado = tela.querySelector('.varredura_cadeado');
        const argola = tela.querySelector('.varredura_argola');

        // O círculo nasce no meio do botão e cresce até cobrir o canto mais longe da tela
        // (Math.hypot mede a distância em linha reta até esse canto).
        const area = link.getBoundingClientRect();
        const x = area.left + area.width / 2;
        const y = area.top + area.height / 2;
        const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

        const linha = gsap.timeline({ onComplete: irParaOLogin });

        // 1. a tela se abre e o editor entra, linha por linha
        linha.fromTo(tela,
            { clipPath: `circle(0px at ${x}px ${y}px)` },
            { clipPath: `circle(${raio}px at ${x}px ${y}px)`, duration: 0.6, ease: 'power3.inOut' })
            .from(editor, { y: 30, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, 0.25)
            .from(linhas, { x: -14, autoAlpha: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out' }, 0.35)
            .from(painel, { y: 16, autoAlpha: 0, duration: 0.4, ease: 'power3.out' }, 0.45);

        // 2. o feixe desce pelo código. A borda forte do feixe sai do topo das linhas (y = 0)
        //    e chega no fim delas (y = altura do código) em "duracao" segundos.
        const inicio = 0.8;
        const duracao = 1.4;
        const altura = codigo.offsetHeight;

        linha.fromTo(feixe, { y: 0 }, { y: altura + 90, duration: duracao * (altura + 90) / altura, ease: 'none' }, inicio);

        // cada linha com problema acende no instante em que o feixe passa pelo meio dela
        linhas.forEach(function (elemento) {
            if (!elemento.dataset.gravidade) return;
            const quando = inicio + ((elemento.offsetTop + elemento.offsetHeight / 2) / altura) * duracao;
            linha.call(function () { elemento.classList.add('achou'); }, null, quando)
                .fromTo(elemento.querySelector('.varredura_etiqueta'),
                    { x: 12, autoAlpha: 0 },
                    { x: 0, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)' }, quando);
        });

        // a porcentagem conta junto com o feixe, e cada motor termina num terço do caminho
        const contador = { valor: 0 };
        linha.to(contador, {
            valor: 100, duration: duracao, ease: 'none',
            onUpdate: function () { numero.textContent = String(Math.round(contador.valor)).padStart(3, '0'); }
        }, inicio);
        motores.forEach(function (motor, i) {
            linha.call(function () { motor.classList.add('feito'); }, null, inicio + duracao * (i + 1) / 3);
        });

        // 3. o código fica para trás, apagado, e o cadeado aparece aberto e se fecha
        const fim = inicio + duracao;
        gsap.set(argola, { svgOrigin: '6.5 9.5', rotation: -32, y: -2.5 });

        linha.to([editor, painel], { autoAlpha: 0.15, scale: 0.97, filter: 'blur(3px)', duration: 0.5, ease: 'power2.out' }, fim + 0.05)
            .to(final, { autoAlpha: 1, duration: 0.3 }, fim + 0.1)
            .from(cadeado, { scale: 0.5, autoAlpha: 0, duration: 0.6, ease: 'back.out(2)' }, fim + 0.1)
            .to(argola, { rotation: 0, y: 0, duration: 0.3, ease: 'power3.in' }, fim + 0.5)
            // o "clique" do cadeado fechando: um anel verde que se espalha e some
            .fromTo(cadeado,
                { boxShadow: '0 0 0 0 rgba(43, 217, 107, 0.55)' },
                { boxShadow: '0 0 0 26px rgba(43, 217, 107, 0)', duration: 0.7, ease: 'power2.out' }, fim + 0.8)
            .from(final.querySelectorAll('p, h2'), { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, fim + 0.25)
            // uma pausa para dar tempo de ler antes de trocar de página
            .to({}, { duration: 0.5 });

        // pular: clique, roda do mouse ou Esc levam direto ao fim (e o fim abre o login)
        function pular(evento) {
            if (evento.type === 'keydown' && evento.key !== 'Escape') return;
            linha.progress(1);
        }
        tela.addEventListener('pointerdown', pular);
        addEventListener('wheel', pular, { passive: true });
        addEventListener('keydown', pular);

        function irParaOLogin() {
            removeEventListener('wheel', pular);
            removeEventListener('keydown', pular);
            location.assign(destino);
        }
    }


    // ---------- 3. OS CLIQUES ----------

    links.forEach(function (link) {
        link.addEventListener('click', function (evento) {
            // abrir em outra aba (Ctrl, Shift, Cmd ou o botão do meio): o navegador faz o normal
            if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;

            // sem o GSAP ou com "menos movimento": o link abre o login direto
            const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!window.gsap || semMovimento) return;

            evento.preventDefault();
            if (!tocando) tocar(link);
        });
    });

    // Voltando para esta página pelo botão Voltar, o navegador pode mostrá-la exatamente como
    // ela ficou, com a varredura ainda na tela. Então a varredura sai e os botões voltam a funcionar.
    function limpar() {
        document.querySelectorAll('.varredura').forEach(function (tela) { tela.remove(); });
        tocando = false;
    }

    addEventListener('pageshow', function (evento) {
        if (evento.persisted) limpar();
    });
    addEventListener('pagereveal', limpar);
})();
