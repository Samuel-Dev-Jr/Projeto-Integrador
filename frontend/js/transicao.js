// TRANSIÇÃO ENTRE AS ABAS DO MENU
//
// A animação do conteúdo (a página antiga sai para um lado e a nova entra pelo outro)
// é feita pelo navegador, com a regra @view-transition do style.css.
// Este arquivo cuida do que o CSS sozinho não sabe:
//   1) de qual aba a pessoa veio, para o conteúdo deslizar para o lado certo;
//   2) a pílula escura do menu sair da aba antiga e deslizar até a nova;
//   3) o logo não montar o nome de novo a cada troca de aba.
//
// Ele fica no <head> de propósito: precisa estar pronto antes de a página nova aparecer.


// As abas na ordem do menu. A posição na lista é a posição da aba (0 é a primeira).
const ABAS = ['index.html', 'recursos.html', 'sobre.html', 'seguranca.html'];

// nome usado para anotar, no navegador, de qual aba a pessoa saiu
const CHAVE_ABA = 'spycode-aba-anterior';

// Descobre qual aba é um endereço, pelo nome do arquivo no fim dele.
// Devolve -1 quando não é uma aba do menu (a tela de login, por exemplo).
function abaDoEndereco(endereco) {
    const arquivo = new URL(endereco, location.href).pathname.split('/').pop() || 'index.html';
    return ABAS.indexOf(arquivo);
}

const abaAtual = abaDoEndereco(location.href);


// Em qual aba a pílula está agora. Nem sempre é a aba atual:
// com o mouse em cima de outra aba, ela já foi até lá.
function posicaoDaPilula() {
    const menu = document.querySelector('.navegacao');
    return menu ? Number(getComputedStyle(menu).getPropertyValue('--posicao')) : abaAtual;
}

// Guarda a posição no instante do clique: quando a página começa a trocar,
// o navegador já esqueceu que o mouse estava em cima da aba.
let pilulaNoClique = null;
document.addEventListener('click', function () {
    pilulaNoClique = posicaoDaPilula();
}, true);

// voltando para esta página pelo botão Voltar, o clique antigo não vale mais
addEventListener('pageshow', function () {
    pilulaNoClique = null;
});

// Ao sair da página, anota qual aba era, onde a pílula estava e a hora.
// "pageswap" acontece primeiro (Chrome e Edge); "pagehide" acontece em todos os navegadores.
// Sem clique (botão Voltar do navegador, por exemplo), vale a posição de agora.
function anotarSaida() {
    const pilula = pilulaNoClique !== null ? pilulaNoClique : posicaoDaPilula();
    try {
        sessionStorage.setItem(CHAVE_ABA, JSON.stringify({ aba: abaAtual, pilula: pilula, hora: Date.now() }));
    } catch (erro) {
        // navegador sem permissão para guardar: a página só troca, sem a pílula deslizar
    }
}

addEventListener('pageswap', anotarSaida);
addEventListener('pagehide', anotarSaida);


// Lê a anotação da página anterior, se for de no máximo 3 segundos atrás
function lerAnotacao() {
    try {
        const anotacao = JSON.parse(sessionStorage.getItem(CHAVE_ABA));
        if (anotacao && Date.now() - anotacao.hora < 3000) {
            return anotacao;
        }
    } catch (erro) {
        // sem anotação: segue como se tivesse vindo de fora
    }
    return null;
}


// De qual aba a pessoa veio. Devolve -1 se ela não veio de uma aba agora há pouco.
function abaAnterior(anotacao) {
    // Chrome e Edge dizem direto qual foi a página anterior, até no botão Voltar
    const navegacao = window.navigation;
    if (navegacao && navegacao.activation && navegacao.activation.from && navegacao.activation.from.url) {
        return abaDoEndereco(navegacao.activation.from.url);
    }

    // nos outros, usa a anotação feita ao sair da página
    return anotacao ? anotacao.aba : -1;
}


