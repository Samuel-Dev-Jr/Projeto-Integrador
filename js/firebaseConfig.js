
 const firebaseConfig = {
    apiKey: "AIzaSyAJbg_-LkPIRR0ioW5cqWYV0dBuduUmn3o",
    authDomain: "spycode-saneni.firebaseapp.com",
    projectId: "spycode-saneni",
    storageBucket: "spycode-saneni.firebasestorage.app",
    messagingSenderId: "158125495976",
    appId: "1:158125495976:web:b67756d55903ce9fabd49d",
    measurementId: "G-WZWRMQCVKK"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const GoogleProvider = new firebase.auth.GoogleAuthProvider();

const googleLoginButton = document.getElementById("btn-google");

if (googleLoginButton) {
    googleLoginButton.addEventListener("click", () => {
        auth.signInWithPopup(GoogleProvider)
            .then((result) => {
                const user = result.user;
                localStorage.setItem("usuario_google", JSON.stringify({
                    nome: user.displayName,
                    email: user.email
                }));
                alert(`Bem-Vindo, ${user.displayName}!`);
                window.location.href = "telaLog.html";
            })
            .catch((error) => {
                alert(`Erro ao tentar logar com Google: ${error.message}`);
            });
    });
}

window.firebaseAuth = auth;
window.googleProvider = GoogleProvider;
