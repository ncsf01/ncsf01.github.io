const botaoMenu = document.querySelector(".botao-menu");
const menu = document.querySelector("#menu");
const linksDoMenu = document.querySelectorAll("#menu a");

botaoMenu.addEventListener("click", function () {
  const estaAberto = menu.classList.toggle("aberto");

  botaoMenu.setAttribute("aria-expanded", estaAberto);
});

// ao clicar num link: fecha o menu do celular e deixa só esse link verde
linksDoMenu.forEach(function (link) {
  link.addEventListener("click", function () {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");

    linksDoMenu.forEach(function (outroLink) {
      outroLink.classList.remove("ativo");
    });
    link.classList.add("ativo");
  });
});

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
