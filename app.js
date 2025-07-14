const wallBounceSound = new Audio("./Sounds/mixkit-game-ball-tap-2073.wav");
const userBlockBounceSound = new Audio(
  "./Sounds/mixkit-game-ball-tap-2073.wav"
);
const hitSound = new Audio(
  "./Sounds/mixkit-player-jumping-in-a-video-game-2043.wav"
);
const gameOverSound = new Audio(
  "./Sounds/mixkit-sci-fi-positive-notification-266.wav"
);
const buttonClickSound = new Audio(
  "./Sounds/mixkit-video-game-retro-click-237.wav"
);

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

let lives = 3;
let livesEmoji = "";
let score = 0;
let totalBlocks;
let blocksDisplay = document.createElement("h2");
blocksDisplay.setAttribute("id", "blocksNum");
let scoreDisplay = document.getElementById("score");
let currentlevel = 0;
let livesDisplay = document.getElementById("lives");
function displayLives() {
  livesEmoji = "";
  if (lives > 0) {
    for (let i = 0; i < lives; i++) {
      livesEmoji += "♥";
    }
  } else {
    livesEmoji = "--";
  }
  return livesEmoji;
}
livesDisplay.innerText = `Lives: ${displayLives()}`;
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
  ballVelocityX = 2;
} else {
  ballVelocityX = -2;
}
let ballVelocityY = -2;
let userVelocity = 15;
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
let blockList = [];
let gameOverScreen;
const winScreen = `<div class="game-screen"><h1>YOU WIN!</h1><button onclick="loadNextLevel()">Next Level</button></div>`;
const completeScreen = `<div class="game-screen"><h1>Congratulations! You have completed the game!</h1></div>`;
const homeScreen = `<div class="game-screen"><h1>Breakout Blast!</h1><h2>By MaximusJohnson99</h2><button onclick="loadNextLevel()">Play</button></div>`;
gameDisplay.innerHTML = homeScreen;
let playButtons = document.querySelectorAll(".play-buttons");
let playButtonLeft = playButtons[0];
let playButtonRight = playButtons[1];
playButtonLeft.addEventListener("mousedown", movePlayerLeft);
playButtonLeft.addEventListener("touchstart", movePlayerLeft);
playButtonLeft.addEventListener("mouseup", stopMoveLeft);
playButtonLeft.addEventListener("touchend", stopMoveLeft);
playButtonRight.addEventListener("mousedown", movePlayerRight);
playButtonRight.addEventListener("touchstart", movePlayerRight);
playButtonRight.addEventListener("mouseup", stopMoveRight);
playButtonRight.addEventListener("touchend", stopMoveRight);
let moveLeft;
let moveRight;
let halfPoint;
let controls = document.getElementById("controls");

