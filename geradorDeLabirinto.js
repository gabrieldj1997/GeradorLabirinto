const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const nodeWidth = 80;
const nodeHeight = 80;

var jogador;
var bagArestas
var estadoJogo
var matriz
var cancellationToken = null

init()

async function init() {
    jogador = InitJogador();
    bagArestas = []
    estadoJogo = false
    matriz = []
    if (cancellationToken != null) {
        clearInterval(cancellationToken);
        cancellationToken = null
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    matriz = CreateMatriz()
    DesenharArestas(matriz);
    DesenharNumeros(matriz);
    bagArestas = BagArestas(matriz);
    arestasCount = bagArestas.length;
    do {
        aresta = SortearAresta(bagArestas);
        if (VerificarAresta(matriz, aresta)) {
            AbrirAresta(matriz, aresta);
            DesenharNumeros(matriz);
            await sleep(500).then()
        }
    } while (!VerificarCaminho(matriz))
    Finish(matriz);
    matriz = CreateMatriz();
    LetPlay();
}

async function sleep(ms, string = null) {
    return new Promise(resolve => setTimeout(() => {
        resolve((() => {
            if (string != null) {
                alert(string)
            }
        })())
    }, ms));
}

function CreateMatriz() {
    const matriz = [];
    for (let i = 0; i < canvasWidth / nodeWidth; i++) {
        matriz[i] = [];
        for (let x = 0; x < canvasHeight / nodeHeight; x++) {
            matriz[i][x] = ((i * (canvasWidth / nodeWidth)) + x);
        }
    }
    return matriz;
}

function DesenharArestas(matriz) {
    for (let i = 0; i < matriz.length; i++) {
        for (x = 0; x < matriz[i].length; x++) {
            ctx.fillStyle = '#000';
            ctx.strokeRect(i * nodeWidth, x * nodeHeight, nodeWidth, nodeHeight);
        }
    }
}

function DesenharNumeros(matriz) {
    for (let i = 0; i < matriz.length; i++) {
        for (let x = 0; x < matriz[i].length; x++) {
            linha = i;
            coluna = x
            ctx.fillStyle = '#fff';
            ctx.fillRect((coluna * nodeWidth) + 1, (linha * nodeHeight) + 1, nodeWidth - 2, nodeHeight - 2);
            ctx.font = '20px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText(matriz[i][x], (x * nodeWidth) + (nodeWidth / 5), (i * nodeHeight) + (nodeHeight - (nodeHeight / 10)), (nodeWidth) - 2, (nodeHeight) - 2, nodeWidth);
        }
    }
}

function BagArestas(matriz) {
    const arestas = [];

    for (let i = 0; i < matriz.length; i++) {
        for (let x = 0; x < matriz[i].length; x++) {
            if (x < matriz[i].length - 1) {
                arestas.push([matriz[i][x], matriz[i][x + 1]]);
            }
            if (i < matriz.length - 1) {
                arestas.push([matriz[i][x], matriz[i + 1][x]]);
            }
        }
    }
    return arestas
}

function SortearAresta(bagArestas) {
    const aresta = bagArestas[Math.floor(Math.random() * bagArestas.length)];
    return aresta;
}

function VerificarAresta(matriz, aresta) {
    const x = matriz[Math.floor(aresta[0] / (canvasWidth / nodeWidth))][aresta[0] % (canvasWidth / nodeWidth)];
    const y = matriz[Math.floor(aresta[1] / (canvasWidth / nodeWidth))][aresta[1] % (canvasWidth / nodeWidth)];

    if (x != y) {
        bagArestas.splice(bagArestas.findIndex(i => i[0] == aresta[0] && i[1] == aresta[1]), 1);
        return true
    }
    return false
}

function AbrirAresta(matriz, aresta) {
    const x = matriz[Math.floor(aresta[0] / (canvasWidth / nodeWidth))][aresta[0] % (canvasWidth / nodeWidth)];
    const y = matriz[Math.floor(aresta[1] / (canvasWidth / nodeWidth))][aresta[1] % (canvasWidth / nodeWidth)];
    let nMaior = x > y ? x : y;
    let nMenor = x < y ? x : y;
    let arestaMaior = aresta[0] > aresta[1] ? aresta[0] : aresta[1];
    let arestaMenor = aresta[0] < aresta[1] ? aresta[0] : aresta[1];
    if (arestaMaior - arestaMenor == 1) {//vertical
        ctx.fillStyle = '#fff';
        linha = Math.floor(arestaMenor / (canvasWidth / nodeWidth))
        coluna = arestaMenor % (canvasHeight / nodeHeight)
        ctx.fillRect((coluna * nodeWidth) + 1, (linha * nodeHeight) + 1, (nodeWidth - 1) * 2, nodeHeight - 2);
    } else {//horizontal
        ctx.fillStyle = '#fff';
        linha = Math.floor(arestaMenor / (canvasWidth / nodeWidth))
        coluna = arestaMenor % (canvasHeight / nodeHeight)
        ctx.fillRect((coluna * nodeWidth) + 1, (linha * nodeHeight) + 1, nodeWidth - 2, (nodeHeight * 2) - 2);
    }
    for (let i = 0; i < matriz.length; i++) {
        for (let x = 0; x < matriz[i].length; x++) {
            if (matriz[i][x] == nMaior) {
                matriz[i][x] = nMenor;
            }
        }
    }
}

function VerificarCaminho(matriz) {
    for (let i = 0; i < matriz.length; i++) {
        for (let x = 0; x < matriz[i].length; x++) {
            if (matriz[i][x] != 0) {
                return false;
            }
        }
    }
    return true;
}

function Finish(matriz) {
    linha = Math.floor(((matriz.length * matriz[0].length) - 1) / (canvasWidth / nodeWidth))
    coluna = ((matriz.length * matriz[0].length) - 1) % (canvasHeight / nodeHeight)
    ctx.font = '10px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('Start', 0 * nodeWidth + (nodeWidth / 3), 0 * nodeHeight + nodeHeight / 2, nodeWidth, nodeHeight, nodeWidth);
    ctx.fillText('end', (coluna * nodeWidth) + (nodeWidth / 3), (coluna * nodeHeight) + nodeHeight / 2, nodeWidth, nodeHeight, nodeWidth);
}

async function LetPlay() {
    estadoJogo = true
    if (cancellationToken != null) {
        clearInterval(cancellationToken);
        cancellationToken = null
    }
    cancellationToken = setInterval(() => {
        DesenharJogador()
        if (jogador.ind == (matriz.length * matriz[0].length) - 1) {
            clearInterval(cancellationToken)
            estadoJogo = false
            sleep(2000, 'você ganhou! Aperter enter para reiniciar').then()
            window.location.reload()
        }
    }, 10)
}

function InitJogador() {
    return {
        x: 0,
        y: 0,
        antX: -1,
        antY: -1,
        ind: 0,
    }
}

function MovimentacaoJogador(jogador, direcao) {
    jogador.antX = jogador.x;
    jogador.antY = jogador.y;
    if (direcao == 'ArrowRight' || direcao == 'd' || direcao == 'D') {
        if (jogador.x < (matriz.length - 1)) {
            jogador.x++;
        }
    } else if (direcao == 'ArrowLeft' || direcao == 'a' || direcao == 'A') {
        if (jogador.x >= 0) {
            jogador.x--;
        }
    } else if (direcao == 'ArrowUp' || direcao == 'w' || direcao == 'W') {
        if (jogador.y >= 0) {
            jogador.y--;
        }
    } else if (direcao == 'ArrowDown' || direcao == 's' || direcao == 'S') {
        if (jogador.y < (matriz[0].length - 1)) {
            jogador.y++;
        }
    }
}

function DesenharJogador() {
    //Desenhar posição atual do jogador
    ctx.beginPath();
    ctx.fillStyle = '#00FF00';
    ctx.arc(jogador.x * nodeWidth + nodeWidth / 2, jogador.y * nodeHeight + nodeHeight / 2, nodeWidth / 4, 0, 2 * Math.PI, false);
    ctx.fill();
    //Desenhar posição anterior do jogador
    ctx.beginPath();
    ctx.fillStyle = '#FF0000';
    ctx.arc(jogador.antX * nodeWidth + nodeWidth / 2, jogador.antY * nodeHeight + nodeHeight / 2, nodeWidth / 4, 0, 2 * Math.PI, false);
    ctx.fill();
}

function ValidarMovimento(jogador, key, bagArestas) {
    let indAnt = jogador.ind;
    let indAtual = 0;
    let xAtual = jogador.x;
    let yAtual = jogador.y;
    if (key == 'ArrowRight' || key == 'd' || key == 'D') {
        indAtual = (jogador.x + 1) + (jogador.y * canvasWidth / nodeWidth);
        xAtual++;
    } else if (key == 'ArrowLeft' || key == 'a' || key == 'A') {
        indAtual = (jogador.x - 1) + (jogador.y * canvasWidth / nodeWidth);
        xAtual--;
    } else if (key == 'ArrowUp' || key == 'w' || key == 'W') {
        indAtual = jogador.x + ((jogador.y - 1) * canvasWidth / nodeWidth);
        yAtual--;
    } else if (key == 'ArrowDown' || key == 's' || key == 'S') {
        indAtual = jogador.x + ((jogador.y + 1) * canvasWidth / nodeWidth);
        yAtual++;
    }
    if (indAtual < 0 || indAtual >= (matriz.length * matriz[0].length)
        || xAtual < 0 || xAtual >= matriz.length
        || yAtual < 0 || yAtual >= matriz[0].length) {
        return false
    }
    let maior = indAnt > indAtual ? indAnt : indAtual;
    let menor = indAnt < indAtual ? indAnt : indAtual;
    if (bagArestas.findIndex(i => i[0] == menor && i[1] == maior) == -1) {
        jogador.ind = indAtual;
        return true
    }
    return false
}

document.addEventListener('keydown', event => {
    console.log(jogador)
    if (ValidarMovimento(jogador, event.key, bagArestas)) {
        MovimentacaoJogador(jogador, event.key);
    }
})