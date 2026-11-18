// --- WORKSPACES ---
// a "esteira" que rola para os lados e os 4 workspaces dentro dela
const esteira = document.querySelector("#workspaces");
const workspaces = [...document.querySelectorAll(".workspace")];
const linksDoMenu = document.querySelectorAll("#menu a");

// quem pede ao sistema "menos animação" troca de workspace sem deslizar
const menosAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// descobre em qual workspace (0, 1, 2 ou 3) está a seção com esse id
function indiceDaSecao(idDaSecao) {
  if (!idDaSecao) {
    return -1; // endereço sem "#alguma-coisa"
  }

  return workspaces.findIndex(function (workspace) {
    return workspace.querySelector("#" + idDaSecao) !== null;
  });
}

// desliza a esteira até o workspace de número "indice"
function irPara(indice, animar) {
  if (indice < 0 || indice >= workspaces.length) {
    return; // não existe workspace antes do primeiro nem depois do último
  }

  esteira.scrollTo({
    left: indice * esteira.clientWidth,
    behavior: animar && !menosAnimacao ? "smooth" : "auto",
  });
}

// qual workspace está na tela agora (arredonda a posição da esteira)
function workspaceAtual() {
  return Math.round(esteira.scrollLeft / esteira.clientWidth);
}

// as bordas da tela que levam ao workspace anterior e ao próximo
const bordaAnterior = document.querySelector(".borda-anterior");
const bordaProxima = document.querySelector(".borda-proxima");

// deixa verde no menu só o workspace com esse número
function marcarNoMenu(indice) {
  linksDoMenu.forEach(function (link, posicao) {
    link.classList.toggle("ativo", posicao === indice);
  });

  // no primeiro workspace some a borda "anterior"; no último, a "próxima"
  bordaAnterior.hidden = indice === 0;
  bordaProxima.hidden = indice === workspaces.length - 1;
}

// clicar numa borda vai para o workspace ao lado (-1 = anterior, 1 = próximo)
[bordaAnterior, bordaProxima].forEach(function (borda) {
  borda.addEventListener("click", function () {
    irPara(workspaceAtual() + Number(borda.dataset.direcao), true);
  });
});

// qualquer link que aponte para uma seção ("#projetos", "#contato"...) troca de workspace
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (evento) {
    const idDaSecao = link.getAttribute("href").slice(1); // tira o "#"
    const indice = indiceDaSecao(idDaSecao);

    if (indice !== -1) {
      evento.preventDefault(); // em vez de pular, a gente desliza
      irPara(indice, true);
      // muda o endereço (ex.: ".../#projetos") sem recarregar, para dar para compartilhar o link
      history.replaceState(null, "", "#" + idDaSecao);
    }
  });
});

// o "IntersectionObserver" avisa qual workspace ocupa a maior parte da tela
const observador = new IntersectionObserver(
  function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        marcarNoMenu(workspaces.indexOf(entrada.target));
      }
    });
  },
  { root: esteira, threshold: 0.6 }
);

workspaces.forEach(function (workspace) {
  observador.observe(workspace);
});

// rola para cima ou para baixo o workspace que está na tela
function rolarWorkspace(distancia, animar) {
  workspaces[workspaceAtual()].scrollBy({
    top: distancia,
    behavior: animar && !menosAnimacao ? "smooth" : "auto",
  });
}

// teclado: ← → trocam de workspace; ↑ ↓, PageUp, PageDown, Home e End rolam o workspace
document.addEventListener("keydown", function (evento) {
  const temJanelaAberta = document.querySelector("dialog[open]") !== null;

  // com a janela de detalhes aberta, o teclado fica com ela;
  // e com Alt, Ctrl ou Cmd apertado é um atalho do navegador (ex.: Alt + ← volta a página)
  if (temJanelaAberta || evento.altKey || evento.ctrlKey || evento.metaKey) {
    return;
  }

  const workspace = workspaces[workspaceAtual()];
  // segurando a tecla, o navegador repete o evento; aí rolamos sem animação, para não travar
  const animar = !evento.repeat;

  if (evento.key === "ArrowRight") {
    irPara(workspaceAtual() + 1, true);
  } else if (evento.key === "ArrowLeft") {
    irPara(workspaceAtual() - 1, true);
  } else if (evento.key === "ArrowDown") {
    rolarWorkspace(60, animar);
  } else if (evento.key === "ArrowUp") {
    rolarWorkspace(-60, animar);
  } else if (evento.key === "PageDown") {
    rolarWorkspace(workspace.clientHeight * 0.9, animar);
  } else if (evento.key === "PageUp") {
    rolarWorkspace(-workspace.clientHeight * 0.9, animar);
  } else if (evento.key === "Home") {
    rolarWorkspace(-workspace.scrollHeight, true);
  } else if (evento.key === "End") {
    rolarWorkspace(workspace.scrollHeight, true);
  } else {
    return; // qualquer outra tecla funciona normalmente
  }

  evento.preventDefault();
});

// se a janela do navegador mudar de tamanho, continua no mesmo workspace
let workspaceAntesDeRedimensionar = 0;

esteira.addEventListener("scroll", function () {
  workspaceAntesDeRedimensionar = workspaceAtual();
});