async function loadLevels() {
  let allLevelsRaw = await fetch("maps.json");
  let allLevels = await allLevelsRaw.json();
  if (allLevels.levels[currentlevel] !== undefined) {
    gameMap = allLevels.levels[currentlevel].map;
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
    this.coolDownDuration = 900;
    this.currentTime;
    this.sound = new Audio(
      "./Sounds/mixkit-player-jumping-in-a-video-game-2043.wav"
    );
  }
  hitBlock() {
    playSound(this.sound);
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
        ballVelocityX = -2;
      } else if (ballMidX >= this.bottomRight[0]) {
        ballVelocityX = 2;
      } else if (ballMidY <= this.topLeft[1]) {
        ballVelocityY = -2;
      } else if (ballMidY >= this.bottomRight[1]) {
        ballVelocityY = 2;
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
  blockList = [];
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
  totalBlocks = blockList.length;
  halfPoint = Math.floor(blockList.length / 2);
  blocksDisplay.innerText = `Blocks: ${blockList.length}/${totalBlocks}`;
  gameDisplay.appendChild(blocksDisplay);
}

function loadPlayer() {
  ball.style.left = ballX + "px";
  ball.style.top = ballY + "px";
  userBlock.style.left = userBlockX + "px";
  userBlock.style.top = userBlockY + "px";
  userVelocity = 15;
  gameDisplay.appendChild(ball);
  gameDisplay.appendChild(userBlock);
}

async function loadGame() {
  await loadLevels();
  if (gameMap !== undefined) {
    gameDisplay.innerHTML = "";
    loadPlayer();
    loadMap();
    controls.style.display = "flex";
  } else {
    gameDisplay.innerHTML = completeScreen;
    playButtons.forEach((playButton) => {
      playButton.style.display = "none";
    });
  }
}

function movePlayer(e) {
  switch (e.key) {
    case "ArrowLeft":
      movePlayerLeft();
      break;
    case "ArrowRight":
      movePlayerRight();
      break;
    default:
      break;
  }
}

function stopMovePlayer(e) {
  switch (e.key) {
    case "ArrowLeft":
      stopMoveLeft();
      break;
    case "ArrowRight":
      stopMoveRight();
      break;
    default:
      break;
  }
}

function movePlayerLeft() {
  if (moveLeft === undefined) {
    moveLeft = setInterval(() => {
      if (userBlockX >= userVelocity) {
        userBlockX -= userVelocity;
        userBlock.style.left = userBlockX + "px";
      }
    }, 35);
  }
}

function movePlayerRight() {
  if (moveRight === undefined) {
    moveRight = setInterval(() => {
      if (userBlockX <= 12 * 55 - userVelocity) {
        userBlockX += userVelocity;
        userBlock.style.left = userBlockX + "px";
      }
    }, 35);
  }
}

function stopMoveLeft() {
  if (moveLeft !== undefined) {
    clearInterval(moveLeft);
    moveLeft = undefined;
  }
}

function stopMoveRight() {
  if (moveRight !== undefined) {
    clearInterval(moveRight);
    moveRight = undefined;
  }
}

function resetGame() {
  playSound(buttonClickSound);
  score = 0;
  scoreDisplay.innerText = `Score: ${score}`;
  lives = 3;
  livesDisplay.innerText = `Lives: ${displayLives()}`;
  gameDisplay.innerHTML = "";
  gameOver();
  loadGame();
}

function gameOver() {
  if (lives <= 0) {
    gameOverScreen = `<div class="game-screen"><h1>Game Over!</h1><h2>Score: ${score}</h2><button onclick='resetGame()'>Retry</button></div>`;
    gameDisplay.innerHTML = gameOverScreen;
    playButtons.forEach((playButton) => {
      playButton.style.display = "none";
    });
    lives = 0;
    livesDisplay.innerText = `Lives: ${displayLives()}`;
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
    document.removeEventListener("keyup", stopMovePlayer);
    stopMoveLeft();
    stopMoveRight();
  } else {
    livesDisplay.innerText = `Lives: ${displayLives()}`;
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
    document.removeEventListener("keyup", stopMovePlayer);
    stopMoveLeft();
    stopMoveRight();
    loadPlayer();
  }
  playButtons.forEach((playButton) => {
    playButton.style.display = "none";
  });
}

function checkCollision() {
  ballMidPoint = [ballX + 10, ballY + 10];
  ballMidX = ballMidPoint[0];
  ballMidY = ballMidPoint[1];
  // check for collisions with walls
  // check for collision from top
  if (ballY <= 0) {
    playSound(wallBounceSound);
    ballVelocityY = 2;
  }
  // check for collision from bottom, if yes then game over
  if (ballY + 21 >= gameDisplayHeight) {
    playSound(gameOverSound);
    lives--;
    gameOver();
  }
  // check for collision from left
  if (ballX <= 0) {
    playSound(wallBounceSound);
    ballVelocityX = 2;
  }
  // check for collision from right
  if (ballX + 21 >= gameDisplayWidth) {
    playSound(wallBounceSound);
    ballVelocityX = -2;
  }

  // check for collision with userblock
  if (
    ballY + 21 >= userBlockY &&
    ballX + 21 >= userBlockX &&
    ballY < userBlockY + 10 &&
    ballX < userBlockX + 165
  ) {
    if (ballMidX <= userBlockX) {
      playSound(userBlockBounceSound);
      ballVelocityX = -2;
    } else if (ballMidX >= userBlockX + 165) {
      playSound(userBlockBounceSound);
      ballVelocityX = 2;
    } else if (ballMidY <= userBlockY) {
      playSound(userBlockBounceSound);
      ballVelocityY = -2;
    } else if (ballMidY >= userBlockY + 10) {
      playSound(userBlockBounceSound);
      ballVelocityY = 2;
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
      blocksDisplay.innerText = `Blocks: ${blockList.length}/${totalBlocks}`;
      if (blockList.length <= halfPoint) {
        clearInterval(moveBallConstant);
        clearInterval(checkBallConstant);
        moveBallConstant = setInterval(moveBall, 6);
        checkBallConstant = setInterval(checkCollision, 2);
        userVelocity = 25;
      }
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
  playSound(buttonClickSound);
  document.addEventListener("keydown", movePlayer);
  document.addEventListener("keyup", stopMovePlayer);
  playButtons.forEach((playButton) => {
    playButton.style.display = "block";
  });
  if (moveBallConstant === undefined) {
    if (blockList.length <= halfPoint) {
      moveBallConstant = setInterval(moveBall, 6);
    } else {
      moveBallConstant = setInterval(moveBall, 9);
    }
    ballVelocityY = -2;
    randomizer = Math.random();
    if (randomizer < 0.5) {
      ballVelocityX = 2;
    } else {
      ballVelocityX = -2;
    }
  }
  if (checkBallConstant === undefined) {
    if (blockList.length <= halfPoint) {
      checkBallConstant = setInterval(checkCollision, 2);
    }
    checkBallConstant = setInterval(checkCollision, 3);
  }
  if (blockList.length <= halfPoint) {
    userVelocity = 25;
  } else {
    userVelocity = 15;
  }
}

function winGame() {
  gameDisplay.innerHTML = winScreen;
  playButtons.forEach((playButton) => {
    playButton.style.display = "none";
  });
  livesDisplay.innerText = `Lives: ${displayLives()}`;
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
  document.removeEventListener("keyup", stopMovePlayer);
  stopMoveLeft();
  stopMoveRight();
}

function loadNextLevel() {
  playSound(buttonClickSound);
  // currentlevel++;
  score = 0;
  scoreDisplay.innerText = `Score: ${score}`;
  lives = 3;
  livesDisplay.innerText = `Lives: ${displayLives()}`;
  gameDisplay.innerHTML = "";
  loadGame();
}
