// VARREDURA: A ANIMAÇÃO DOS BOTÕES "ESCANEAR"
//
// Todo link com o atributo data-varredura (o "Escanear repositório" da página inicial e o
// "Escanear agora" da faixa verde) toca esta animação antes de abrir a tela de login:
//   1) a tela se abre num círculo que nasce do botão clicado e vira um editor de código;
//   2) um feixe verde desce pelas linhas; ao passar por um problema, a linha acende na cor
//      da gravidade e ganha uma etiqueta ("chave exposta", "rota sem login"...);
//   3) a logo do SpyCode se monta no meio da tela, com uma animação só desta tela
//      (a lupa é desenhada, um radar revela o espião, o nome passa por um scanner);
//   4) a página troca para a tela de login: a logo voa até o lugar do logo de lá, e o resto
//      do login tem a própria entrada (css/login-entrada.css).
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

    // A LOGO DO FIM: os mesmos desenhos do img/logo-animado.svg (lupa, espião e nome, no mesmo
    // tamanho de 654 x 232), separados em camadas para a animação da parte 3. Cada camada
    // começa escondida no css/varredura.css.
    const LOGO = `
        <svg class="varredura_logo" viewBox="0 0 654 232" aria-hidden="true">
            <defs>
                <!-- brilho verde em volta do traço, da faísca, dos brilhos e da barra do scanner -->
                <filter id="varredura_brilho" filterUnits="userSpaceOnUse" x="-60" y="-60" width="780" height="360">
                    <feGaussianBlur stdDeviation="5" result="borrado" />
                    <feMerge>
                        <feMergeNode in="borrado" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <!-- o formato do vidro: o radar não passa dele -->
                <clipPath id="varredura_vidro">
                    <circle cx="104" cy="104" r="78" />
                </clipPath>

                <!-- o espião só aparece onde o radar já passou. Um círculo de traço bem grosso, desenhado
                     aos poucos em volta do centro, vira uma "pizza" que cresce até cobrir o vidro todo -->
                <mask id="varredura_revela" maskUnits="userSpaceOnUse" x="0" y="0" width="654" height="232">
                    <path class="logo_revela" d="M 104 64.5 A 39.5 39.5 0 0 1 104 143.5 A 39.5 39.5 0 0 1 104 64.5"
                        fill="none" stroke="#FFFFFF" stroke-width="79" />
                </mask>

                <!-- a janela por onde o nome aparece: cresce da esquerda para a direita junto com a barra -->
                <clipPath id="varredura_nome">
                    <rect class="logo_nome_janela" x="232" y="56" width="0" height="120" />
                </clipPath>

                <!-- o rastro do radar: forte junto do ponteiro e sumindo para trás -->
                <linearGradient id="varredura_rastro" x1="104" y1="0" x2="54" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#2BD96B" stop-opacity="0.45" />
                    <stop offset="1" stop-color="#2BD96B" stop-opacity="0" />
                </linearGradient>
            </defs>

            <!-- 1. LUPA: o sinal de sonar (atrás de tudo, para não riscar o aro), o vidro, o traço verde
                 que desenha o aro e o cabo, e o aro branco de verdade -->
            <circle class="logo_sonar" cx="104" cy="104" r="100" fill="none" stroke="#2BD96B" stroke-width="3" />
            <circle class="logo_sonar" cx="104" cy="104" r="100" fill="none" stroke="#2BD96B" stroke-width="3" />
            <circle class="logo_vidro" cx="104" cy="104" r="78" fill="#2BD96B" fill-opacity="0.1" />
            <path class="logo_traco" d="M 166 166 A 87.7 87.7 0 0 1 42 42 A 87.7 87.7 0 0 1 166 166 L 211 211"
                fill="none" stroke="#2BD96B" stroke-width="22" stroke-linecap="round" filter="url(#varredura_brilho)" />
            <path class="logo_aro" fill="#FFFFFF" fill-rule="evenodd" d="M 92.1 6.3 C 57.4 11.3, 29.3 31.7, 14.6 62.4 C -1.5 96, 3.3 135.6, 26.9 164.8 C 59.1 204.7, 115.4 213.9, 157.7 186.1 L 162.3 183.1 182.8 203.6 C 205.4 226.1, 205.6 226.3, 211.7 226.3 C 217.5 226.3, 222.2 223.4, 225.1 218.1 C 226.6 215.3, 226.4 207.9, 224.8 204.7 C 223.9 203.1, 216.7 195.5, 203.5 182.3 L 183.6 162.2 186.9 157.1 C 212.3 118.5, 207 67.6, 174.1 34.9 C 160.1 21, 143.7 12, 124.3 7.8 C 118.8 6.6, 116.5 6.4, 105.9 6.3 C 99.2 6.2, 93 6.2, 92.1 6.3 M 95.6 26.5 C 70.5 29.2, 46.9 45.1, 34.9 67.6 C 18.7 98, 24.4 134, 49.2 158.8 C 60.6 170.3, 73.2 177.2, 88.8 180.5 C 96.7 182.2, 111.3 182.2, 119.2 180.5 C 150.4 173.8, 174.4 149.6, 181 118.1 C 182.5 111, 182.7 98.3, 181.3 90.9 C 174.6 54.1, 144 27.8, 106.4 26.3 C 103 26.2, 98.1 26.3, 95.6 26.5" />

            <!-- 2. RADAR: o ponteiro e o rastro, que giram em volta do centro do vidro -->
            <g clip-path="url(#varredura_vidro)">
                <g class="logo_radar">
                    <path d="M 104 104 L 104 26 A 78 78 0 0 0 53.9 44.2 Z" fill="url(#varredura_rastro)" />
                    <line x1="104" y1="104" x2="104" y2="26" stroke="#2BD96B" stroke-width="3" stroke-linecap="round" />
                </g>
            </g>

            <!-- 3. ESPIÃO: gola, rosto e chapéu, revelados pela máscara do radar -->
            <g mask="url(#varredura_revela)">
                <g class="logo_espiao" fill="#FFFFFF">
                    <path d="M 62.2 129.5 C 62.2 130.8, 66.8 140.8, 68.8 143.8 C 74.1 151.8, 84.4 158.3, 94.4 160.1 L 96 160.4 93.1 151.9 C 91.5 147.2, 90 143.3, 89.8 143.1 C 89.6 142.9, 85.3 141.1, 80.2 139.1 C 70.6 135.3, 66.8 133.3, 63.9 130.6 C 62.9 129.6, 62.2 129.2, 62.2 129.5" />
                    <path d="M 145 131 C 142.1 133.6, 137.3 136, 128 139.6 C 123.7 141.3, 119.9 142.9, 119.6 143.2 C 118.8 143.9, 113.2 159.9, 113.7 160.3 C 114.3 161, 121.2 158.9, 125.6 156.6 C 133 152.9, 139.2 146.9, 142.9 139.8 C 144.5 136.7, 147.7 129.1, 147.3 129.1 C 147.3 129.1, 146.2 130, 145 131" />
                    <path d="M 60.8 104.7 C 59.4 106.1, 61.5 119.2, 64 124.5 C 66.7 130.4, 68.2 131.4, 82.6 137 C 87.5 138.9, 91.9 140.8, 92.2 141.2 C 92.5 141.5, 94.2 146, 95.9 151.1 C 99.4 161.6, 98.7 161, 106.1 161 L 110.1 161 113.5 150.9 L 117 140.9 126.2 137.3 C 139 132.2, 141.9 130.5, 144 127.1 C 146.9 122.3, 148.5 115.5, 148.5 108.4 L 148.6 104.7 147.1 105 C 146.2 105.1, 143.7 105.5, 141.3 105.9 C 137.6 106.6, 137 106.8, 136.6 108 C 136.3 108.8, 135.8 109.6, 135.4 109.9 C 135 110.2, 134.1 112.5, 133.5 114.9 C 132.2 120.4, 131.3 121.7, 128.2 123.2 C 126.2 124.2, 124.8 124.4, 120.8 124.4 C 113.1 124.4, 110.3 122.5, 108 115.8 C 106.8 112.1, 106.1 111.3, 104.6 111.3 C 103.1 111.3, 101.8 112.7, 101.3 114.8 C 100.6 117.7, 98.4 121.4, 96.8 122.6 C 93.4 125, 85.2 125.3, 80.9 123.1 C 78.1 121.7, 76.2 118.6, 75.5 114.3 C 75.1 111.8, 74.6 110.7, 74 110.5 C 73.4 110.3, 72.9 109.5, 72.8 108.5 C 72.7 106.8, 72.6 106.7, 68.9 106.1 C 66.8 105.8, 64.2 105.2, 63.1 104.9 C 62 104.6, 61 104.5, 60.8 104.7" />
                    <path d="M 67.6 71.2 C 66.6 73.2, 65.8 79.6, 66.1 84.1 C 66.3 88.4, 66.3 88.6, 65.2 88.9 C 64.6 89, 62.4 89.5, 60.4 90 C 49.9 92.3, 47 95.9, 53.2 98.8 C 70.9 107.1, 127.6 108.2, 150.8 100.7 C 162.1 97, 161.3 93, 148.6 90 C 142.4 88.6, 142.5 88.6, 142.9 87.6 C 144 84.7, 142.8 72.1, 141.3 70.8 C 139.9 69.7, 128.5 72.9, 128.6 74.4 C 128.6 74.7, 129.4 77.5, 130.5 80.7 C 131.5 84, 132.4 86.9, 132.4 87.3 C 132.4 88.2, 125.7 90.1, 118 91.4 C 110.3 92.7, 95 92.5, 88.3 91.1 C 82.6 89.8, 76.7 88, 76.7 87.5 C 76.7 87.2, 77.6 84.2, 78.6 80.7 C 79.7 77.3, 80.4 74.2, 80.1 74 C 79.4 73.3, 72.9 70.9, 70.4 70.5 C 68.5 70.2, 68.1 70.3, 67.6 71.2" />
                    <path d="M 91.3 57.5 C 89.3 58.6, 88 61.3, 84.5 71.5 C 82.1 78.5, 81.6 80.7, 82.1 81 C 83.2 81.7, 91 83.1, 97.3 83.8 C 103 84.4, 111.5 84.1, 117.1 83.2 C 121.1 82.5, 127.5 81, 127.5 80.7 C 127.5 80.6, 126 76, 124.2 70.5 C 119.5 56.1, 118 54.7, 110.6 58.4 C 108.3 59.6, 106.5 60.1, 104.8 60.1 C 103.1 60.1, 101.3 59.6, 99 58.4 C 95.4 56.6, 93.4 56.4, 91.3 57.5" />
                </g>
            </g>

            <!-- 4. DETALHES: o brilho em cada lente dos óculos e a faísca na ponta do traço -->
            <path class="logo_brilho" d="M 82 102 L 84.2 109.8 L 92 112 L 84.2 114.2 L 82 122 L 79.8 114.2 L 72 112 L 79.8 109.8 Z"
                fill="#FFFFFF" filter="url(#varredura_brilho)" />
            <path class="logo_brilho" d="M 117 102 L 119.2 109.8 L 127 112 L 119.2 114.2 L 117 122 L 114.8 114.2 L 107 112 L 114.8 109.8 Z"
                fill="#FFFFFF" filter="url(#varredura_brilho)" />
            <circle class="logo_faisca" cx="166" cy="166" r="9" fill="#EAFFF3" filter="url(#varredura_brilho)" />

            <!-- 5. NOME: uma letra por desenho, dentro da janela que cresce, e a barra do scanner -->
            <g clip-path="url(#varredura_nome)" fill="#FFFFFF" fill-rule="evenodd">
                <path class="logo_letra" d="M 256.2 77.6 C 246.9 80.1, 242.3 84.6, 240.7 92.6 C 239.2 100, 242.1 106.3, 248.6 109.6 C 250.3 110.4, 255.9 112.2, 261.1 113.5 C 272.5 116.3, 275.6 117.7, 276.2 120.1 C 278.3 128.7, 263 131.1, 248.8 124.3 L 244 122.1 241.6 127.6 C 238.7 134.1, 238.6 134, 248.5 137.3 C 254.3 139.2, 256.3 139.4, 264.8 139.4 C 273.9 139.4, 274.9 139.3, 279.4 137.2 C 287.8 133.3, 291.8 127, 291 118.7 C 290.2 110.3, 283.9 105.7, 268 102.2 C 258.1 100, 256 99, 255.2 95.9 C 254.4 92.9, 256.8 90, 261 88.8 C 266.3 87.2, 273.7 88.3, 282.9 92.1 C 284 92.5, 284.7 91.7, 286.6 87.3 C 289.4 81.1, 289.4 81, 281.1 78.4 C 273.9 76.2, 262.8 75.8, 256.2 77.6" />
                <path class="logo_letra" d="M 325 90.7 C 321.9 91.1, 318.5 92.4, 315.9 94.2 C 313.3 96, 313.1 96, 313.2 93.5 C 313.3 91.5, 313.1 91.3, 309.8 91.1 C 307.9 90.9, 304.9 91, 303.1 91.3 L 299.8 91.8 299.8 123.6 L 299.8 155.3 306.7 155.3 L 313.7 155.3 313.7 144.8 L 313.7 134.2 315.9 135.6 C 320.9 138.9, 322.7 139.4, 328.9 139.4 C 339.2 139.4, 346.3 134.9, 350.5 125.9 C 353.1 120.3, 352.9 109, 350 103.6 C 345.1 94.3, 335.3 89.2, 325 90.7 M 323 102.5 C 317.2 104.3, 314.5 108.4, 314.5 115.2 C 314.5 122.7, 319.7 128.2, 327 128.2 C 335.4 128.2, 340.8 117.3, 336.6 108.6 C 334.4 103.9, 327.8 101, 323 102.5" />
                <path class="logo_letra" d="M 354.1 91.3 C 354.1 91.5, 358.1 101, 363.1 112.4 C 375 139.9, 374.8 139.2, 373.6 141.7 C 372.1 145.1, 368.2 146.4, 363.6 145.1 L 359.7 143.9 357.5 148.5 C 355.3 153.1, 355.3 153.2, 356.8 154.3 C 361 157.4, 371.4 157.6, 377 154.7 C 383.1 151.6, 384.7 149.1, 392.8 130 C 396.2 122, 401.1 110.6, 403.6 104.8 C 410.3 89.4, 410.4 90.9, 402.7 90.9 C 398.4 90.9, 395.9 91.3, 395.4 91.9 C 394.7 92.8, 387.3 110.1, 383.7 119.3 L 382.1 123.1 380.8 120 C 380.1 118.3, 377.1 111.2, 374.2 104.1 L 369 91.3 361.5 91.1 C 357.4 91, 354.1 91, 354.1 91.3" />
                <path class="logo_letra" d="M 435.7 77.4 C 415.9 82.7, 406.3 103.5, 415 122.5 C 423.3 140.7, 455.4 145.8, 469.4 131.2 L 471.6 128.9 467.2 124.5 L 462.8 120.2 459.7 122.6 C 455.2 126.2, 451.8 127.4, 446 127.4 C 440.1 127.4, 437 126.3, 432.8 122.6 C 424.5 115.3, 424.6 100.2, 433.1 93.3 C 440.7 87, 452.7 87.2, 459.7 93.8 C 460.9 94.9, 462.2 95.6, 462.6 95.5 C 463.8 95, 471.2 87.8, 471.2 87.1 C 471.2 86, 465.9 81.7, 462.1 79.8 C 455 76.2, 443.9 75.2, 435.7 77.4" />
                <path class="logo_letra" d="M 496.5 90.9 C 484 92.8, 475.1 102.5, 475.1 114.2 C 475.1 125.2, 479.8 132.8, 489.3 137.2 C 496.1 140.3, 506.7 140.4, 513.2 137.4 C 522.1 133.2, 527.1 126.4, 527.7 117.3 C 528.9 100.1, 514.8 88.2, 496.5 90.9 M 494.7 104.1 C 489.4 107.4, 487.5 117.6, 491.3 122.7 C 496.5 129.7, 506.8 130, 511.2 123.2 C 515.6 116.5, 513.5 107.1, 506.8 103.7 C 503.7 102, 497.7 102.3, 494.7 104.1" />
                <path class="logo_letra" d="M 572.9 84.8 L 572.9 95.6 569.3 93.5 C 562.6 89.6, 552.9 89.7, 546 93.7 C 529.9 103.1, 530.3 128.6, 546.8 136.7 C 555.2 140.8, 563.7 140.7, 570.1 136.3 L 572.9 134.4 572.9 136.7 L 572.9 139 579.9 139 L 586.9 139 586.9 106.4 L 586.9 73.9 579.9 73.9 L 572.9 73.9 572.9 84.8 M 553.8 104.2 C 550.5 106.3, 548.5 110.5, 548.6 115.5 C 548.7 122.8, 552.9 127.4, 559.9 128 C 564.4 128.3, 567.8 126.7, 570.8 122.6 C 574.6 117.5, 572.7 107.4, 567.3 104.1 C 563.8 102, 557.1 102, 553.8 104.2" />
                <path class="logo_letra" d="M 616.7 90.9 C 598.5 93.5, 589.6 114.8, 600.5 129.9 C 608.2 140.5, 630.2 143.1, 640.3 134.6 C 643.4 132, 643.2 131.1, 638.7 126.8 L 636.1 124.3 632.3 126.3 C 625.3 129.8, 616.5 128.6, 612.2 123.6 C 608.3 118.8, 608.2 118.9, 628.5 118.9 L 646.8 118.9 646.4 113.5 C 645.1 97.9, 632.9 88.7, 616.7 90.9 M 616.7 102.1 C 613.8 103.4, 610.2 107.6, 610.2 109.6 C 610.2 111, 610.8 111.1, 621.4 111.1 C 632.3 111.1, 632.7 111.1, 632.7 109.5 C 632.7 103.7, 623.2 99.3, 616.7 102.1" />
            </g>
            <rect class="logo_nome_barra" x="230" y="60" width="4" height="112" rx="2" fill="#2BD96B" filter="url(#varredura_brilho)" />
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
                ${LOGO}
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

        // 3. o código fica para trás, apagado, e a logo se monta no meio da tela (parte 3, mais abaixo)
        const fim = inicio + duracao;

        linha.to([editor, painel], { autoAlpha: 0.15, scale: 0.97, filter: 'blur(3px)', duration: 0.5, ease: 'power2.out' }, fim + 0.05)
            .to(final, { autoAlpha: 1, duration: 0.3 }, fim + 0.1);

        const logoPronta = animarLogo(linha, final, fim + 0.15);

        // os textos sobem enquanto o nome aparece, e no fim uma pausa para ver a logo pronta
        linha.from(final.querySelectorAll('p, h2'), { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, fim + 1.3)
            .to({}, { duration: 0.6 }, logoPronta);

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


    // ---------- 3. A LOGO DO FIM ----------
    // Uma animação só desta tela, diferente da entrada do logo do cabeçalho:
    //   a) um traço verde desenha o aro e o cabo da lupa, e o aro branco acende por cima;
    //   b) um radar dá uma volta dentro do vidro e revela o espião por onde passa;
    //   c) brilham as lentes dos óculos, e um sinal de sonar sai da lupa;
    //   d) uma barra de scanner passa pelo nome, e cada letra nasce verde e esfria para branco.
    // Recebe a linha do tempo e o segundo em que começa; devolve o segundo em que a logo fica pronta.

    function animarLogo(linha, final, comeco) {
        const traco = final.querySelector('.logo_traco');
        const faisca = final.querySelector('.logo_faisca');
        const aro = final.querySelector('.logo_aro');
        const vidro = final.querySelector('.logo_vidro');
        const radar = final.querySelector('.logo_radar');
        const revela = final.querySelector('.logo_revela');
        const espiao = final.querySelector('.logo_espiao');
        const brilhos = final.querySelectorAll('.logo_brilho');
        const sonar = final.querySelectorAll('.logo_sonar');
        const janela = final.querySelector('.logo_nome_janela');
        const barra = final.querySelector('.logo_nome_barra');
        const letras = final.querySelectorAll('.logo_letra');

        // a) O traço é um tracejado com um risco do tamanho do caminho inteiro. Empurrado para fora
        //    (stroke-dashoffset = tamanho), nada aparece; voltando a 0, ele surge do começo ao fim.
        //    A faísca vai na ponta: getPointAtLength diz onde fica o ponto até onde o traço chegou.
        const tamanho = traco.getTotalLength();
        traco.setAttribute('stroke-dasharray', tamanho + ' ' + (tamanho + 50));
        traco.setAttribute('stroke-dashoffset', tamanho);
        const desenho = { feito: 0 };

        linha.set([traco, faisca], { opacity: 1 }, comeco)
            .to(desenho, {
                feito: 1, duration: 0.75, ease: 'power2.inOut',
                onUpdate: function () {
                    traco.setAttribute('stroke-dashoffset', tamanho * (1 - desenho.feito));
                    const ponta = traco.getPointAtLength(tamanho * desenho.feito);
                    faisca.setAttribute('cx', ponta.x);
                    faisca.setAttribute('cy', ponta.y);
                }
            }, comeco)
            .to(faisca, { autoAlpha: 0, duration: 0.2 }, comeco + 0.7)
            // o aro branco acende por cima; o traço verde fica um pouco como brilho em volta e some
            .to(aro, { opacity: 1, duration: 0.35, ease: 'power2.out' }, comeco + 0.65)
            .to(traco, { autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, comeco + 0.8);

        // b) O radar gira em volta do centro do vidro (104, 104). A máscara do espião é desenhada
        //    do mesmo jeito que o traço e no mesmo ritmo do giro, então ele aparece atrás do ponteiro.
        const volta = revela.getTotalLength();
        revela.setAttribute('stroke-dasharray', volta + ' ' + (volta + 50));
        revela.setAttribute('stroke-dashoffset', volta);
        gsap.set(radar, { svgOrigin: '104 104' });
        gsap.set(espiao, { transformOrigin: '50% 50%' });
        const varrer = comeco + 0.45;

        linha.to(vidro, { opacity: 1, duration: 0.4 }, varrer - 0.15)
            .to(radar, { opacity: 1, duration: 0.15 }, varrer)
            .to(radar, { rotation: 360, duration: 0.9, ease: 'power1.inOut' }, varrer)
            .to(revela, { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power1.inOut' }, varrer)
            .to(radar, { opacity: 0, duration: 0.3 }, varrer + 0.75)
            // revelado, o espião dá um pulinho, como uma imagem entrando em foco
            .fromTo(espiao, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, varrer + 0.8);

        // c) Os brilhos crescem girando e somem, um em cada lente. O sonar são dois anéis que
        //    saem da lupa, um depois do outro, e se apagam enquanto crescem.
        const revelado = varrer + 0.9;
        gsap.set(brilhos, { transformOrigin: '50% 50%', scale: 0 });
        gsap.set(sonar, { svgOrigin: '104 104' });

        linha.to(brilhos, { opacity: 1, scale: 1.3, rotation: 90, duration: 0.3, stagger: 0.12, ease: 'back.out(2)' }, revelado)
            .to(brilhos, { autoAlpha: 0, scale: 0, rotation: 180, duration: 0.3, stagger: 0.12, ease: 'power2.in' }, revelado + 0.3)
            .fromTo(sonar,
                { scale: 1, autoAlpha: 0.8 },
                { scale: 1.7, autoAlpha: 0, duration: 1.1, stagger: 0.25, ease: 'power2.out', immediateRender: false }, revelado - 0.1);

        // d) A janela do nome (clipPath) cresce junto com a barra, sempre no mesmo ritmo (ease 'none').
        //    As letras ficam quase à mesma distância umas das outras, então a barra leva o mesmo
        //    tempo de uma letra até a próxima: 14% da travessia. É esse o intervalo (stagger) do verde
        //    para o branco, que começa quando a barra passa pelo meio do "S" (8% do caminho).
        const nome = comeco + 0.95;
        const travessia = 0.8;

        linha.set(barra, { opacity: 1 }, nome)
            .to(janela, { attr: { width: 424 }, duration: travessia, ease: 'none' }, nome)
            .to(barra, { attr: { x: 654 }, duration: travessia, ease: 'none' }, nome)
            .to(barra, { autoAlpha: 0, duration: 0.25 }, nome + travessia)
            .fromTo(letras,
                { fill: '#2BD96B' },
                { fill: '#FFFFFF', duration: 0.5, stagger: travessia * 0.14, ease: 'power1.out' }, nome + travessia * 0.08 + 0.05);

        return nome + travessia + 0.3;
    }


    // ---------- 4. OS CLIQUES ----------

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
