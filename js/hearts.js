const scoreThreshold = 10;
let score = 0;
let heartsInterval;

const gameContainer = document.getElementById("gameContainer");
const scoreDisplay = document.getElementById("score");

// Function to start the hearts game
function startHearts() {
  heartsInterval = setInterval(() => {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.top = "-10vh";
    heart.style.fontSize = Math.random() * 1.5 + 1.5 + "rem";

    heart.addEventListener("click", () => {
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      heart.remove();
      if (score >= scoreThreshold) {
        triggerScratchCard();
      }
    });

    heart.addEventListener("animationend", () => heart.remove());
    gameContainer.appendChild(heart);
  }, 800);
}

// Stop hearts and transition to the scratch card
function triggerScratchCard() {
  scoreDisplay.textContent = "";
  //clearInterval(heartsInterval);
  //gameContainer.style.display = "none";
  //document.getElementById("scratchCardContainer").style.display = "flex";
  // At the appropriate point in your script, perhaps after a certain event
  setupScratchOverlay();
  startPuzzle();
}

startHearts();
