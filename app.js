let lives = 3;
let currentlevel = 4;
let livesDisplay = document.getElementById("lives");
livesDisplay.innerText = lives;
let moveBallConstant;
let checkBallConstant;
const gameDisplay = document.querySelector("#game-display");
let gameDisplayWidth = 15 * 55;
let gameDisplayHeight = 10 * 55;
console.log(gameDisplayHeight, gameDisplayWidth);
const ball = document.createElement("div");
ball.setAttribute("id", "ball");
const userBlock = document.createElement("div");
userBlock.setAttribute("id", "user-block");
let ballX = gameDisplayWidth / 2 - 10;
let ballY = gameDisplayHeight - (1 * 55 + 21);
let ballMidPoint = [];
let ballMidX;
let ballMidY;
let userBlockX = 6 * 55;
const userBlockY = 9 * 55;
let randomizer = Math.random();
console.log(randomizer);
let ballVelocityX;
if (randomizer < 0.5) {
  ballVelocityX = 1;
} else {
  ballVelocityX = -1;
}
let ballVelocityY = -1;
let currentBlock;
const x = "x";
const o = "o";
const u = "u";
const rowHeight = 55;
const blockWidth = 55;
const colorArray = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
];
let gameMap;
async function loadLevels() {
  let allLevelsRaw = await fetch("maps.json");
  let allLevels = await allLevelsRaw.json();
  gameMap = allLevels.levels[currentlevel - 1].map;
  console.log(gameMap);
}

class Block {
  constructor(rowNum, blockNum) {
    this.rowNum = rowNum;
    this.blockNum = blockNum;
    this.name = `block-${this.rowNum}-${this.blockNum}`;
    this.colorNum = rowNum;
    this.breakPoints = gameMap.length - 4 - this.rowNum;
    this.topLeft = [this.blockNum * blockWidth, this.rowNum * rowHeight];
    this.bottomRight = [
      this.blockNum * blockWidth + blockWidth,
      this.rowNum * rowHeight + rowHeight,
    ];
    this.element = document.createElement("div");
    this.element.innerText = this.breakPoints;
    this.element.style.backgroundColor = colorArray[this.colorNum];
    this.element.setAttribute("class", "block");
    this.element.setAttribute("id", this.name);
    this.lastHitTime = 0;
    this.coolDownDuration = 168;
    this.currentTime;
  }
  hitBlock() {
    this.currentTime = Date.now();
    if (this.currentTime - this.lastHitTime >= this.coolDownDuration) {
      this.lastHitTime = this.currentTime;
      this.breakPoints--;
      this.element.innerText = this.breakPoints;
      this.colorNum++;
      this.element.style.backgroundColor = colorArray[this.colorNum];
      if (ballMidX <= this.topLeft[0]) {
        ballVelocityX = -1;
      } else if (ballMidX >= this.bottomRight[0]) {
        ballVelocityX = 1;
      } else if (ballMidY <= this.topLeft[1]) {
        ballVelocityY = -1;
      } else if (ballMidY >= this.bottomRight[1]) {
        ballVelocityY = 1;
      } else {
        ballVelocityX *= -1;
        ballVelocityY *= -1;
      }
    }
  }
  checkForCollisionWithBall() {
    if (
      ballX + 21 >= this.topLeft[0] &&
      ballX <= this.bottomRight[0] &&
      ballY + 21 >= this.topLeft[1] &&
      ballY <= this.bottomRight[1]
    ) {
      this.hitBlock();
      return;
    } else {
      this.lastHitTime = 0;
    }
    return;
  }
}
const blockList = [];

function loadMap() {
  for (let i = 0; i < gameMap.length; i++) {
    let row = gameMap[i];
    for (let j = 0; j < row.length; j++) {
      let box = row[j];
      let boxDiv;
      if (box === "o") {
        boxDiv = document.createElement("div");
        boxDiv.setAttribute("class", "empty");
      } else {
        let block = new Block(i, j);
        blockList.push(block);
        boxDiv = block.element;
      }
      gameDisplay.append(boxDiv);
    }
  }
}

