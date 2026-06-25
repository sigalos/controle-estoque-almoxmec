// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  setDoc,
  deleteDoc
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

// 🔥 VARIAVEIS GLOBAIS DE CONTROLE
let ehAdminGlobal = false;
let todasAsPecas = []; // Armazena a lista vinda do banco para busca local ultra-rápida
const TOKEN_COMUM = "mec123";   
const TOKEN_ADMIN = "admin123"; 

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

// ELEMENTOS DOS OLHOS DE VISUALIZAR SENHA
const senhaInput = document.getElementById("senha");
const cadSenhaInput = document.getElementById("cadSenha");
const toggleSenhaLogin = document.getElementById("toggleSenhaLogin");
const toggleSenhaCad = document.getElementById("toggleSenhaCad");

// ELEMENTOS DO SISTEMA
const nomePeca = document.getElementById("nomePeca");
const quantidadePeca = document.getElementById("quantidadePeca");
const localPeca = document.getElementById("localPeca");
const fotoPeca = document.getElementById("fotoPeca");
const btnSalvarPeca = document.getElementById("btnSalvarPeca");
const listaPecas = document.getElementById("listaPecas");
const buscaPeca = document.getElementById("buscaPeca"); // Novo
const historicoLista = document.getElementById("historicoLista");
const historicoArea = document.getElementById("historicoArea");
const areaAdmin = document.getElementById("areaAdmin");
const btnToggleHistorico = document.getElementById("btnToggleHistorico");
const btnFiltrar = document.getElementById("btnFiltrar");
const filtroUsuario = document.getElementById("filtroUsuario");

// 👁️ LOGICA PARA MOSTRAR/ESCONDER A SENHA (LOGIN)
toggleSenhaLogin.onclick = () => {
  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    toggleSenhaLogin.innerText = "🙈";
  } else {
    senhaInput.type = "password";
    toggleSenhaLogin.innerText = "👁️";
  }
};

// 👁️ LOGICA PARA MOSTRAR/ESCONDER A SENHA (CADASTRO)
toggleSenhaCad.onclick = () => {
  if (cadSenhaInput.type === "password") {
    cadSenhaInput.type = "text";
    toggleSenhaCad.innerText = "🙈";
  } else {
    cadSenhaInput.type = "password";
    toggleSenhaCad.innerText = "👁️";
  }
};

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
  const senha = senhaInput.value;

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
  const senha = cadSenhaInput.value;
  const tokenDigitado = document.getElementById("cadToken").value.trim();

  if (!email || !senha || !tokenDigitado) {
    return erro.innerText = "Preencha todos os campos obrigatórios.";
  }
  if (senha.length < 6) {
    return erro.innerText = "A senha deve ter no mínimo 6 dígitos.";
  }

  let tipoUsuario = "";
  if (tokenDigitado === TOKEN_ADMIN) {
    tipoUsuario = "admin";
  } else if (tokenDigitado === TOKEN_COMUM) {
    tipoUsuario = "comum";
  } else {
    return erro.innerText = "Chave de Acesso incorreta. Solicite ao administrador.";
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.email), {
      email: user.email,
      tipo: tipoUsuario 
    });

    erro.style.color = "#22c55e";
    erro.innerText = `Conta criada como [${tipoUsuario}]! Entrando...`;
  } catch (e) {
    erro.style.color = "#ef4444";
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

    const docRef = doc(db, "usuarios", user.email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().tipo === "admin") {
      areaAdmin.style.display = "block";
      ehAdminGlobal = true;
    } else {
      areaAdmin.style.display = "none";
      ehAdminGlobal = false;
    }

    carregarPecas();
    carregarHistorico();
  } else {
    loginTela.style.display = "block";
    sistemaTela.style.display = "none";
    document.getElementById("email").value = "";
    senhaInput.value = "";
    document.getElementById("cadEmail").value = "";
    cadSenhaInput.value = "";
    document.getElementById("cadToken").value = "";
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
  const nome = nomePeca.value.trim();
  const quantidade = Number(quantidadePeca.value);
  const local = localPeca.value.trim() || "Não Informado";
  const file = fotoPeca.files[0];

  if (!nome || !quantidade) return alert("Preencha o nome e a quantidade!");

  let imagemBase64 = "";
  if (file) imagemBase64 = await converterBase64(file);

  await addDoc(collection(db, "pecas"), {
    nome,
    quantidade,
    local,
    imagem: imagemBase64
  });

  nomePeca.value = "";
  quantidadePeca.value = "";
  localPeca.value = "";
  fotoPeca.value = "";
  carregarPecas();
};

