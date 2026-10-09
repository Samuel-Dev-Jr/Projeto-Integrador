// =================================
//   SPYCODE - CONFIGURAÇÃO DO FIREBASE
//   Este arquivo só configura e conecta o Firebase.
//   Os cliques dos botões ficam no login.js.
// =================================

const firebaseConfig = {
    apiKey: "AIzaSyAJbg_-LkPIRR0ioW5cqWYV0dBuduUmn3o",
    authDomain: "spycode-saneni.firebaseapp.com",
    projectId: "spycode-saneni",
    storageBucket: "spycode-saneni.firebasestorage.app",
    messagingSenderId: "158125495976",
    appId: "1:158125495976:web:b67756d55903ce9fabd49d",
    measurementId: "G-WZWRMQCVKK"
};



// Autenticação e provedores, prontos para o login.js usar
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);