window.addEventListener("resize", function () {
  irPara(workspaceAntesDeRedimensionar, false);
});

// ao abrir a página com um endereço tipo ".../#curriculo", já começa nesse workspace
const indiceInicial = indiceDaSecao(location.hash.slice(1));
irPara(indiceInicial === -1 ? 0 : indiceInicial, false);
marcarNoMenu(indiceInicial === -1 ? 0 : indiceInicial);

// --- JANELA DE DETALHES ---

// botões com "data-abrir" abrem a janela cujo id está escrito nele
document.querySelectorAll("[data-abrir]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    const janela = document.getElementById(botao.dataset.abrir);
    // "showModal" abre a janela por cima da página e escurece o fundo
    janela.showModal();
  });
});

document.querySelectorAll("dialog").forEach(function (janela) {
  // o botão [ x ] fecha a janela (a tecla Esc já fecha sozinha)
  janela.querySelector("[data-fechar]").addEventListener("click", function () {
    janela.close();
  });

  // clicar no fundo escuro, fora da janela, também fecha
  janela.addEventListener("click", function (evento) {
    if (evento.target === janela) {
      janela.close();
    }
  });
});

// --- PROMPT DIGITANDO ---
// no fim de cada janela, o prompt digita um comando, espera, apaga e digita outro

// comandos de cada tela (a chave é o id da seção, ou da janela de detalhes)
const comandosPorTela = {
  apresentacao: ["neofetch", "uptime", "echo $SHELL", "history | tail -3", "ls ~/projetos"],
  projetos: ["git status", "git log --oneline", "ls -la", "cat README.md", "xed index.html"],
  curriculo: ["grep -i python skills.txt", "wc -l curriculo.txt", "cat formacao.txt", "less curriculo.txt"],
  contato: ["ping -c 1 github.com", "echo \"vamos conversar?\"", "xdg-open linkedin.com/in/nicolascsf"],
  "detalhes-api": ["flask run", "git log --oneline", "cat requirements.txt", "python3 app.py"],
};

// easter eggs: aparecem de vez em nunca, com uma resposta na linha de baixo
const easterEggs = [
  { comando: "echo $APELIDO", resposta: "nickmouse 🐭" },
  { comando: "roll 1d20", resposta: "20! acerto crítico 🎲" },
  { comando: "sudo make me a sandwich", resposta: "ok. 🥪" },
];

// chance de um comando ser easter egg (0.05 = 5%, mais ou menos 1 a cada 20)
const chanceDeEasterEgg = 0.05;

// espera "ms" milissegundos (1000 ms = 1 segundo)
function esperar(ms) {
  return new Promise(function (continuar) {
    setTimeout(continuar, ms);
  });
}

// sorteia um item de uma lista, sem repetir o anterior
function sortear(lista, anterior) {
  let item;
  do {
    item = lista[Math.floor(Math.random() * lista.length)];
  } while (lista.length > 1 && item === anterior);
  return item;
}

// "async" deixa a função usar "await esperar(...)", que pausa só ela, sem travar a página
async function animarPrompt(prompt, comandos) {
  const cursor = prompt.querySelector(".cursor");

  // onde as letras aparecem: logo antes do cursor
  const texto = document.createElement("span");
  texto.setAttribute("aria-hidden", "true");
  prompt.insertBefore(texto, cursor);

  // linha de resposta dos easter eggs, embaixo do prompt (começa escondida)
  const resposta = document.createElement("p");
  resposta.className = "resposta-terminal";
  resposta.setAttribute("aria-hidden", "true");
  resposta.hidden = true;
  prompt.after(resposta);

  // cada prompt começa num momento diferente, para não ficarem todos iguais
  await esperar(500 + Math.random() * 1500);

  let anterior = null;

  while (true) {
    const ehEasterEgg = Math.random() < chanceDeEasterEgg;
    const egg = ehEasterEgg ? sortear(easterEggs) : null;
    const comando = ehEasterEgg ? egg.comando : sortear(comandos, anterior);
    anterior = comando;

    // digitando: o cursor para de piscar, como num terminal de verdade
    cursor.classList.add("parado");
    for (const letra of comando) {
      texto.textContent += letra;
      await esperar(60 + Math.random() * 80);
    }
    cursor.classList.remove("parado");

    if (egg) {
      await esperar(400);
      resposta.textContent = egg.resposta;
      resposta.hidden = false;
      await esperar(3000);
      resposta.hidden = true;
    } else {
      await esperar(1800);
    }

    // apagando, letra por letra
    cursor.classList.add("parado");
    while (texto.textContent.length > 0) {
      texto.textContent = texto.textContent.slice(0, -1);
      await esperar(35);
    }
    cursor.classList.remove("parado");

    await esperar(900);
  }
}

// quem pede "menos animação" ao sistema fica só com o cursor parado
if (!menosAnimacao) {
  document.querySelectorAll(".prompt-final").forEach(function (prompt) {
    // descobre de qual tela é o prompt: a seção do workspace ou a janela de detalhes
    const tela = prompt.closest(".workspace, dialog");
    const secao = tela.querySelector("section");
    const chave = tela.tagName === "DIALOG" ? tela.id : secao.id;

    if (comandosPorTela[chave]) {
      animarPrompt(prompt, comandosPorTela[chave]);
    }
  });
}
