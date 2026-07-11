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
  deleteDoc,
  query,      
  limit,      
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 CONFIG 
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
let idPecaSendoEditada = null; 
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
const quantitativePeca = document.getElementById("quantidadePeca");
const estoqueMinimoPeca = document.getElementById("estoqueMinimoPeca"); // Novo
const localPeca = document.getElementById("localPeca");
const fotoPeca = document.getElementById("fotoPeca");
const btnSalvarPeca = document.getElementById("btnSalvarPeca");
const listaPecas = document.getElementById("listaPecas");
const buscaPeca = document.getElementById("buscaPeca"); 
const historicoLista = document.getElementById("historicoLista");
const historicoArea = document.getElementById("historicoArea");
const areaAdmin = document.getElementById("areaAdmin");
const btnToggleHistorico = document.getElementById("btnToggleHistorico");
const btnFiltrar = document.getElementById("btnFiltrar");
const filtroUsuario = document.getElementById("filtroUsuario");

// NOVOS ELEMENTOS DO PAINEL DE REPOSIÇÃO
const btnToggleReposicao = document.getElementById("btnToggleReposicao");
const reposicaoArea = document.getElementById("reposicaoArea");
const reposicaoLista = document.getElementById("reposicaoLista");

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
      verificarPecasParaReposicao(); // Varre o banco para ver se há itens em falta
    } else {
      areaAdmin.style.display = "none";
      ehAdminGlobal = false;
    }

    buscaPeca.value = "";
    listaPecas.innerHTML = "<p style='color:#94a3b8; text-align:center; margin-top:20px;'>🔍 Digite o nome da peça para pesquisar no estoque...</p>";
    
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
    btnToggleReposicao.style.display = "none";
    reposicaoArea.style.display = "none";
  }
});

// 🛠️ FUNÇÃO AUXILIAR: COMPRIME E CONVERTE A FOTO DO CELULAR PARA BASE64
function comprimirEConverterParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 600; 
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

// 🔥 SELEÇÃO PARA MODO DE EDIÇÃO
window.editarPeca = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, "pecas", id));
    if (!docSnap.exists()) return;
    
    const pecaSelecionada = docSnap.data();
    idPecaSendoEditada = id; 
    
    nomePeca.value = pecaSelecionada.nome;
    quantitativePeca.value = pecaSelecionada.quantidade;
    estoqueMinimoPeca.value = pecaSelecionada.estoqueMinimo || 0; // Preenche estoque mínimo
    localPeca.value = pecaSelecionada.local === "Não Informado" ? "" : pecaSelecionada.local;
    
    areaAdmin.scrollIntoView({ behavior: 'smooth' });
    
    btnSalvarPeca.innerText = "🔄 Atualizar Peça";
    btnSalvarPeca.style.background = "#22c55e"; 
  } catch (err) {
    console.error(err);
  }
};

// 🔥 SALVAR OU ATUALIZAR PEÇA
btnSalvarPeca.onclick = async () => {
  const nome = nomePeca.value.trim();
  const quantitative = Number(quantitativePeca.value);
  const estoqueMin = Number(estoqueMinimoPeca.value) || 0; // Lê estoque mínimo
  const local = localPeca.value.trim() || "Não Informado";
  const file = fotoPeca.files[0];

  if (!nome || quantitative < 0) return alert("Preencha o nome e uma quantidade válida!");

  btnSalvarPeca.innerText = "⏳ Salvando...";
  btnSalvarPeca.disabled = true;

  try {
    let urlImagem = "";
    
    if (file) {
      urlImagem = await comprimirEConverterParaBase64(file);
    }

    const dadosPeca = { 
      nome, 
      quantidade: quantitative, 
      estoqueMinimo: estoqueMin, 
      local 
    };

    if (idPecaSendoEditada) {
      if (urlImagem) dadosPeca.imagem = urlImagem;

      await updateDoc(doc(db, "pecas", idPecaSendoEditada), dadosPeca);
      alert("Peça atualizada com sucesso!");
      
      idPecaSendoEditada = null;
      btnSalvarPeca.style.background = ""; 
    } else {
      if (urlImagem) dadosPeca.imagem = urlImagem;
      await addDoc(collection(db, "pecas"), dadosPeca);
      alert("Nova peça adicionada com sucesso!");
    }

    nomePeca.value = "";
    quantitativePeca.value = "";
    estoqueMinimoPeca.value = "";
    localPeca.value = "";
    fotoPeca.value = "";
    
    executarBuscaNoBanco(buscaPeca.value.trim());
    verificarPecasParaReposicao(); // Atualiza painel de compras automático

  } catch (erro) {
    console.error(erro);
    alert("Erro ao salvar a peça. Tente novamente.");
  } finally {
    btnSalvarPeca.innerText = idPecaSendoEditada ? "🔄 Atualizar Peça" : "Salvar peça";
    btnSalvarPeca.disabled = false;
  }
};

