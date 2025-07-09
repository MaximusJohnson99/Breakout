let lives = 3;
let score = 0;
let scoreDisplay = document.getElementById("score");
let currentlevel = 1;
let livesDisplay = document.getElementById("lives");
livesDisplay.innerText = `Lives: ${lives}`;
let moveBallConstant;
let checkBallConstant;
const gameDisplay = document.querySelector("#game-display");
let gameDisplayWidth = 15 * 55;
let gameDisplayHeight = 10 * 55;
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
const blockList = [];
const gameOverScreen = `<div class="gameend-screen"><h1>Game Over!</h1><h3>Score: ${score}</h3><button onclick='resetGame()'>Retry</button></div>`;
const winScreen = `<div class="gameend-screen"><h1>You Win!</h1> <button onclick="loadNextLevel()">Next Level</button></div>`;
const completeScreen = `<div class="gameend-screen"><h1>Congratulations! You have completed the game!</h1></div>`;

async function loadLevels() {
  let allLevelsRaw = await fetch("maps.json");
  let allLevels = await allLevelsRaw.json();
  if (allLevels.levels[currentlevel - 1] !== undefined) {
    gameMap = allLevels.levels[currentlevel - 1].map;
  } else {
    gameMap = undefined;
  }
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
    this.coolDownDuration = 300;
    this.currentTime;
  }
  hitBlock() {
    this.currentTime = Date.now();
    if (this.currentTime - this.lastHitTime >= this.coolDownDuration) {
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
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
  if (gameMap !== undefined) {
    loadPlayer();
    loadMap();
  } else {
    gameDisplay.innerHTML = completeScreen;
  }
}
loadGame();

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

function resetGame() {
  score = 0;
  scoreDisplay.innerText = `Score: ${score}`;
  lives = 3;
  livesDisplay.innerText = `Lives: ${lives}`;
  gameDisplay.innerHTML = "";
  gameOver();
  loadGame();
}

function gameOver() {
  if (lives <= 0) {
    gameDisplay.innerHTML = gameOverScreen;
    lives = null;
    livesDisplay.innerText = `Lives: ${lives}`;
    ballX = gameDisplayWidth / 2 - 10;
    ballY = gameDisplayHeight - (1 * 55 + 21);
    ballVelocityX = 0;
    ballVelocityY = 0;
    userBlockX = 6 * 55;
    clearInterval(moveBallConstant);
    clearInterval(checkBallConstant);
    moveBallConstant = undefined;
    checkBallConstant = undefined;
    document.removeEventListener("keydown", movePlayer);
  } else {
    livesDisplay.innerText = `Lives: ${lives}`;
    ballX = gameDisplayWidth / 2 - 10;
    ballY = gameDisplayHeight - (1 * 55 + 21);
    ballVelocityX = 0;
    ballVelocityY = 0;
    userBlockX = 6 * 55;
    clearInterval(moveBallConstant);
    clearInterval(checkBallConstant);
    moveBallConstant = undefined;
    checkBallConstant = undefined;
    document.removeEventListener("keydown", movePlayer);
    loadPlayer();
  }
}

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
    lives--;
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
      score += 10;
      scoreDisplay.innerText = `Score: ${score}`;
      currentBlock.element.innerText = "";
      currentBlock.element.setAttribute("class", "empty");
      currentBlock.element.removeAttribute("id");
      currentBlock.element.style.backgroundColor = "white";
      blockList.splice(i, 1);
      if (blockList.length === 0) {
        winGame();
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
    moveBallConstant = setInterval(moveBall, 6);
    ballVelocityY = -1;
    randomizer = Math.random();
    if (randomizer < 0.5) {
      ballVelocityX = 1;
    } else {
      ballVelocityX = -1;
    }
  }
  if (checkBallConstant === undefined) {
    checkBallConstant = setInterval(checkCollision, 2);
  }
}

function winGame() {
  currentlevel++;
  gameDisplay.innerHTML = winScreen;
  livesDisplay.innerText = `Lives: ${lives}`;
  ballX = gameDisplayWidth / 2 - 10;
  ballY = gameDisplayHeight - (1 * 55 + 21);
  ballVelocityX = 0;
  ballVelocityY = 0;
  userBlockX = 6 * 55;
  clearInterval(moveBallConstant);
  clearInterval(checkBallConstant);
  moveBallConstant = undefined;
  checkBallConstant = undefined;
  document.removeEventListener("keydown", movePlayer);
}

function loadNextLevel() {
  gameDisplay.innerHTML = "";
  loadGame();
}
