// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"; //[cite: 10]
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; //[cite: 10]

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
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; //[cite: 10]

// 🔥 CONFIG (MANTÉM O SEU)
const firebaseConfig = {
  apiKey: "AIzaSyBQGoNZaDvXuGwaIfaAmvZ2DHCID3MMaAA",
  authDomain: "almoxmec-cb491.firebaseapp.com",
  projectId: "almoxmec-cb491",
  storageBucket: "almoxmec-cb491.firebasestorage.app",
  messagingSenderId: "673430655860",
  appId: "1:673430655860:web:ef6438070fbfeb2854d221"
}; //[cite: 10]

// 🔥 INIT
const app = initializeApp(firebaseConfig); //[cite: 10]
const auth = getAuth(app); //[cite: 10]
const db = getFirestore(app); //[cite: 10]

// 🔥 VARIAVEIS GLOBAIS DE CONTROLE
let ehAdminGlobal = false; //[cite: 10]
let todasAsPecas = []; // Armazena a lista vinda do banco para busca local ultra-rápida[cite: 10]
let idPecaSendoEditada = null; // Controla se estamos salvando uma peça nova ou editando uma existente
const TOKEN_COMUM = "mec123";   //[cite: 10]
const TOKEN_ADMIN = "admin123"; //[cite: 10]

// 🔥 ELEMENTOS DE AUTENTICAÇÃO E ABAS
const loginTela = document.getElementById("loginTela"); //[cite: 10]
const sistemaTela = document.getElementById("sistemaTela"); //[cite: 10]
const btnLogin = document.getElementById("btnLogin"); //[cite: 10]
const btnLogout = document.getElementById("btnLogout"); //[cite: 10]
const erro = document.getElementById("erro"); //[cite: 10]
const usuarioLogado = document.getElementById("usuarioLogado"); //[cite: 10]

const tabLogin = document.getElementById("tabLogin"); //[cite: 10]
const tabCadastro = document.getElementById("tabCadastro"); //[cite: 10]
const formLogin = document.getElementById("formLogin"); //[cite: 10]
const formCadastro = document.getElementById("formCadastro"); //[cite: 10]
const btnCadastrar = document.getElementById("btnCadastrar"); //[cite: 10]

// ELEMENTOS DOS OLHOS DE VISUALIZAR SENHA
const senhaInput = document.getElementById("senha"); //[cite: 10]
const cadSenhaInput = document.getElementById("cadSenha"); //[cite: 10]
const toggleSenhaLogin = document.getElementById("toggleSenhaLogin"); //[cite: 10]
const toggleSenhaCad = document.getElementById("toggleSenhaCad"); //[cite: 10]

// ELEMENTOS DO SISTEMA
const nomePeca = document.getElementById("nomePeca"); //[cite: 10]
const quantidadePeca = document.getElementById("quantidadePeca"); //[cite: 10]
const localPeca = document.getElementById("localPeca"); //[cite: 10]
const fotoPeca = document.getElementById("fotoPeca"); //[cite: 10]
const btnSalvarPeca = document.getElementById("btnSalvarPeca"); //[cite: 10]
const listaPecas = document.getElementById("listaPecas"); //[cite: 10]
const buscaPeca = document.getElementById("buscaPeca"); // Novo[cite: 10]
const historicoLista = document.getElementById("historicoLista"); //[cite: 10]
const historicoArea = document.getElementById("historicoArea"); //[cite: 10]
const areaAdmin = document.getElementById("areaAdmin"); //[cite: 10]
const btnToggleHistorico = document.getElementById("btnToggleHistorico"); //[cite: 10]
const btnFiltrar = document.getElementById("btnFiltrar"); //[cite: 10]
const filtroUsuario = document.getElementById("filtroUsuario"); //[cite: 10]

// 👁️ LOGICA PARA MOSTRAR/ESCONDER A SENHA (LOGIN)
toggleSenhaLogin.onclick = () => {
  if (senhaInput.type === "password") { //[cite: 10]
    senhaInput.type = "text"; //[cite: 10]
    toggleSenhaLogin.innerText = "🙈"; //[cite: 10]
  } else {
    senhaInput.type = "password"; //[cite: 10]
    toggleSenhaLogin.innerText = "👁️"; //[cite: 10]
  }
}; //[cite: 10]

