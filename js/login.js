// =================================
//   SPYCODE - LOGIN (ARQUIVO ÚNICO)
//   Configuração do Firebase + login no mesmo arquivo,
//   para não depender de outro arquivo JS.
// =================================


// ---------- 1. CONFIGURAÇÃO DO FIREBASE ----------

const configFirebase = {
    apiKey: "AIzaSyAJbg_-LkPIRR0ioW5cqWYV0dBuduUmn3o",
    authDomain: "spycode-saneni.firebaseapp.com",
    projectId: "spycode-saneni",
    storageBucket: "spycode-saneni.firebasestorage.app",
    messagingSenderId: "158125495976",
    appId: "1:158125495976:web:b67756d55903ce9fabd49d",
    measurementId: "G-WZWRMQCVKK"
};

// Inicializa o Firebase só uma vez
if (!firebase.apps.length) {
    firebase.initializeApp(configFirebase);
}

const autenticacao = firebase.auth();
const provedorGoogle = new firebase.auth.GoogleAuthProvider();
const provedorGithub = new firebase.auth.GithubAuthProvider();


// Página para onde o agente vai depois de entrar
const PAGINA_DESTINO = "dashboard.html";


// ---------- 2. ELEMENTOS DO HTML ----------

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


// ---------- 3. FUNÇÃO DE APOIO ----------

// Guarda nome e e-mail do usuário e leva para a próxima página
function entrarComSucesso(nome, email) {
    localStorage.setItem("usuario", JSON.stringify({ nome, email }));
    alert(`Bem-vindo, ${nome}!`);
    window.location.href = PAGINA_DESTINO;
}


// ---------- 4. LOGIN COM E-MAIL E SENHA ----------

if (formLogin && inputEmail && inputSenha) {
    formLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const email = inputEmail.value.trim();
        const senha = inputSenha.value;

        if (email === "" || senha === "") {
            alert("Agente, por favor preencha todos os campos!");
            return;
        }

        autenticacao.signInWithEmailAndPassword(email, senha)
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


// ---------- 5. LOGIN COM GOOGLE ----------

if (btnGoogle) {
    btnGoogle.addEventListener("click", function () {
        autenticacao.signInWithPopup(provedorGoogle)
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


// ---------- 6. LOGIN COM GITHUB ----------

if (btnGithub) {
    btnGithub.addEventListener("click", function () {
        autenticacao.signInWithPopup(provedorGithub)
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


// Confirmação no Console de que o arquivo carregou inteiro
console.log("SpyCode: login carregado e Firebase conectado ✔");