function movePlayer(e) {
  switch (e.key) {
    case "ArrowLeft":
      if (userBlockX >= 15) {
        userBlockX -= 15;
      }
      userBlock.style.left = userBlockX + "px";
      break;
    case "ArrowRight":
      if (userBlockX <= 12 * 55 - 15) {
        userBlockX += 15;
      }
      userBlock.style.left = userBlockX + "px";
      break;
    default:
      break;
  }
}

function loadPlayer() {
  ball.style.left = ballX + "px";
  ball.style.top = ballY + "px";
  userBlock.style.left = userBlockX + "px";
  userBlock.style.top = userBlockY + "px";
  gameDisplay.appendChild(ball);
  gameDisplay.appendChild(userBlock);
}

async function loadGame() {
  await loadLevels();
  loadPlayer();
  loadMap();
}
loadGame();

function checkCollision() {
  ballMidPoint = [ballX + 10, ballY + 10];
  ballMidX = ballMidPoint[0];
  ballMidY = ballMidPoint[1];
  // check for collisions with walls
  // check for collision from top
  if (ballY <= 0) {
    ballVelocityY = 1;
  }
  // check for collision from bottom, if yes then game over
  if (ballY + 21 >= gameDisplayHeight) {
    gameOver();
  }
  // check for collision from left
  if (ballX <= 0) {
    ballVelocityX = 1;
  }
  // check for collision from right
  if (ballX + 21 >= gameDisplayWidth) {
    ballVelocityX = -1;
  }

  // check for collision with userblock
  if (
    ballY + 21 >= userBlockY &&
    ballX + 21 >= userBlockX &&
    ballY < userBlockY + 10 &&
    ballX < userBlockX + 165
  ) {
    if (ballMidX <= userBlockX) {
      ballVelocityX = -1;
    } else if (ballMidX >= userBlockX + 165) {
      ballVelocityX = 1;
    } else if (ballMidY <= userBlockY) {
      ballVelocityY = -1;
    } else if (ballMidY >= userBlockY + 10) {
      ballVelocityY = 1;
    }
  }
  for (let i = blockList.length - 1; i >= 0; i--) {
    currentBlock = blockList[i];
    currentBlock.checkForCollisionWithBall();
    if (currentBlock.breakPoints <= 0) {
      currentBlock.element.innerText = "";
      currentBlock.element.setAttribute("class", "empty");
      currentBlock.element.removeAttribute("id");
      currentBlock.element.style.backgroundColor = "white";
      blockList.splice(i, 1);
      if (blockList.length === 0) {
        gameDisplay.innerHTML = "You win!";
        currentlevel++;
      }
    }
  }
  return;
}
function moveBall() {
  ballX += ballVelocityX;
  ballY += ballVelocityY;

  ball.style.left = ballX + "px";
  ball.style.top = ballY + "px";
}

function startGame() {
  document.addEventListener("keydown", movePlayer);
  if (moveBallConstant === undefined) {
    moveBallConstant = setInterval(moveBall, 8);
  }
  if (checkBallConstant === undefined) {
    checkBallConstant = setInterval(checkCollision, 4);
  }
  ballVelocityY = 2;
  randomizer = Math.random();
  if (randomizer < 0.5) {
    ballVelocityX = 1;
  } else {
    ballVelocityX = -1;
  }
}

function gameOver() {
  lives--;
  ballX = gameDisplayWidth / 2 - 10;
  ballY = gameDisplayHeight - (1 * 55 + 21);
  ballVelocityX = 0;
  ballVelocityY = 0;
  userBlockX = 6 * 55;
  clearInterval(moveBallConstant);
  clearInterval(checkBallConstant);
  moveBallConstant = undefined;
  checkBallConstant = undefined;
  if (lives === 0) {
    gameDisplay.innerHTML = "";
    loadMap();
  }
  loadPlayer();
  document.removeEventListener("keydown", movePlayer);
  livesDisplay.innerText = lives;
}

function movePlayerRight() {
  if (userBlockX >= 15) {
    userBlockX -= 15;
  }
  userBlock.style.left = userBlockX + "px";
}
function movePlayerLeft() {
  if (userBlockX <= 12 * 55 - 15) {
    userBlockX += 15;
  }
  userBlock.style.left = userBlockX + "px";
}
