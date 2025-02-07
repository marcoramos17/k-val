const scoreThreshold = 10; // Number of hearts needed
let score = 0;

// DOM elements
const gameContainer = document.getElementById("gameContainer");
const scoreDisplay = document.getElementById("score");
const scratchCardContainer = document.getElementById("scratchCardContainer");
const hiddenMessage = document.getElementById("hiddenMessage");

// Scratch card setup
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
scratchCardContainer.appendChild(canvas);
const ctx = canvas.getContext("2d");

// Create the scratch effect
function setupScratchCard() {
  // Fill the canvas with a solid color
  ctx.fillStyle = "#CCCCCC";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add text on top of the scratch card
  ctx.font = "bold 3rem Arial";
  ctx.fillStyle = "#AAAAAA";
  ctx.textAlign = "center";
  ctx.fillText("Scratch here to reveal!", canvas.width / 2, canvas.height / 2);

  // Listen for scratch events
  let isScratching = false;
  canvas.addEventListener("mousedown", () => (isScratching = true));
  canvas.addEventListener("mouseup", () => (isScratching = false));
  canvas.addEventListener("mousemove", (e) => {
    if (isScratching) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.clearRect(x - 20, y - 20, 40, 40); // Scratch effect size
    }
  });

  // Check if the scratch area is sufficiently cleared
  canvas.addEventListener("mousemove", () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clearedPixels = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) clearedPixels++; // Check transparency
    }
    const clearedPercentage = (clearedPixels / (canvas.width * canvas.height)) * 100;
    if (clearedPercentage > 50) {
      canvas.remove(); // Remove scratch card
      hiddenMessage.style.display = "block"; // Show the message
    }
  });
}

// Trigger the scratch card
function triggerScratchCard() {
  gameContainer.style.display = "none";
  scratchCardContainer.style.display = "flex";
  setupScratchCard();
}

// Start the heart animation
function startHearts() {
  setInterval(() => {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "❤️";

    // Randomize the heart's horizontal position
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.top = "-10vh"; // Start slightly above the viewport
    heart.style.fontSize = Math.random() * 1.5 + 1.5 + "rem";

    // Add a click event to increment score and remove the heart
    heart.addEventListener("click", () => {
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      heart.remove();

      if (score >= scoreThreshold) {
        triggerScratchCard();
      }
    });

    // Remove the heart after its animation ends
    heart.addEventListener("animationend", () => heart.remove());

    gameContainer.appendChild(heart);
  }, 800); // Adjust timing for heart creation
}

// Start the hearts animation
startHearts();
