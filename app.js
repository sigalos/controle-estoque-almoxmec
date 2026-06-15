// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // Adicionado para criar usuários
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc // Adicionado para salvar perfil do usuário
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 CONFIG (MANTÉM O SEU)
const firebaseConfig = {
  apiKey: "AIzaSyBQGoNZaDvXuGwaIfaAmvZ2DHCID3MMaAA",
  authDomain: "almoxmec-cb491.firebaseapp.com",
  projectId: "almoxmec-cb491",
  storageBucket: "almoxmec-cb491.firebasestorage.app",
  messagingSenderId: "673430655860",
  appId: "1:673430655860:web:ef6438070fbfeb2854d221"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔥 ELEMENTOS DE AUTENTICAÇÃO E ABAS
const loginTela = document.getElementById("loginTela");
const sistemaTela = document.getElementById("sistemaTela");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const erro = document.getElementById("erro");
const usuarioLogado = document.getElementById("usuarioLogado");

const tabLogin = document.getElementById("tabLogin");
const tabCadastro = document.getElementById("tabCadastro");
const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");
const btnCadastrar = document.getElementById("btnCadastrar");

// ELEMENTOS DO SISTEMA
const nomePeca = document.getElementById("nomePeca");
const quantidadePeca = document.getElementById("quantidadePeca");
const fotoPeca = document.getElementById("fotoPeca");
const btnSalvarPeca = document.getElementById("btnSalvarPeca");
const listaPecas = document.getElementById("listaPecas");
const historicoLista = document.getElementById("historicoLista");
const historicoArea = document.getElementById("historicoArea");
const areaAdmin = document.getElementById("areaAdmin");
const btnToggleHistorico = document.getElementById("btnToggleHistorico");
const btnFiltrar = document.getElementById("btnFiltrar");
const filtroUsuario = document.getElementById("filtroUsuario");

// 🔄 CONTROLADOR DE ABAS (LOGIN / CADASTRO)
tabLogin.onclick = () => {
  tabLogin.classList.add("active");
  tabCadastro.classList.remove("active");
  formLogin.style.display = "block";
  formCadastro.style.display = "none";
  erro.innerText = "";
};

tabCadastro.onclick = () => {
  tabCadastro.classList.add("active");
  tabLogin.classList.remove("active");
  formLogin.style.display = "none";
  formCadastro.style.display = "block";
  erro.innerText = "";
};

// 🔥 AÇÃO DE LOGIN
btnLogin.onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) return erro.innerText = "Preencha todos os campos.";

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    erro.innerText = "";
  } catch (e) {
    erro.innerText = "E-mail ou senha incorretos.";
  }
};

// 🔥 AÇÃO DE CADASTRO DE USUÁRIO
btnCadastrar.onclick = async () => {
  const email = document.getElementById("cadEmail").value.trim();
  const senha = document.getElementById("cadSenha").value;

  if (!email || !senha) return erro.innerText = "Preencha todos os campos.";
  if (senha.length < 6) return erro.innerText = "A senha deve ter no mínimo 6 dígitos.";

  try {
    // 1. Cria a credencial no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // 2. Cria o documento do usuário no Firestore definido como padrão 'comum'
    await setDoc(doc(db, "usuarios", user.email), {
      email: user.email,
      tipo: "comum" // Usuários novos começam como comum. Mude no Firebase para 'admin' se necessário.
    });

    erro.style.color = "#22c55e";
    erro.innerText = "Conta criada com sucesso! Entrando...";
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      erro.innerText = "Este e-mail já está cadastrado.";
    } else {
      erro.innerText = "Erro ao criar conta. Tente novamente.";
    }
  }
};

// 🔥 LOGOUT
btnLogout.onclick = () => {
  signOut(auth);
};

// 🔥 DETECTA ESTADO DE LOGIN
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginTela.style.display = "none";
    sistemaTela.style.display = "block";
    usuarioLogado.innerText = user.email;

    // VERIFICA PERFIL ADMIN
    const docRef = doc(db, "usuarios", user.email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().tipo === "admin") {
      areaAdmin.style.display = "block";
    } else {
      areaAdmin.style.display = "none";
    }

    carregarPecas();
    carregarHistorico();
  } else {
    loginTela.style.display = "block";
    sistemaTela.style.display = "none";
    // Limpa campos ao deslogar
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("cadEmail").value = "";
    document.getElementById("cadSenha").value = "";
    erro.innerText = "";
    erro.style.color = "#ef4444";
  }
});

