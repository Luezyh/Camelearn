function adicionarMateria() {

    let nome = prompt("Digite o nome da matéria:");

    if (!nome) return;

    let div = document.createElement("div");
    div.className = "materia";

    div.innerHTML = `
<span>${nome}</span>
<input class="nota" type="number" min="0" max="10" step="0.1" placeholder="Nota">
`;

    document.getElementById("materias").appendChild(div);

}

function dividirTempoEstudo(notas, tempoTotalMin, blocoMinutos = 15) {

    let totalBlocos = Math.floor(tempoTotalMin / blocoMinutos);
    let numMaterias = notas.length;

    if (totalBlocos < numMaterias) {
        alert("Tempo insuficiente para dar pelo menos um bloco para cada matéria.");
        return [];
    }

    let blocos = new Array(numMaterias).fill(1);
    let blocosRestantes = totalBlocos - numMaterias;

    let pesos = notas.map(n => 10 - n);
    let somaPesos = pesos.reduce((a, b) => a + b, 0);

    if (somaPesos > 0) {

        let blocosDec = pesos.map(p => (p / somaPesos) * blocosRestantes);
        let extras = blocosDec.map(b => Math.floor(b));

        for (let i = 0; i < numMaterias; i++) {
            blocos[i] += extras[i];
        }

        let restante = blocosRestantes - extras.reduce((a, b) => a + b, 0);

        let indices = [...pesos.keys()].sort((a, b) => pesos[b] - pesos[a]);

        let i = 0;

        while (restante > 0) {
            blocos[indices[i]]++;
            restante--;
            i = (i + 1) % numMaterias;
        }

    }

    return blocos.map(b => {
        let minutos = b * blocoMinutos;
        let horas = Math.floor(minutos / 60);
        let mins = minutos % 60;

        return { horas, mins };
    });

}

function calcularCronograma() {

    let materias = document.querySelectorAll(".materia");

    let nomes = [];
    let notas = [];

    materias.forEach(m => {

        let nome = m.querySelector("span").innerText;
        let nota = parseFloat(m.querySelector("input").value);

        if (!isNaN(nota)) {
            nomes.push(nome);
            notas.push(nota);
        }

    });

    let tempo = parseInt(document.getElementById("tempo").value);
    let bloco = parseInt(document.getElementById("bloco").value);

    let resultado = dividirTempoEstudo(notas, tempo, bloco);

    let divResultado = document.getElementById("resultado");

    divResultado.innerHTML = "<h3>Cronograma:</h3>";

    resultado.forEach((t, i) => {
        divResultado.innerHTML += `${nomes[i]}: ${t.horas}h ${t.mins}min <br>`;
    });

}

document.addEventListener("input", function(e){

if(e.target.classList.contains("nota")){

if(e.target.value > 10){
e.target.value = 10;
}

if(e.target.value < 0){
e.target.value = 0;
}

}

});