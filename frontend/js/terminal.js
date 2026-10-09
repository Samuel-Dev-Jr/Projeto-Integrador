/* ==========================================================
   TERMINAL ANIMADO DA PÁGINA INICIAL
   Faz o terminal "rodar sozinho", como um vídeo em loop feito de texto:
   digita comandos, escreve respostas, enche barras de progresso e faz
   desenhos com letras e símbolos. São cinco cenas; depois da última,
   volta à primeira.
   ========================================================== */

// os pedaços da página que este arquivo controla
const tela = document.querySelector('.terminal pre');
const titulo = document.querySelector('.terminal_titulo');
// as três caixas de vantagem que ficam ao lado do terminal
const vantagens = document.querySelectorAll('.vantagem');


/* ---------- 1. AS VELOCIDADES, em milissegundos (1000 = 1 segundo) ---------- */
const TEMPO_LETRA = 45;       // entre uma letra e outra do comando
const TEMPO_LINHA = 380;      // entre uma linha e outra da resposta
const TEMPO_DESENHO = 70;     // entre uma linha e outra de um desenho
const TEMPO_LEITURA = 2800;   // quanto a cena fica parada no fim, para dar tempo de ler
const TEMPO_TROCA = 450;      // duração da transição entre cenas (o mesmo 0.45s do CSS)

// quantas linhas cabem no terminal (a altura dele no CSS foi feita para 14)
const MAXIMO_DE_LINHAS = 14;


/* ---------- 2. OS DESENHOS ----------
   Cada desenho é uma lista de linhas de texto. Como a fonte do terminal tem todas
   as letras da mesma largura, os símbolos se alinham e formam a figura.
   Dentro das aspas, a barra invertida precisa ser escrita em dobro (\\) para aparecer uma. */

// o nome do projeto em letras grandes
const LOGO = [
    " ___            ___         _",
    "/ __|_ __ _  _ / __|___  __| |___",
    "\\__ \\ '_ \\ || | (__/ _ \\/ _` / -_)",
    "|___/ .__/\\_, |\\___\\___/\\__,_\\___|",
    "    |_|   |__/",
];

// o cadeado fechado, com o símbolo de código dentro
const CADEADO = [
    "       .------.",
    "      / .----. \\",
    "     | |      | |",
    "   .-'-'------'-'-.",
    "   |              |",
    "   |   </>   ok   |",
    "   |              |",
    "   '--------------'",
];

// os arquivos que passam correndo durante a leitura do repositório
const ARQUIVOS = [
    '  lendo package.json',
    '  lendo package-lock.json',
    '  lendo .env',
    '  lendo src/app.js',
    '  lendo src/db.js',
    '  lendo src/middlewares/auth.js',
    '  lendo src/routes/login.js',
    '  lendo src/routes/tasks.js',
    '  lendo src/routes/users.js',
    '  lendo histórico: 214 commits',
];

// o mapa de rotas, em formato de árvore
const ROTAS = [
    'app-de-tarefas',
    ' |',
    ' |-- GET    /login ......... <span class="apagado">pública</span>',
    ' |-- GET    /tasks ......... <span class="ok">protegida</span>',
    ' |-- POST   /tasks ......... <span class="ok">protegida</span>',
    ' |-- PUT    /tasks/:id ..... <span class="ok">protegida</span>',
    ' |-- GET    /users ......... <span class="ok">protegida</span>',
    ' \'-- DELETE /users/:id ..... <span class="erro">ABERTA</span>',
];


/* ---------- 3. AS FERRAMENTAS ---------- */

// "espera(500)" pausa meio segundo. O await na frente é o que faz o código parar e aguardar.
const espera = ms => new Promise(resolve => setTimeout(resolve, ms));

