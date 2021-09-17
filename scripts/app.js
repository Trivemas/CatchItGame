/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let goodBlockRatio = 0.35;
let blockSpawnRate = 500;
const BLOCK_SIZE = 32;

let player = {
    x: 0,
    y: canvas.height - BLOCK_SIZE * 3,
    width: BLOCK_SIZE * 2,
    height: BLOCK_SIZE / 2,
    isMovingLeft: false,
    isMovingRight: false,
    speed: 7.5,
    update: function() {
        //if player is moving
        if(this.isMovingLeft) this.x -= this.speed;
        if(this.isMovingRight) this.x += this.speed;

        //if in or out of bounds
        if(this.x < 0) this.x = 0;
        if(this.x >= canvas.width - this.width) this.x = canvas.width - this.width;
    },
    render: function() {
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
};

let scoreBoard = {
    goodTally: 0,
    badTally: 0,
    scoreBlock: function(block) {
        if(block.isGoodBlock) {
            this.goodTally++;
        } else {
            this.badTally++;
        }
    },
};

window.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft' || e.key === 'a') // || means or
        player.isMovingLeft = true;
    if(e.key === 'ArrowRight' || e.key === 'd')
        player.isMovingRight = true;
});

window.addEventListener('keyup', (e) => {
    if(e.key === 'ArrowLeft' || e.key === 'a') // || means or
        player.isMovingLeft = false;
    if(e.key === 'ArrowRight' || e.key === 'd')
        player.isMovingRight = false;
});

class Block {
    constructor() {
        this.width = BLOCK_SIZE;
        this.height = this.width;
        this.x = Math.random() * canvas.width - this.width;
        this.y = 0 - this.height; //this makes the block start offscreen
        this.speed = Math.random() * 10 + 1;
        this.isGoodBlock = Math.random() <= goodBlockRatio;
        this.isOffScreen = false;
        this.isCaught = false;
        this.isScored = false;
        this.isMissed = false;
        this.opacity = 1;
        this.color = this.isGoodBlock ? 120 : 0;
    }
   
    update() {
        this.y += this.speed;
        if(this.y >= canvas.height) this.isOffScreen = true;
        this.catchCheck();
        if(this.isMissed) this.opacity -= 0.1;
    }
  
    render() {
        ctx.save();
        ctx.fillStyle = `hsla(${this.color}, 100%, 50%, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();

    }

    catchCheck() {
        let bottom = this.y + this.height;
       if(bottom < player.y) return;
       if(this.isMissed || this.isOffScreen || this.isCaught) return;
       let rhs = this.x + this.width; // could just put this.x + this.width instead of making it a variable too
       if(rhs < player.x || this.x > player.x + player.width) {
           this.isMissed = true;
           return;
       }

       this.isCaught = true;
    }
}

// let myBlock = new Block();
// console.log(myBlock)

let blocks = [ new Block() ];
let currentTime = 0;
let timeSinceLastBlock = 0;

function gameLoop(timestamp) {
    // console.log(timestamp)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - currentTime;
     //delta means change so deltaTime = change in time
    currentTime = timestamp;
    timeSinceLastBlock += deltaTime;
    if(timeSinceLastBlock >= blockSpawnRate) {
        timeSinceLastBlock = 0;
        blocks.push(new Block());
    }
    blocks.forEach((block) => {
        block.update();
        block.render();
    });
// console.log(blocks)
    blocks = blocks.filter(b => !b.isOffScreen && !b.isCaught);

    player.update();
    player.render();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