// 👁️ LOGICA PARA MOSTRAR/ESCONDER A SENHA (CADASTRO)
toggleSenhaCad.onclick = () => {
  if (cadSenhaInput.type === "password") { //[cite: 10]
    cadSenhaInput.type = "text"; //[cite: 10]
    toggleSenhaCad.innerText = "🙈"; //[cite: 10]
  } else {
    cadSenhaInput.type = "password"; //[cite: 10]
    toggleSenhaCad.innerText = "👁️"; //[cite: 10]
  }
}; //[cite: 10]

// 🔄 CONTROLADOR DE ABAS (LOGIN / CADASTRO)
tabLogin.onclick = () => {
  tabLogin.classList.add("active"); //[cite: 10]
  tabCadastro.classList.remove("active"); //[cite: 10]
  formLogin.style.display = "block"; //[cite: 10]
  formCadastro.style.display = "none"; //[cite: 10]
  erro.innerText = ""; //[cite: 10]
}; //[cite: 10]

tabCadastro.onclick = () => {
  tabCadastro.classList.add("active"); //[cite: 10]
  tabLogin.classList.remove("active"); //[cite: 10]
  formLogin.style.display = "none"; //[cite: 10]
  formCadastro.style.display = "block"; //[cite: 10]
  erro.innerText = ""; //[cite: 10]
}; //[cite: 10]

// 🔥 AÇÃO DE LOGIN
btnLogin.onclick = async () => {
  const email = document.getElementById("email").value.trim(); //[cite: 10]
  const senha = senhaInput.value; //[cite: 10]

  if (!email || !senha) return erro.innerText = "Preencha todos os campos."; //[cite: 10]

  try {
    await signInWithEmailAndPassword(auth, email, senha); //[cite: 10]
    erro.innerText = ""; //[cite: 10]
  } catch (e) {
    erro.innerText = "E-mail ou senha incorretos."; //[cite: 10]
  }
}; //[cite: 10]

// 🔥 AÇÃO DE CADASTRO DE USUÁRIO
btnCadastrar.onclick = async () => {
  const email = document.getElementById("cadEmail").value.trim(); //[cite: 10]
  const senha = cadSenhaInput.value; //[cite: 10]
  const tokenDigitado = document.getElementById("cadToken").value.trim(); //[cite: 10]

  if (!email || !senha || !tokenDigitado) {
    return erro.innerText = "Preencha todos os campos obrigatórios."; //[cite: 10]
  }
  if (senha.length < 6) {
    return erro.innerText = "A senha deve ter no mínimo 6 dígitos."; //[cite: 10]
  }

  let tipoUsuario = ""; //[cite: 10]
  if (tokenDigitado === TOKEN_ADMIN) { //[cite: 10]
    tipoUsuario = "admin"; //[cite: 10]
  } else if (tokenDigitado === TOKEN_COMUM) { //[cite: 10]
    tipoUsuario = "comum"; //[cite: 10]
  } else {
    return erro.innerText = "Chave de Acesso incorreta. Solicite ao administrador."; //[cite: 10]
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha); //[cite: 10]
    const user = userCredential.user; //[cite: 10]

    await setDoc(doc(db, "usuarios", user.email), {
      email: user.email, //[cite: 10]
      tipo: tipoUsuario //[cite: 10]
    });

    erro.style.color = "#22c55e"; //[cite: 10]
    erro.innerText = `Conta criada como [${tipoUsuario}]! Entrando...`; //[cite: 10]
  } catch (e) {
    erro.style.color = "#ef4444"; //[cite: 10]
    if (e.code === "auth/email-already-in-use") { //[cite: 10]
      erro.innerText = "Este e-mail já está cadastrado."; //[cite: 10]
    } else {
      erro.innerText = "Erro ao criar conta. Tente novamente."; //[cite: 10]
    }
  }
}; //[cite: 10]

// 🔥 LOGOUT
btnLogout.onclick = () => {
  signOut(auth); //[cite: 10]
}; //[cite: 10]

