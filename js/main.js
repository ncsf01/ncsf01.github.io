const botaoMenu = document.querySelector(".botao-menu");
const menu = document.querySelector("#menu");
const linksDoMenu = document.querySelectorAll("#menu a");

botaoMenu.addEventListener("click", function () {
  const estaAberto = menu.classList.toggle("aberto");

  botaoMenu.setAttribute("aria-expanded", estaAberto);
});

// ao clicar num link, o menu do celular fecha
linksDoMenu.forEach(function (link) {
  link.addEventListener("click", function () {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
  });
});

// --- VERDINHO NO MENU: mostra em qual parte da página você está ---

const secoes = document.querySelectorAll(".secao");

// deixa verde só o link da seção com esse id
function marcarNoMenu(idDaSecao) {
  linksDoMenu.forEach(function (link) {
    const apontaParaSecao = link.getAttribute("href") === "#" + idDaSecao;
    link.classList.toggle("ativo", apontaParaSecao);
  });
}

// o "IntersectionObserver" avisa quando uma seção passa pela faixa do meio da tela
const observador = new IntersectionObserver(
  function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        marcarNoMenu(entrada.target.id);
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

secoes.forEach(function (secao) {
  observador.observe(secao);
});

// o contato é curto e fica no fim da página: pode nunca chegar no meio da tela,
// então, quando a página chega ao final, marcamos o contato
window.addEventListener("scroll", function () {
  const chegouNoFim =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  if (chegouNoFim) {
    marcarNoMenu("contato");
  }
});

// ao abrir a página, a apresentação já começa marcada
marcarNoMenu("apresentacao");

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
