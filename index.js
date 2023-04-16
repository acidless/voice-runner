const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 250;
let currentVolume = 0;
let gameX = 0;
let gameInterval;
const gameOverBlock = document.querySelector(".game-over-block");

const objects = {
    ground: {x: 0, y: CANVAS_HEIGHT - 50, w: CANVAS_WIDTH, h: 2},
    player: {x: 50, y: CANVAS_HEIGHT - 50, w: 5, h: 10},
    obstacles: []
};

const canvas = document.querySelector("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;


const ctx = canvas.getContext("2d");
ctx.fillStyle = "#000";

startGame();
function startGame(){
    clearInterval(gameInterval);
    gameOverBlock.style.display = "none"

    gameX = 0;
    objects.obstacles = [];
    gameInterval = setInterval(gameLoop, 10);
}

function gameOver(){
    clearInterval(gameInterval);
    gameOverBlock.style.display = "flex";
}

async function gameLoop(){
    objects.player.y = CANVAS_HEIGHT - 50 - currentVolume * 2;
    if(objects.player.y + objects.player.h > objects.ground.y){
        objects.player.y = objects.ground.y - objects.player.h;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillRect(objects.ground.x, objects.ground.y, objects.ground.w, objects.ground.h);
    ctx.fillRect(objects.player.x, objects.player.y, objects.player.w, objects.player.h);

    for (const obst of objects.obstacles) {
        const horizontalCollide = objects.player.x >= obst.x - gameX && objects.player.x <= obst.x - gameX + obst.w;
        const verticalCollide = obst.type ? objects.player.y <= obst.y + obst.h : objects.player.y >= obst.y

        if (horizontalCollide && verticalCollide) {
            gameOver();
        }

        ctx.fillRect(obst.x - gameX, obst.y, obst.w, obst.h);
    }

    gameX++;
    generateObjects();
}

function generateObjects() {
    for (const obst of objects.obstacles) {
        if (obst.x - gameX <= 0) {
            objects.obstacles.shift();
        }
    }

    if (!objects.obstacles.length) {
        const count = Math.floor(Math.random() * 10 + 1);
        let dist = CANVAS_WIDTH;
        for (let i = 0; i < count; i++) {
            dist += generateObject(dist);
        }
    }
}

function generateObject(dist){
    const type = Math.floor(Math.random() * 2);
    const height = Math.random() * 80 + 30;
    let y = CANVAS_HEIGHT - 50 - height;

    if (type) {
        y = 0;
    }

    const distPlus = Math.random() * 500 + 50;
    objects.obstacles.push({x: distPlus + dist + gameX, y, w: 5, h: height, type});
    return distPlus;
}


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
if (navigator.getUserMedia) {
    navigator.getUserMedia({
            audio: true
        },
        function (stream) {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            javascriptNode.onaudioprocess = function () {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                let values = 0;

                const length = array.length;
                for (let i = 0; i < length; i++) {
                    values += (array[i]);
                }

                currentVolume = values / length;
            }
        },
        function (err) {
            console.log("The following error occured: " + err.name)
        });
} else {
    console.log("getUserMedia not supported");
}