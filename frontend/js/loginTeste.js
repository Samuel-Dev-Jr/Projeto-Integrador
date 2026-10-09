

//   SPYCODE - LOGIN
//   Constantes: elementos do login.html
// =================================


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

// =================================
//   SPYCODE - LOGIN
//   Usa o "auth", "googleProvider" e "githubProvider"
//   que vêm do firebaseConfig.js (carregado antes no HTML).
// =================================


// Página para onde o agente vai depois de entrar
const PAGINA_DESTINO = "../frontend/dashboard.html";



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