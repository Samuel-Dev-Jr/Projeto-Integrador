
import src ="../frontend/js/firebaseConfig.js" defer ></script >

// 1. SELEÇÃO DOS ELEMENTOS DO HTML

// ---------- LADO ESQUERDO ----------

// Logo animado (SVG)
const logoImg = document.getElementById("logo-img");

// Ilustração do escudo
const ilustracao = document.getElementById("ilustracao");
const imgLogin = document.getElementById("img-login");


// ---------- LADO DIREITO (CARD) ----------

const card = document.querySelector(".card");

// Botões de login social
const btnGithub = document.querySelector(".github");
const btnGoogle = document.querySelector(".btngoogle");

// Formulário de e-mail e senha
const formLogin = document.querySelector(".card form");
const inputEmail = document.querySelector('input[type="email"]');
const inputSenha = document.getElementById("senha");
const btnEntrar = document.querySelector(".entrar");

// Links
const linkEsqueciSenha = document.querySelector(".senha-titulo a");
const linkCriarConta = document.querySelector(".cadastro a");

// Caixa de aviso
const aviso = document.querySelector(".aviso");

if (formLogin && inputEmail && inputSenha) {
    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailDigitado = inputEmail.value;
        const senhaDigitada = inputSenha.value;

        if (emailDigitado === "" || senhaDigitada === "") {
            alert("Agente, por favor preencha todos os campos!");
            return;
        }

        firebase.auth().signInWithEmailAndPassword(emailDigitado, senhaDigitada)
            .then(function () {
                alert("Identificação confirmada! Acessando dossiê...");
                window.location.href = "dashboard.html";
            })
            .catch(function (erro) {
                alert("E-mail ou senha incorretos!");
                console.log("Erro de login:", erro.message);
            });
    });
}

if (btnGoogle) {
    btnGoogle.addEventListener("click", function () {
        const provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider)
            .then(function (resposta) {
                const usuario = resposta.user;
                localStorage.setItem("usuario_google", JSON.stringify({
                    nome: usuario.displayName,
                    email: usuario.email
                }));
                alert(`Bem-Vindo, ${usuario.displayName}!`);
                window.location.href = "telaLog.html";
            })
            .catch(function (erro) {
                alert(`Erro ao tentar logar com Google: ${erro.message}`);
            });
    });
}

if (btnGithub) {
    btnGithub.addEventListener("click", function () {
        const provedorGithub = new firebase.auth.GithubAuthProvider();

        firebase.auth().signInWithPopup(provedorGithub)
            .then(function () {
                alert("Conectado com sucesso via GitHub!");
                window.location.href = "dashboard.html";
            })
            .catch(function (erro) {
                alert("Erro ao entrar com GitHub.");
                console.log(erro);
            });
    });
}



// ---------- 1. ELEMENTOS DO HTML ----------

// Lado esquerdo
const logoImg = document.getElementById("logo-img");
const ilustracao = document.getElementById("ilustracao");
const imgLogin = document.getElementById("img-login");

// Card do lado direito
const card = document.querySelector(".card");

// Botões de login social
const btnGithub = document.querySelector(".github");
const btnGoogle = document.querySelector(".btngoogle");

// Formulário de e-mail e senha
const formLogin = document.querySelector(".card form");
const inputEmail = document.querySelector('input[type="email"]');
const inputSenha = document.getElementById("senha");
const btnEntrar = document.querySelector(".entrar");

// Links e aviso
const linkEsqueciSenha = document.querySelector(".senha-titulo a");
const linkCriarConta = document.querySelector(".cadastro a");
const aviso = document.querySelector(".aviso");


// ---------- 2. FUNÇÃO DE APOIO ----------

// Guarda nome e e-mail do usuário e leva para a próxima página
function entrarComSucesso(nome, email) {
    localStorage.setItem("usuario", JSON.stringify({ nome, email }));
    alert(`Bem-vindo, ${nome}!`);
    window.location.href = PAGINA_DESTINO;
}


// ---------- 3. LOGIN COM E-MAIL E SENHA ----------

if (formLogin && inputEmail && inputSenha) {
    formLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const email = inputEmail.value.trim();
        const senha = inputSenha.value;

        if (email === "" || senha === "") {
            alert("Agente, por favor preencha todos os campos!");
            return;
        }

        auth.signInWithEmailAndPassword(email, senha)
            .then(function (resposta) {
                const usuario = resposta.user;
                entrarComSucesso(usuario.displayName || "Agente", usuario.email);
            })
            .catch(function (erro) {
                alert("E-mail ou senha incorretos!");
                console.log("Erro de login:", erro.message);
            });
    });
}


// ---------- 4. LOGIN COM GOOGLE ----------

if (btnGoogle) {
    btnGoogle.addEventListener("click", function () {
        auth.signInWithPopup(googleProvider)
            .then(function (resposta) {
                const usuario = resposta.user;
                entrarComSucesso(usuario.displayName, usuario.email);
            })
            .catch(function (erro) {
                alert("Erro ao entrar com Google.");
                console.log("Erro Google:", erro.message);
            });
    });
}


// ---------- 5. LOGIN COM GITHUB ----------

if (btnGithub) {
    btnGithub.addEventListener("click", function () {
        auth.signInWithPopup(githubProvider)
            .then(function (resposta) {
                const usuario = resposta.user;

                // No GitHub, nome e e-mail podem vir vazios;
                // nesse caso usamos o nome de usuário da conta.
                const nomeGithub = resposta.additionalUserInfo
                    ? resposta.additionalUserInfo.username
                    : null;

                entrarComSucesso(
                    usuario.displayName || nomeGithub || "Dev",
                    usuario.email
                );
            })
            .catch(function (erro) {
                alert("Erro ao entrar com GitHub.");
                console.log("Erro GitHub:", erro.message);
            });
    });
}