// A pílula começa parada na aba antiga e desliza até a aba desta página.
function deslizarPilula(de) {
    const menu = document.querySelector('.navegacao');
    const links = menu ? menu.querySelectorAll('a') : [];
    if (!links[de]) return;

    // 1. Sem animação, coloca a pílula e o texto claro na aba antiga
    menu.classList.add('sem_transicao', 'deslizando');
    links[de].classList.add('texto_claro');
    menu.style.setProperty('--posicao', de);

    // 2. Ler o tamanho do menu obriga o navegador a aplicar o passo 1 agora
    void menu.offsetWidth;
    menu.classList.remove('sem_transicao');

    // 3. No quadro seguinte solta tudo: a pílula desliza até a aba atual
    //    (a animação é o "transition" da pílula, no style.css)
    requestAnimationFrame(function () {
        menu.style.removeProperty('--posicao');
        menu.classList.remove('deslizando');
        links[de].classList.remove('texto_claro');
    });
}


// Faz o logo abrir já pronto, sem a entrada do nome (ver o fim da seção 1 do logo-animado.svg)
function logoSemEntrada() {
    const logo = document.querySelector('.logo_tipos img');
    if (logo && logo.getAttribute('src').indexOf('#') === -1) {
        logo.src = logo.getAttribute('src') + '#sem-intro';
    }
}


// A pessoa veio de outra aba do menu? (e não recarregou a mesma, nem veio de fora do site)
function veioDeOutraAba(de) {
    return abaAtual >= 0 && de >= 0 && de !== abaAtual;
}

// Marca no <html> como a pessoa chegou: data-chegada="aba" (pelo menu, com a transição)
// ou "direta" (abriu o endereço, recarregou ou veio de outra página).
// O css/cinema.css e o js/cinema.js usam isso: a abertura do site só toca na chegada direta.
// "final" quer dizer que é a decisão de verdade, tomada logo antes de a página aparecer;
// aí o js/cinema.js é avisado pelo evento "spycode:chegada".
function marcarChegada(deAba, final) {
    const raiz = document.documentElement;
    raiz.dataset.chegada = deAba ? 'aba' : 'direta';
    if (final) {
        raiz.dataset.chegadaPronta = 'sim';
        document.dispatchEvent(new CustomEvent('spycode:chegada'));
    }
}

// Um primeiro palpite, já aqui no <head>, para o CSS esconder ou mostrar a abertura
// desde o primeiro quadro da página.
marcarChegada(veioDeOutraAba(abaAnterior(lerAnotacao())), false);


// Roda uma vez, quando a página nova está para aparecer
function prepararChegada() {
    const anotacao = lerAnotacao();
    const de = abaAnterior(anotacao);
    const deAba = veioDeOutraAba(de);
    marcarChegada(deAba, true);

    // veio de fora do menu, ou recarregou a mesma aba: a transição entre abas não entra
    if (!deAba) return;

    logoSemEntrada();

    // quem pediu "menos movimento" no sistema vê a página trocar sem deslizar
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // conta ao CSS para que lado o conteúdo vai: aba à direita da antiga ou à esquerda
    document.documentElement.dataset.sentido = de < abaAtual ? 'direita' : 'esquerda';

    // A pílula continua de onde estava na hora do clique. Clicando com o mouse,
    // ela já está na aba nova e não precisa andar; pelo teclado ou pelo botão Voltar,
    // ela sai da aba antiga.
    const pilulaAntes = anotacao && anotacao.aba === de && Number.isInteger(anotacao.pilula) ? anotacao.pilula : de;
    if (pilulaAntes !== abaAtual) {
        deslizarPilula(pilulaAntes);
    }
}


// Pré-carrega a aba quando o mouse para em cima dela no menu (Chrome e Edge, com o site
// aberto por http, como no Live Server). No clique, a página nova já está pronta e a
// transição começa na hora, sem a espera de carregar.
if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    const regras = document.createElement('script');
    regras.type = 'speculationrules';
    regras.textContent = JSON.stringify({
        prerender: [{ where: { selector_matches: '.navegacao a' }, eagerness: 'moderate' }]
    });
    document.head.appendChild(regras);
}


// "pagereveal" acontece logo antes de a página nova aparecer, inclusive durante a transição.
// Navegadores que não têm esse evento usam o DOMContentLoaded (a página já foi lida).
if ('onpagereveal' in window) {
    addEventListener('pagereveal', prepararChegada);
} else {
    addEventListener('DOMContentLoaded', prepararChegada);
}