// 🔍 FUNÇÃO DE BUSCA LETRA POR LETRA ECONÔMICA
async function executarBuscaNoBanco(termo) {
  if (!termo || typeof termo !== "string") {
    listaPecas.innerHTML = "<p style='color:#94a3b8; text-align:center; margin-top:20px;'>🔍 Digite o nome da peça para pesquisar no estoque...</p>";
    return;
  }

  const termoFormatado = termo.charAt(0).toUpperCase() + termo.slice(1);

  try {
    const q = query(
      collection(db, "pecas"),
      where("nome", ">=", termoFormatado),
      where("nome", "<=", termoFormatado + "\uf8ff"),
      limit(15)
    );

    const querySnapshot = await getDocs(q);
    const pecasEncontradas = [];

    querySnapshot.forEach((docItem) => {
      pecasEncontradas.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    renderizarPecasNaTela(pecasEncontradas);

  } catch (erro) {
    console.error("Erro na busca: ", erro);
    listaPecas.innerHTML = "<p style='color:#ef4444; text-align:center;'>Erro ao conectar com o banco de dados.</p>";
  }
}

// 🔍 CAPTURA A DIGITAÇÃO EM TEMPO REAL
buscaPeca.oninput = () => {
  if (buscaPeca && buscaPeca.value) {
    const termoDeBusca = buscaPeca.value.trim();
    executarBuscaNoBanco(termoDeBusca);
  } else {
    listaPecas.innerHTML = "<p style='color:#94a3b8; text-align:center; margin-top:20px;'>🔍 Digite o nome da peça para pesquisar no estoque...</p>";
  }
};

// 🔍 EXIBIR AS PEÇAS BUSCADAS NA TELA
function renderizarPecasNaTela(listaFiltrada) {
  listaPecas.innerHTML = "";

  if (listaFiltrada.length === 0) {
    listaPecas.innerHTML = "<p style='color:#ef4444; text-align:center; margin-top:20px;'>⚠️ Nenhuma peça encontrada com esse nome.</p>";
    return;
  }

  listaFiltrada.forEach((peca) => {
    const div = document.createElement("div");
    div.className = "peca";
    const localizacao = peca.local || "Não informado";
    const estMinimo = peca.estoqueMinimo || 0;
    
    // Alerta visual discreto se a peça já estiver no vermelho na busca geral
    const estaNoVermelho = peca.quantidade <= estMinimo;
    const tagQtdCor = estaNoVermelho ? "background:#ef4444;" : "";

    div.innerHTML = `
      <h4>${peca.nome}</h4>
      <div class="qtd-tag" style="${tagQtdCor}">Qtd: ${peca.quantidade} ${estaNoVermelho ? '⚠️' : ''}</div>
      <div class="local-tag">📍 ${localizacao}</div>
      ${peca.imagem ? `<img src="${peca.imagem}" width="100" onclick="window.ampliarImagem('${peca.imagem}')">` : ""}
      <button class="btn-principal" style="margin-top:12px;" onclick="window.retirar('${peca.id}', ${peca.quantidade}, '${peca.nome}', ${estMinimo})">Retirar</button>
      ${ehAdminGlobal ? `
        <div class="admin-actions">
          <button class="btn-editar" onclick="window.editarPeca('${peca.id}')">✏️ Editar</button>
          <button class="btn-excluir" onclick="window.excluirPeca('${peca.id}', '${peca.nome}')">❌ Excluir</button>
        </div>
      ` : ""}
    `;
    listaPecas.appendChild(div);
  });
}

// 🔥 ZOOM DA IMAGEM E CONTROLE DO BOTÃO VOLTAR
window.ampliarImagem = (src) => {
  const modal = document.getElementById("imagemModal");
  const imagemAmpliada = document.getElementById("imagemAmpliada");
  
  if (modal && imagemAmpliada) {
    modal.style.display = "block";
    imagemAmpliada.src = src;
    window.history.pushState({ modalAberto: true }, "", "#zoom");
  }
};

window.fecharModal = () => {
  const modal = document.getElementById("imagemModal");
  
  if (modal && modal.style.display === "block") {
    modal.style.display = "none";
    if (window.location.hash === "#zoom") {
      window.history.back();
    }
  }
};

window.addEventListener("popstate", (event) => {
  const modal = document.getElementById("imagemModal");
  if (modal && modal.style.display === "block") {
    modal.style.display = "none";
  }
});

// 🔥 RETIRAR PEÇA (ATUALIZADO COM SEU ALERTA PERSONALIZADO DA PLANILHA)
window.retirar = async (id, qtdAtual, nomePeca, limiteMinimo) => {
  if (qtdAtual <= 0) return alert("Sem estoque disponível para esta peça.");

  const usuarioAtual = auth.currentUser;
  if (!usuarioAtual) return alert("Você precisa estar logado.");

  const confirmacao = confirm(`Deseja realmente retirar 1 unidade da peça [${nomePeca}]?`);
  if (!confirmacao) return;

  const novaQtd = qtdAtual - 1;
  await updateDoc(doc(db, "pecas", id), { quantidade: novaQtd });

  await addDoc(collection(db, "historico"), {
    acao: "retirada",
    peca: nomePeca,
    usuario: usuarioAtual.email,
    data: new Date().toLocaleString(),
    timestamp: new Date()
  });

  // Executa as atualizações de tela
  executarBuscaNoBanco(buscaPeca.value.trim());
  carregarHistorico();
  verificarPecasParaReposicao();

  // 🔴 SEU ALERTA PERSONALIZADO SOLICITADO (OPÇÃO 2)
  if (novaQtd <= limiteMinimo) {
    alert(`⚠️ ATENÇÃO: LIMITE CRÍTICO ATINGIDO!\n\nPor favor, faça um pedido de mais peças na planilha de pedidos.`);
  } else {
    alert("Peça retirada com sucesso!");
  }
};

// ❌ EXCLUIR PEÇA
window.excluirPeca = async (id, nomePeca) => {
  const confirmacao = confirm(`Tem certeza que deseja apagar permanentemente a peça [${nomePeca}]?`);
  if (!confirmacao) return;

  try {
    await deleteDoc(doc(db, "pecas", id));
    alert("Peça removida com sucesso.");
    executarBuscaNoBanco(buscaPeca.value.trim());
    verificarPecasParaReposicao();
  } catch (erro) {
    console.error(erro);
    alert("Erro ao remover a peça.");
  }
};

// 📊 HISTÓRICO CORRIGIDO (MÁXIMO 10 ITENS)
async function carregarHistorico() {
  try {
    const q = query(collection(db, "historico"), orderBy("timestamp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    
    let conteudoHtml = "";
    
    if (querySnapshot.empty) {
      historicoLista.innerHTML = "<p style='color:#94a3b8; text-align:center;'>Nenhuma atividade recente.</p>";
      return;
    }

    querySnapshot.forEach((docItem) => {
      const dados = docItem.data();
      conteudoHtml += `
        <div style="background:#0f1e36; padding:12px; margin-bottom:8px; border-radius:8px; border-left:4px solid #f59e0b;">
          <p style="margin:0 0 4px 0; font-size:14px;"><strong>Peça:</strong> ${dados.peca}</p>
          <p style="margin:0 0 4px 0; font-size:13px; color:#cbd5e1;"><strong>Quem:</strong> ${dados.usuario}</p>
          <p style="margin:0; font-size:11px; color:#94a3b8;">📅 ${dados.data}</p>
        </div>
      `;
    });
    
    historicoLista.innerHTML = conteudoHtml;
  } catch (erro) {
    console.error("Erro ao carregar histórico: ", erro);
    historicoLista.innerHTML = "<p style='color:#ef4444; font-size:12px;'>Erro ao carregar histórico.</p>";
  }
}

// 🔴 FUNÇÃO: VARRE O BANCO EM BUSCA DE ITENS NO VERMELHO E GERENCIA O BOTÃO PISCANTE
async function verificarPecasParaReposicao() {
  if (!ehAdminGlobal) return;

  try {
    const querySnapshot = await getDocs(collection(db, "pecas"));
    let tabelaHtml = `
      <table class="tabela-reposicao">
        <thead>
          <tr>
            <th>Peça</th>
            <th>Qtd Atual</th>
            <th>Mínimo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    let possuiItensCriticos = false;

    querySnapshot.forEach((docItem) => {
      const peca = docItem.data();
      const estMinimo = peca.estoqueMinimo || 0;
      
      if (peca.quantidade <= estMinimo) {
        possuiItensCriticos = true;
        tabelaHtml += `
          <tr>
            <td><strong>${peca.nome}</strong></td>
            <td style="color:#ef4444; font-weight:bold;">${peca.quantidade} un</td>
            <td>${estMinimo} un</td>
            <td><span class="status-critico">RECOMPRAR</span></td>
          </tr>
        `;
      }
    });

    tabelaHtml += `</tbody></table>`;

    if (possuiItensCriticos) {
      btnToggleReposicao.style.display = "block";
      btnToggleReposicao.classList.add("btn-alerta-piscante");
      btnToggleReposicao.innerText = "⚠️ Itens Críticos!";
      reposicaoLista.innerHTML = tabelaHtml;
    } else {
      btnToggleReposicao.style.display = "none";
      btnToggleReposicao.classList.remove("btn-alerta-piscante");
      reposicaoArea.style.display = "none";
      reposicaoLista.innerHTML = "";
    }

  } catch (err) {
    console.error("Erro ao processar reposição: ", err);
  }
}

// 📊 CONTROLADOR DO HISTÓRICO
btnToggleHistorico.onclick = () => {
  if (historicoArea.style.display === "none") {
    historicoArea.style.display = "block";
    btnToggleHistorico.innerText = "🙈 Esconder Histórico";
    carregarHistorico();
  } else {
    historicoArea.style.display = "none";
    btnToggleHistorico.innerText = "📊 Ver Histórico";
  }
};

// 📊 CONTROLADOR DO PAINEL DE REPOSIÇÃO (ADMIN)
btnToggleReposicao.onclick = () => {
  if (reposicaoArea.style.display === "none") {
    reposicaoArea.style.display = "block";
  } else {
    reposicaoArea.style.display = "none";
  }
};

// 🔍 FILTRAR HISTÓRICO LOCALMENTE
btnFiltrar.onclick = () => {
  const emailFiltro = filtroUsuario.value.toLowerCase().trim();
  const blocos = historicoLista.getElementsByTagName("div");

  for (let bloco of blocos) {
    const textoBloco = bloco.innerText.toLowerCase();
    if (textoBloco.includes(emailFiltro)) {
      bloco.style.display = "block";
    } else {
      bloco.style.display = "none";
    }
  }
};