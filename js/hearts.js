const scoreThreshold = 10;
let score = 0;
let heartsInterval;

const gameContainer = document.getElementById("gameContainer");
const scoreDisplay = document.getElementById("score");

// Function to start the hearts game
function startHearts() {
  // Define emojis to be used in the heart function
  const emojis = ["❤️", "💥", "✨", "🎉", "💖", "🌟", "🌈", "💌", "💘"];
  
  // Sound for emoji click
  const emojiClickSound = new Audio('emoji-click-sound.mp3');  // Replace with your actual sound file

  heartsInterval = setInterval(() => {
    // Randomly select an emoji
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const emojiElement = document.createElement("div");
    emojiElement.classList.add("emoji");
    emojiElement.textContent = emoji;
    
    // Randomize the position and size of the emoji
    emojiElement.style.left = Math.random() * 100 + "vw";
    emojiElement.style.top = "-10vh";
    emojiElement.style.fontSize = Math.random() * 1.5 + 1.5 + "rem";

    // Add event listener for clicking the emoji
    emojiElement.addEventListener("click", () => {
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      emojiClickSound.play();  // Play the sound when clicked
      emojiElement.remove();
      
      if (score >= scoreThreshold) {
        triggerScratchCard();
      }
    });

    // Add event listener for when the animation ends (to remove the emoji)
    emojiElement.addEventListener("animationend", () => emojiElement.remove());

    // Add the emoji to the game container
    gameContainer.appendChild(emojiElement);
  }, 800);
}


// Start the scratch card game
function triggerScratchCard() {
  scoreDisplay.textContent = "";
  setupScratchOverlay();
  startPuzzle();
}

startHearts();