// 🔥 DETECTA ESTADO DE LOGIN
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginTela.style.display = "none"; //[cite: 10]
    sistemaTela.style.display = "block"; //[cite: 10]
    usuarioLogado.innerText = user.email; //[cite: 10]

    const docRef = doc(db, "usuarios", user.email); //[cite: 10]
    const docSnap = await getDoc(docRef); //[cite: 10]

    if (docSnap.exists() && docSnap.data().tipo === "admin") { //[cite: 10]
      areaAdmin.style.display = "block"; //[cite: 10]
      ehAdminGlobal = true; //[cite: 10]
    } else {
      areaAdmin.style.display = "none"; //[cite: 10]
      ehAdminGlobal = false; //[cite: 10]
    }

    carregarPecas(); //[cite: 10]
    carregarHistorico(); //[cite: 10]
  } else {
    loginTela.style.display = "block"; //[cite: 10]
    sistemaTela.style.display = "none"; //[cite: 10]
    document.getElementById("email").value = ""; //[cite: 10]
    senhaInput.value = ""; //[cite: 10]
    document.getElementById("cadEmail").value = ""; //[cite: 10]
    cadSenhaInput.value = ""; //[cite: 10]
    document.getElementById("cadToken").value = ""; //[cite: 10]
    erro.innerText = ""; //[cite: 10]
    erro.style.color = "#ef4444"; //[cite: 10]
  }
});

// 🔥 CONVERTER IMAGEM PARA BASE64
function converterBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); //[cite: 10]
    reader.readAsDataURL(file); //[cite: 10]
    reader.onload = () => resolve(reader.result); //[cite: 10]
    reader.onerror = error => reject(error); //[cite: 10]
  });
}

// 🔥 SELEÇÃO PARA MODO DE EDIÇÃO
window.editarPeca = (id, nome, quantidade, local) => {
  idPecaSendoEditada = id; // Guarda o identificador do banco
  
  // Preenche os campos do painel Admin
  nomePeca.value = nome;
  quantidadePeca.value = quantidade;
  localPeca.value = local === "Não Informado" ? "" : local;
  
  // Rola até o formulário de edição suavemente
  areaAdmin.scrollIntoView({ behavior: 'smooth' });
  
  // Modifica a identidade visual do botão principal
  btnSalvarPeca.innerText = "🔄 Atualizar Peça";
  btnSalvarPeca.style.background = "#22c55e"; 
};

// 🔥 SALVAR OU ATUALIZAR PEÇA
btnSalvarPeca.onclick = async () => {
  const nome = nomePeca.value.trim(); //[cite: 10]
  const quantidade = Number(quantidadePeca.value); //[cite: 10]
  const local = localPeca.value.trim() || "Não Informado"; //[cite: 10]
  const file = fotoPeca.files[0]; //[cite: 10]

  if (!nome || !quantidade) return alert("Preencha o nome e a quantidade!"); //[cite: 10]

  let imagemBase64 = ""; //[cite: 10]
  if (file) imagemBase64 = await converterBase64(file); //[cite: 10]

  if (idPecaSendoEditada) {
    // Modo Edição: Atualizar registro existente
    try {
      const dadosAtualizados = { nome, quantidade, local };
      if (imagemBase64) dadosAtualizados.imagem = imagemBase64;

      await updateDoc(doc(db, "pecas", idPecaSendoEditada), dadosAtualizados);
      alert("Peça atualizada com sucesso!");
      
      // Restaura o botão ao estado padrão
      idPecaSendoEditada = null;
      btnSalvarPeca.innerText = "Salvar peça";
      btnSalvarPeca.style.background = "#f59e0b";
    } catch (e) {
      alert("Erro ao atualizar a peça.");
    }
  } else {
    // Modo Padrão: Adicionar nova peça
    await addDoc(collection(db, "pecas"), {
      nome, //[cite: 10]
      quantidade, //[cite: 10]
      local, //[cite: 10]
      imagem: imagemBase64 //[cite: 10]
    });
    alert("Nova peça adicionada com sucesso!");
  }

  // Reseta os campos do formulário
  nomePeca.value = ""; //[cite: 10]
  quantidadePeca.value = ""; //[cite: 10]
  localPeca.value = ""; //[cite: 10]
  fotoPeca.value = ""; //[cite: 10]
  carregarPecas(); //[cite: 10]
};