// 🔥 CONVERTER IMAGEM PARA BASE64
function converterBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// 🔥 SALVAR PEÇA
btnSalvarPeca.onclick = async () => {
  const nome = nomePeca.value;
  const quantidade = Number(quantidadePeca.value);
  const file = fotoPeca.files[0];

  let imagemBase64 = "";
  if (file) imagemBase64 = await converterBase64(file);

  await addDoc(collection(db, "pecas"), {
    nome,
    quantidade,
    imagem: imagemBase64
  });

  nomePeca.value = "";
  quantidadePeca.value = "";
  fotoPeca.value = "";
  carregarPecas();
};

// 🔥 CARREGAR PEÇAS
async function carregarPecas() {
  listaPecas.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "pecas"));

  querySnapshot.forEach((docItem) => {
    const peca = docItem.data();
    const div = document.createElement("div");
    div.className = "peca";

    div.innerHTML = `
      <h4>${peca.nome}</h4>
      <p>Qtd: ${peca.quantidade}</p>
      ${peca.imagem ? `<img src="${peca.imagem}" width="100" onclick="ampliarImagem('${peca.imagem}')">` : ""}
      <br>
      <button class="btn-principal" style="margin-top:8px;" onclick="retirar('${docItem.id}', ${peca.quantidade}, '${peca.nome}')">Retirar</button>
    `;
    listaPecas.appendChild(div);
  });
}

// 🔥 ZOOM DA IMAGEM
window.ampliarImagem = (src) => {
  const modal = document.getElementById("imagemModal");
  const imagemAmpliada = document.getElementById("imagemAmpliada");
  if (modal && imagemAmpliada) {
    modal.style.display = "block";
    imagemAmpliada.src = src;
  }
};

window.fecharModal = () => {
  const modal = document.getElementById("imagemModal");
  if (modal) modal.style.display = "none";
};

// 🔥 RETIRAR PEÇA
window.retirar = async (id, qtdAtual, nomePeca) => {
  if (qtdAtual <= 0) return alert("Sem estoque");

  const usuarioAtual = auth.currentUser;
  if (!usuarioAtual) return alert("Você precisa estar logado.");

  const novaQtd = qtdAtual - 1;
  await updateDoc(doc(db, "pecas", id), { quantidade: novaQtd });

  await addDoc(collection(db, "historico"), {
    acao: "retirada",
    peca: nomePeca,
    usuario: usuarioAtual.email, 
    data: new Date().toLocaleString(),
    timestamp: new Date()
  });

  carregarPecas();
  carregarHistorico();
};

// 🔥 MOSTRAR / ESCONDER HISTÓRICO
if (btnToggleHistorico) {
  btnToggleHistorico.onclick = () => {
    historicoArea.style.display = (historicoArea.style.display === "none" || historicoArea.style.display === "") ? "block" : "none";
  };
}

// 🔥 CARREGAR HISTÓRICO
async function carregarHistorico(emailFiltro = "") {
  if (!historicoLista) return; 
  historicoLista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "historico"));

  querySnapshot.forEach((docItem) => {
    const item = docItem.data();
    const emailUsuario = item.usuario || "Desconhecido"; 
    const nomeDaPeca = item.peca || "Não identificada";

    if (emailFiltro && !emailUsuario.toLowerCase().includes(emailFiltro.toLowerCase())) return; 

    const div = document.createElement("div");
    div.style.padding = "8px 0";
    div.style.borderBottom = "1px solid #334155";
    div.style.color = "#cbd5e1";
    div.innerText = `${emailUsuario} retirou [${nomeDaPeca}] em ${item.data}`;

    historicoLista.appendChild(div);
  });
}

// 🔥 FILTRAR
if (btnFiltrar) {
  btnFiltrar.onclick = () => {
    carregarHistorico(filtroUsuario.value.trim());
  };
}