// Cria uma linha nova no fim do terminal.
// "classe" dá a cor (ok, erro, aviso, claro, apagado) ou o jeito de entrar (desenho).
// Com "comoTexto" ligado, o conteúdo é escrito como texto puro: é o que os desenhos usam,
// porque eles têm sinais como < e > que o navegador confundiria com HTML.
function novaLinha(conteudo, classe = '', comoTexto = false) {
    const linha = document.createElement('span');
    linha.className = ('linha ' + classe).trim();

    if (comoTexto) {
        linha.textContent = conteudo;
    } else {
        linha.innerHTML = conteudo;
    }

    tela.appendChild(linha);

    // se passou do que cabe, a linha mais antiga sai por cima, como num terminal de verdade
    while (tela.children.length > MAXIMO_DE_LINHAS) {
        tela.firstElementChild.remove();
    }

    return linha;
}

// escreve o "$ " com o cursor piscando e digita o comando letra por letra
async function digitar(comando) {
    const linha = novaLinha('<span class="claro">$ <span class="digitado"></span></span><span class="cursor"></span>');
    const digitado = linha.querySelector('.digitado');

    await espera(600);

    for (const letra of comando) {
        digitado.textContent += letra;
        // o sorteio deixa o ritmo irregular, como alguém digitando de verdade
        await espera(TEMPO_LETRA + Math.random() * 50);
    }

    await espera(350);
    // tira o cursor: é o "apertou Enter"
    linha.querySelector('.cursor').remove();
}

// escreve uma linha de resposta, depois de uma pequena pausa
async function escrever(html, classe = '') {
    await espera(TEMPO_LINHA);
    novaLinha(html, classe);
}

// escreve várias linhas em sequência rápida: é assim que os desenhos e as listas aparecem
async function desenhar(linhas, classe = '', comoTexto = true, ritmo = TEMPO_DESENHO) {
    await espera(TEMPO_LINHA);

    for (const texto of linhas) {
        novaLinha(texto, 'desenho ' + classe, comoTexto);
        await espera(ritmo);
    }
}

// Barra de progresso que enche no lugar: a mesma linha é reescrita 21 vezes,
// cada vez com um "#" a mais. No fim ela fica verde.
async function barra(rotulo) {
    const linha = novaLinha('');

    for (let cheio = 0; cheio <= 20; cheio++) {
        const porcento = String(cheio * 5).padStart(3, ' ');
        linha.textContent = rotulo + ' [' + '#'.repeat(cheio) + '-'.repeat(20 - cheio) + '] ' + porcento + '%';
        await espera(28);
    }

    linha.classList.add('ok');
}

// Acende a caixa de vantagem que tem a ver com o que o terminal está mostrando.
// "qual" pode ser 'chaves', 'rotas', 'libs', 'todas' ou '' (nenhuma).
// A classe "ativa" é a que o style.css usa para dar o visual de caixa acesa.
function destacar(qual) {
    for (const vantagem of vantagens) {
        const acende = qual === 'todas' || vantagem.classList.contains('vantagem_' + qual);
        vantagem.classList.toggle('ativa', acende);
    }
}

// Monta uma moldura em volta de algumas linhas de texto e devolve a lista pronta para desenhar.
// O padEnd completa cada linha com espaços, para a borda da direita ficar alinhada.
function caixa(linhas, largura = 42) {
    const borda = '+' + '-'.repeat(largura) + '+';
    const miolo = linhas.map(texto => '| ' + texto.padEnd(largura - 2, ' ') + ' |');
    return [borda, ...miolo, borda];
}


/* ---------- 4. AS CENAS ----------
   Cada cena é uma função que chama as ferramentas na ordem em que as coisas aparecem.
   Para mudar o "filme", é só mexer aqui. Cada linha cabe em até 46 letras,
   para não passar por baixo do selo "3 motores".
   Os "destacar(...)" acendem, ao lado do terminal, a vantagem ligada ao que acabou de aparecer. */

async function cenaIniciando() {
    await digitar('spycode');
    await desenhar(LOGO, 'ok');
    await escrever('auditoria de segurança para Node + Express', 'apagado');
    await escrever('<span class="ok">[ok]</span> motor de segredos');
    destacar('chaves');
    await escrever('<span class="ok">[ok]</span> motor de rotas');
    destacar('rotas');
    await escrever('<span class="ok">[ok]</span> motor de dependências');
    destacar('libs');
    await escrever('pronto: 3 motores carregados', 'claro');
    destacar('todas');
}

