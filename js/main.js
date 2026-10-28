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

// deixa verde no menu só o workspace com esse número
function marcarNoMenu(indice) {
  linksDoMenu.forEach(function (link, posicao) {
    link.classList.toggle("ativo", posicao === indice);
  });
}

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

// setas ← e → do teclado trocam de workspace
document.addEventListener("keydown", function (evento) {
  const temJanelaAberta = document.querySelector("dialog[open]") !== null;

  if (temJanelaAberta) {
    return; // com a janela de detalhes aberta, as setas não trocam de workspace
  }

  if (evento.key === "ArrowRight") {
    evento.preventDefault();
    irPara(workspaceAtual() + 1, true);
  } else if (evento.key === "ArrowLeft") {
    evento.preventDefault();
    irPara(workspaceAtual() - 1, true);
  }
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