// 🔥 CARREGAR PEÇAS DO BANCO DE DADOS
async function carregarPecas() {
  todasAsPecas = []; // Limpa o array antes de repovoar[cite: 10]
  const querySnapshot = await getDocs(collection(db, "pecas")); //[cite: 10]

  querySnapshot.forEach((docItem) => {
    todasAsPecas.push({
      id: docItem.id, //[cite: 10]
      ...docItem.data() //[cite: 10]
    });
  });

  // Mostra todas por padrão ao carregar a página
  renderizarPecasNaTela(todasAsPecas); //[cite: 10]
}

// 🔍 FUNÇÃO AUXILIAR PARA EXIBIR AS PEÇAS JÁ FILTRADAS
function renderizarPecasNaTela(listaFiltrada) {
  listaPecas.innerHTML = ""; //[cite: 10]

  if(listaFiltrada.length === 0) {
    listaPecas.innerHTML = "<p style='color:#94a3b8; text-align:center;'>Nenhuma peça encontrada.</p>"; //[cite: 10]
    return;
  }

  listaFiltrada.forEach((peca) => {
    const div = document.createElement("div"); //[cite: 10]
    div.className = "peca"; //[cite: 10]
    const localizacao = peca.local || "Não informado"; //[cite: 10]

    div.innerHTML = `
      <h4>${peca.nome}</h4>
      <div class="qtd-tag">Qtd: ${peca.quantidade}</div>
      <div class="local-tag">📍 ${localizacao}</div>
      ${peca.imagem ? `<img src="${peca.imagem}" width="100" onclick="ampliarImagem('${peca.imagem}')">` : ""}
      <button class="btn-principal" style="margin-top:12px;" onclick="retirar('${peca.id}', ${peca.quantidade}, '${peca.nome}')">Retirar</button>
      ${ehAdminGlobal ? `
        <div class="admin-actions">
          <button class="btn-editar" onclick="editarPeca('${peca.id}', '${peca.nome}', ${peca.quantidade}, '${localizacao}')">✏️ Editar</button>
          <button class="btn-excluir" onclick="excluirPeca('${peca.id}', '${peca.nome}')">❌ Excluir</button>
        </div>
      ` : ""}
    `; //[cite: 10]
    listaPecas.appendChild(div); //[cite: 10]
  });
}

// 🔍 EVENTO DE DIGITAÇÃO PARA BUSCA EM TEMPO REAL (MECANISMO AUTO-DIGITE)
buscaPeca.oninput = () => {
  const termoDeBusca = buscaPeca.value.toLowerCase().trim(); //[cite: 10]
  
  // Filtra o array comparando o termo digitado com o nome ou local da peça
  const pecasFiltradas = todasAsPecas.filter(peca => {
    const nomeContem = peca.nome.toLowerCase().includes(termoDeBusca); //[cite: 10]
    const localContem = peca.local && peca.local.toLowerCase().includes(termoDeBusca); //[cite: 10]
    return nomeContem || localContem; //[cite: 10]
  });

  renderizarPecasNaTela(pecasFiltradas); //[cite: 10]
};

// 🔥 ZOOM DA IMAGEM
window.ampliarImagem = (src) => {
  const modal = document.getElementById("imagemModal"); //[cite: 10]
  const imagemAmpliada = document.getElementById("imagemAmpliada"); //[cite: 10]
  if (modal && imagemAmpliada) {
    modal.style.display = "block"; //[cite: 10]
    imagemAmpliada.src = src; //[cite: 10]
  }
};

window.fecharModal = () => {
  const modal = document.getElementById("imagemModal"); //[cite: 10]
  if (modal) modal.style.display = "none"; //[cite: 10]
};

