
// 1. SELEÇÃO DOS ELEMENTOS DO HTML

const formLogin = document.getElementById("form-login");
const inputEmail = document.getElementById("input-email");
const inputSenha = document.getElementById("input-senha");
const btnGithub = document.getElementById("btn-github");
const btnGoogle = document.getElementById("btn-google");

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


