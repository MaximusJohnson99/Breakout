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

const mainSoundTrack = new Audio("./Sounds/game-8-bit-on-278083.mp3");
mainSoundTrack.loop = true;
let allSounds = [
  wallBounceSound,
  userBlockBounceSound,
  hitSound,
  gameOverSound,
  buttonClickSound,
  mainSoundTrack,
];

let startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGame);
let resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", resetGame);
let soundButton = document.getElementById("sound-button");
soundButton.addEventListener("click", mute);
let musicButton = document.getElementById("music-button");
musicButton.addEventListener("click", playBackgroundMusic);
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
let ballX;
let ballY;
let ballMidPoint = [];
let ballMidX;
let ballMidY;
let userBlockX;
const userBlockY = 9 * 55;
let randomizer;
let ballVelocityX;
let ballVelocityY;
let userVelocity;
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
const pauseScreen = document.createElement("div");
pauseScreen.setAttribute("id", "pause-screen");
pauseScreen.innerHTML = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
    <path d="M206 1920h548.571V0H206v1920ZM1714.571 0v1920H1166V0h548.571ZM617.43 137.143v1645.714H343.143V137.143h274.286Zm685.714 1645.714h274.286V137.143h-274.286v1645.714Z" fill-rule="evenodd"/>
</svg>`;
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
    this.sound = new Audio(hitSound.src);
  }
  hitBlock() {
    this.sound.volume = hitSound.volume;
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
        ballVelocityX = -3;
      } else if (ballMidX >= this.bottomRight[0]) {
        ballVelocityX = 3;
      } else if (ballMidY <= this.topLeft[1]) {
        ballVelocityY = -3;
      } else if (ballMidY >= this.bottomRight[1]) {
        ballVelocityY = 3;
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
  ballX = gameDisplayWidth / 2 - 10;
  ballY = gameDisplayHeight - (1 * 55 + 22);
  userBlockX = 6 * 55;
  randomizer = Math.random();
  if (randomizer < 0.5) {
    ballVelocityX = 3;
  } else {
    ballVelocityX = -3;
  }
  ballVelocityY = -3;
  userVelocity = 20;
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
    gameDisplay.innerHTML = "";
    loadPlayer();
    loadMap();
    resetStartButton();
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
  resetStartButton();
  playSound(buttonClickSound);
  score = 0;
  scoreDisplay.innerText = `Score: ${score}`;
  lives = 3;
  livesDisplay.innerText = `Lives: ${displayLives()}`;
  gameDisplay.innerHTML = "";
  gameOver();
  loadGame();
}

function resetStartButton() {
  startButton.innerText = "Start";
  startButton.removeEventListener("click", pauseGame);
  startButton.removeEventListener("click", resetGame);
  startButton.addEventListener("click", startGame);
}
function gameOver() {
  if (lives <= 0) {
    gameOverScreen = `<div class="game-screen"><h1>Game Over!</h1><h2>Score: ${score}</h2><button onclick="resetGame()">Retry</button></div>`;
    gameDisplay.innerHTML = gameOverScreen;
    playButtons.forEach((playButton) => {
      playButton.style.display = "none";
    });
    lives = 0;
    livesDisplay.innerText = `Lives: ${displayLives()}`;
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
  resetStartButton();
}

function checkCollision() {
  ballMidPoint = [ballX + 10, ballY + 10];
  ballMidX = ballMidPoint[0];
  ballMidY = ballMidPoint[1];
  // check for collisions with walls
  // check for collision from top
  if (ballY <= 0) {
    playSound(wallBounceSound);
    ballVelocityY = 3;
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
    ballVelocityX = 3;
  }
  // check for collision from right
  if (ballX + 21 >= gameDisplayWidth) {
    playSound(wallBounceSound);
    ballVelocityX = -3;
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
      ballVelocityX = -3;
    } else if (ballMidX >= userBlockX + 165) {
      playSound(userBlockBounceSound);
      ballVelocityX = 3;
    } else if (ballMidY <= userBlockY) {
      playSound(userBlockBounceSound);
      ballVelocityY = -3;
    } else if (ballMidY >= userBlockY + 10) {
      playSound(userBlockBounceSound);
      ballVelocityY = 3;
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
  startButton.innerText = "Pause";
  startButton.removeEventListener("click", startGame);
  startButton.addEventListener("click", pauseGame);
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
    ballVelocityY = -3;
    randomizer = Math.random();
    if (randomizer < 0.5) {
      ballVelocityX = 3;
    } else {
      ballVelocityX = -3;
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
    userVelocity = 20;
  }
}

function winGame() {
  resetStartButton();
  gameDisplay.innerHTML = winScreen;
  playButtons.forEach((playButton) => {
    playButton.style.display = "none";
  });
  livesDisplay.innerText = `Lives: ${displayLives()}`;
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
  currentlevel++;
  score = 0;
  scoreDisplay.innerText = `Score: ${score}`;
  lives = 3;
  livesDisplay.innerText = `Lives: ${displayLives()}`;
  gameDisplay.innerHTML = "";
  loadGame();
}

function pauseGame() {
  playSound(buttonClickSound);
  startButton.innerText = "Resume";
  startButton.removeEventListener("click", pauseGame);
  startButton.addEventListener("click", resumeGame);
  gameDisplay.appendChild(pauseScreen);
  clearInterval(moveBallConstant);
  clearInterval(checkBallConstant);
  moveBallConstant = undefined;
  checkBallConstant = undefined;
  playButtons.forEach((playButton) => {
    playButton.style.display = "none";
  });
  document.removeEventListener("keydown", movePlayer);
  document.removeEventListener("keyup", stopMovePlayer);
  stopMoveLeft();
  stopMoveRight();
}

function resumeGame() {
  playSound(buttonClickSound);
  startButton.innerText = "Pause";
  startButton.removeEventListener("click", resumeGame);
  startButton.addEventListener("click", pauseGame);
  if (moveBallConstant === undefined) {
    if (blockList.length <= halfPoint) {
      moveBallConstant = setInterval(moveBall, 6);
    } else {
      moveBallConstant = setInterval(moveBall, 9);
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
    userVelocity = 20;
  }
  gameDisplay.removeChild(pauseScreen);
  playButtons.forEach((playButton) => {
    playButton.style.display = "block";
  });
  document.addEventListener("keydown", movePlayer);
  document.addEventListener("keyup", stopMovePlayer);
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function playBackgroundMusic() {
  playSound(buttonClickSound);
  mainSoundTrack.play();
  let musicSvg = document.getElementById("music-svg");
  let cancelSvg = musicButton.getElementsByTagName("svg")[0];
  musicSvg.style.width = "40px";
  musicSvg.style.height = "40px";
  cancelSvg.style.display = "none";
  musicButton.removeEventListener("click", playBackgroundMusic);
  musicButton.addEventListener("click", stopBackgroundMusic);
}

function stopBackgroundMusic() {
  playSound(buttonClickSound);
  mainSoundTrack.pause();
  let cancelSvg = musicButton.getElementsByTagName("svg")[0];
  let musicSvg = document.getElementById("music-svg");
  musicSvg.style.width = "30px";
  musicSvg.style.height = "30px";
  cancelSvg.style.display = "block";
  musicButton.removeEventListener("click", stopBackgroundMusic);
  musicButton.addEventListener("click", playBackgroundMusic);
}

function mute() {
  let cancelSvg = soundButton.getElementsByTagName("svg")[0];
  let soundSvg = document.getElementById("sound-svg");
  soundSvg.style.width = "30px";
  soundSvg.style.height = "30px";
  cancelSvg.style.display = "block";
  soundButton.removeEventListener("click", mute);
  soundButton.addEventListener("click", unmute);
  allSounds.forEach((sound) => {
    sound.volume = 0;
  });
}

function unmute() {
  playSound(buttonClickSound);
  let cancelSvg = soundButton.getElementsByTagName("svg")[0];
  let soundSvg = document.getElementById("sound-svg");
  soundSvg.style.width = "40px";
  soundSvg.style.height = "40px";
  cancelSvg.style.display = "none";
  soundButton.removeEventListener("click", unmute);
  soundButton.addEventListener("click", mute);
  allSounds.forEach((sound) => {
    sound.volume = 1.0;
  });
}