// 🔥 RETIRAR PEÇA
window.retirar = async (id, qtdAtual, nomePeca) => {
  if (qtdAtual <= 0) return alert("Sem estoque"); //[cite: 10]

  const usuarioAtual = auth.currentUser; //[cite: 10]
  if (!usuarioAtual) return alert("Você precisa estar logado."); //[cite: 10]

  const novaQtd = qtdAtual - 1; //[cite: 10]
  await updateDoc(doc(db, "pecas", id), { quantidade: novaQtd }); //[cite: 10]

  await addDoc(collection(db, "historico"), {
    acao: "retirada", //[cite: 10]
    peca: nomePeca, //[cite: 10]
    usuario: usuarioAtual.email, //[cite: 10]
    data: new Date().toLocaleString(), //[cite: 10]
    timestamp: new Date() //[cite: 10]
  });

  carregarPecas(); //[cite: 10]
  carregarHistorico(); //[cite: 10]
};

// 🔥 EXCLUIR PEÇA
window.excluirPeca = async (id, nomePeca) => {
  const confirmacao = confirm(`Tem certeza que deseja apagar permanentemente a peça [${nomePeca}]?`); //[cite: 10]
  if (!confirmacao) return; //[cite: 10]

  const usuarioAtual = auth.currentUser; //[cite: 10]

  try {
    await deleteDoc(doc(db, "pecas", id)); //[cite: 10]

    await addDoc(collection(db, "historico"), {
      acao: "exclusao", //[cite: 10]
      peca: nomePeca, //[cite: 10]
      usuario: usuarioAtual ? usuarioAtual.email : "Admin", //[cite: 10]
      data: new Date().toLocaleString(), //[cite: 10]
      timestamp: new Date() //[cite: 10]
    });

    alert("Peça removida com sucesso!"); //[cite: 10]
    carregarPecas(); //[cite: 10]
    carregarHistorico(); //[cite: 10]
  } catch (erro) {
    alert("Erro ao excluir peça."); //[cite: 10]
  }
};

// 🔥 MOSTRAR / ESCONDER HISTÓRICO
if (btnToggleHistorico) {
  btnToggleHistorico.onclick = () => {
    historicoArea.style.display = (historicoArea.style.display === "none" || historicoArea.style.display === "") ? "block" : "none"; //[cite: 10]
  };
}

// 🔥 CARREGAR HISTÓRICO
async function carregarHistorico(emailFiltro = "") {
  if (!historicoLista) return; //[cite: 10]
  historicoLista.innerHTML = ""; //[cite: 10]

  const querySnapshot = await getDocs(collection(db, "historico")); //[cite: 10]

  const itens = []; //[cite: 10]
  querySnapshot.forEach(docItem => itens.push(docItem.data())); //[cite: 10]
  itens.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)); //[cite: 10]

  itens.forEach((item) => {
    const emailUsuario = item.usuario || "Desconhecido"; //[cite: 10]
    const nomeDaPeca = item.peca || "Não identificada"; //[cite: 10]
    const acaoTexto = item.acao === "exclusao" ? "EXCLUIU permanentemente" : "retirou"; //[cite: 10]

    if (emailFiltro && !emailUsuario.toLowerCase().includes(emailFiltro.toLowerCase())) return; //[cite: 10]

    const div = document.createElement("div"); //[cite: 10]
    div.style.padding = "8px 0"; //[cite: 10]
    div.style.borderBottom = "1px solid #334155"; //[cite: 10]
    div.style.color = item.acao === "exclusao" ? "#f87171" : "#cbd5e1"; //[cite: 10]
    
    div.innerText = `${emailUsuario} ${acaoTexto} [${nomeDaPeca}] em ${item.data}`; //[cite: 10]

    historicoLista.appendChild(div); //[cite: 10]
  });
}

// 🔥 FILTRAR HISTÓRICO
if (btnFiltrar) {
  btnFiltrar.onclick = () => {
    carregarHistorico(filtroUsuario.value.trim()); //[cite: 10]
  };
}

// 📦 REGISTRO DO SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado com sucesso!', reg)) //[cite: 10]
      .catch(err => console.error('Erro ao registrar Service Worker:', err)); //[cite: 10]
  });
} //[cite: 10]