// 🔥 CARREGAR PEÇAS DO BANCO DE DADOS
async function carregarPecas() {
  todasAsPecas = []; // Limpa o array antes de repovoar
  const querySnapshot = await getDocs(collection(db, "pecas"));

  querySnapshot.forEach((docItem) => {
    todasAsPecas.push({
      id: docItem.id,
      ...docItem.data()
    });
  });

  // Mostra todas por padrão ao carregar a página
  renderizarPecasNaTela(todasAsPecas);
}

// 🔍 FUNÇÃO AUXILIAR PARA EXIBIR AS PEÇAS JÁ FILTRADAS
function renderizarPecasNaTela(listaFiltrada) {
  listaPecas.innerHTML = "";

  if(listaFiltrada.length === 0) {
    listaPecas.innerHTML = "<p style='color:#94a3b8; text-align:center;'>Nenhuma peça encontrada.</p>";
    return;
  }

  listaFiltrada.forEach((peca) => {
    const div = document.createElement("div");
    div.className = "peca";
    const localizacao = peca.local || "Não informado";

    div.innerHTML = `
      <h4>${peca.nome}</h4>
      <div class="qtd-tag">Qtd: ${peca.quantidade}</div>
      <div class="local-tag">📍 ${localizacao}</div>
      ${peca.imagem ? `<img src="${peca.imagem}" width="100" onclick="ampliarImagem('${peca.imagem}')">` : ""}
      <button class="btn-principal" style="margin-top:12px;" onclick="retirar('${peca.id}', ${peca.quantidade}, '${peca.nome}')">Retirar</button>
      ${ehAdminGlobal ? `
        <div class="admin-actions">
          <button class="btn-editar" onclick="alert('Funcionalidade de edição em desenvolvimento.')">✏️ Editar</button>
          <button class="btn-excluir" onclick="excluirPeca('${peca.id}', '${peca.nome}')">❌ Excluir</button>
        </div>
      ` : ""}
    `;
    listaPecas.appendChild(div);
  });
}

// 🔍 EVENTO DE DIGITAÇÃO PARA BUSCA EM TEMPO REAL (MECANISMO AUTO-DIGITE)
buscaPeca.oninput = () => {
  const termoDeBusca = buscaPeca.value.toLowerCase().trim();
  
  // Filtra o array comparando o termo digitado com o nome ou local da peça
  const pecasFiltradas = todasAsPecas.filter(peca => {
    const nomeContem = peca.nome.toLowerCase().includes(termoDeBusca);
    const localContem = peca.local && peca.local.toLowerCase().includes(termoDeBusca);
    return nomeContem || localContem;
  });

  renderizarPecasNaTela(pecasFiltradas);
};

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

// 🔥 EXCLUIR PEÇA
window.excluirPeca = async (id, nomePeca) => {
  const confirmacao = confirm(`Tem certeza que deseja apagar permanentemente a peça [${nomePeca}]?`);
  if (!confirmacao) return;

  const usuarioAtual = auth.currentUser;

  try {
    await deleteDoc(doc(db, "pecas", id));

    await addDoc(collection(db, "historico"), {
      acao: "exclusao",
      peca: nomePeca,
      usuario: usuarioAtual ? usuarioAtual.email : "Admin",
      data: new Date().toLocaleString(),
      timestamp: new Date()
    });

    alert("Peça removida com sucesso!");
    carregarPecas();
    carregarHistorico();
  } catch (erro) {
    alert("Erro ao excluir peça.");
  }
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

  const itens = [];
  querySnapshot.forEach(docItem => itens.push(docItem.data()));
  itens.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

  itens.forEach((item) => {
    const emailUsuario = item.usuario || "Desconhecido"; 
    const nomeDaPeca = item.peca || "Não identificada";
    const acaoTexto = item.acao === "exclusao" ? "EXCLUIU permanentemente" : "retirou";

    if (emailFiltro && !emailUsuario.toLowerCase().includes(emailFiltro.toLowerCase())) return; 

    const div = document.createElement("div");
    div.style.padding = "8px 0";
    div.style.borderBottom = "1px solid #334155";
    div.style.color = item.acao === "exclusao" ? "#f87171" : "#cbd5e1";
    
    div.innerText = `${emailUsuario} ${acaoTexto} [${nomeDaPeca}] em ${item.data}`;

    historicoLista.appendChild(div);
  });
}

// 🔥 FILTRAR HISTÓRICO
if (btnFiltrar) {
  btnFiltrar.onclick = () => {
    carregarHistorico(filtroUsuario.value.trim());
  };
}
