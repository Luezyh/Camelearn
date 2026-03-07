const perguntas = document.querySelectorAll(".trilha-titulo");

perguntas.forEach(pergunta => {

    pergunta.addEventListener("click", () => {

        const resposta = pergunta.nextElementSibling;
        const seta = pergunta.querySelector("img")

        if (resposta.style.maxHeight) {
            resposta.style.maxHeight = null;
            seta.classList.toggle("girar")
        }
        else {
            resposta.style.maxHeight = resposta.scrollHeight + "px";
            seta.classList.toggle("girar")
        }

    });

});