async function cenaVarredura() {
    await digitar('spycode scan grupo-pi/app-de-tarefas');
    await escrever('baixando o repositório...');
    await desenhar(ARQUIVOS, 'apagado', true, 90);
    await escrever('128 arquivos lidos', 'claro');
    await barra('segredos    ');
    await barra('rotas       ');
    await barra('dependências');
    await escrever('<span class="erro">✗</span> 1 segredo exposto em .env');
    destacar('chaves');
    await escrever('<span class="erro">✗</span> 1 rota sem autenticação');
    destacar('rotas');
    await escrever('<span class="aviso">!</span> 1 biblioteca com falha conhecida');
    destacar('libs');
    await escrever('nota final: 58/100', 'claro');
}

async function cenaRotas() {
    await digitar('spycode rotas');
    destacar('rotas');
    await desenhar(ROTAS, '', false, 160);
    await escrever('6 rotas mapeadas, <span class="erro">1 sem autenticação</span>');
    await escrever('qualquer pessoa pode apagar usuários', 'apagado');
}

async function cenaExplicacao() {
    await digitar('spycode explicar 1');
    destacar('chaves');
    await desenhar(caixa(['.env, linha 3', 'API_KEY=sk_live_****************7f3a']), 'erro');
    await escrever('<span class="claro">risco:</span> quem achar essa chave usa o');
    await escrever('       serviço em seu nome, e a conta é sua');
    await escrever('<span class="claro">correção:</span> gere uma chave nova e tire');
    await escrever('          o .env do repositório');
    await escrever('<span class="claro">histórico:</span> entrou no commit a1b2c3d');
}

async function cenaCorrigido() {
    await digitar('spycode scan grupo-pi/app-de-tarefas');
    await escrever('128 arquivos lidos', 'claro');
    await barra('segredos    ');
    destacar('chaves');
    await barra('rotas       ');
    destacar('rotas');
    await barra('dependências');
    destacar('libs');
    await desenhar(CADEADO, 'ok');
    await escrever('nota final: 100/100', 'ok');
    destacar('todas');
}

// a ordem do filme, com o nome que aparece na barra do terminal
const cenas = [
    { titulo: 'iniciando', roteiro: cenaIniciando },
    { titulo: 'varredura', roteiro: cenaVarredura },
    { titulo: 'mapa de rotas', roteiro: cenaRotas },
    { titulo: 'explicação do achado', roteiro: cenaExplicacao },
    { titulo: 'depois da correção', roteiro: cenaCorrigido },
];


/* ---------- 5. O FILME ---------- */

async function rodarCena(cena) {
    titulo.textContent = cena.titulo;
    titulo.classList.remove('saindo');

    await cena.roteiro();

    // um "$" vazio com o cursor, esperando o próximo comando
    await espera(TEMPO_LINHA);
    novaLinha('<span class="claro">$ </span><span class="cursor"></span>');
    await espera(TEMPO_LEITURA);

    // transição: o texto some (classe "saindo" do CSS), a tela é limpa e volta vazia.
    // As caixas de vantagem apagam junto.
    destacar('');
    tela.classList.add('saindo');
    titulo.classList.add('saindo');
    await espera(TEMPO_TROCA);
    tela.innerHTML = '';
    tela.classList.remove('saindo');
}

async function rodarParaSempre() {
    tela.innerHTML = '';

    while (true) {
        for (const cena of cenas) {
            await rodarCena(cena);
        }
    }
}


/* ---------- 6. A PARTIDA ---------- */

// quem pediu "menos movimento" no sistema fica com o texto parado que já está no HTML
const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (tela && titulo && !menosMovimento) {
    // enquanto o terminal não aparece na tela, fica só o "$" com o cursor piscando
    tela.innerHTML = '';
    novaLinha('<span class="claro">$ </span><span class="cursor"></span>');

    // O observador avisa quando o terminal entra na tela. Só aí o filme começa,
    // para a pessoa ver desde a primeira letra.
    const observador = new IntersectionObserver(entradas => {
        if (entradas[0].isIntersecting) {
            observador.disconnect();
            rodarParaSempre();
        }
    }, { threshold: 0.4 });

    observador.observe(tela);
}
