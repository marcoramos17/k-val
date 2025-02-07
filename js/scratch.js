// scratch.js

const scratchCardContainer = document.getElementById("scratchCardContainer");
const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");

// Set initial display to none
scratchCardContainer.style.display = "none";

function setupScratchCard() {
    // Initialize the puzzle pieces
    initializePuzzle(); // Call the function from puzzle.js
  
    // Show the scratch card container
    scratchCardContainer.style.display = "flex";
  
    // Resize canvas to cover the viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    // Create the scratchable overlay
    ctx.fillStyle = "#CCCCCC"; // Scratch card color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Add "Scratch to reveal" text
    ctx.font = "bold 3rem Arial";
    ctx.fillStyle = "#AAAAAA";
    ctx.textAlign = "center";
    ctx.fillText("Scratch here to reveal!", canvas.width / 2, canvas.height / 2);
  
    // Initialize scratch events
    setupScratchEvents();
  }
  
  function setupScratchEvents() {
    let isScratching = false;
    let lastMousePosition = null;
  
    // Mouse event listeners
    canvas.addEventListener("mousedown", (e) => {
      isScratching = true;
      lastMousePosition = { x: e.offsetX, y: e.offsetY };
    });
  
    canvas.addEventListener("mouseup", () => {
      isScratching = false;
      lastMousePosition = null;
      checkScratchCompletion();
    });
  
    canvas.addEventListener("mousemove", (e) => {
      if (isScratching) {
        const currentMousePosition = { x: e.offsetX, y: e.offsetY };
        if (lastMousePosition) {
          scratchLine(lastMousePosition, currentMousePosition);
        }
        lastMousePosition = currentMousePosition;
      }
    });
  
    // Touch events for mobile devices
    canvas.addEventListener("touchstart", (e) => {
      isScratching = true;
      const touch = e.touches[0];
      lastMousePosition = { x: touch.clientX - canvas.offsetLeft, y: touch.clientY - canvas.offsetTop };
    });
  
    canvas.addEventListener("touchmove", (e) => {
      if (isScratching) {
        const touch = e.touches[0];
        const currentMousePosition = { x: touch.clientX - canvas.offsetLeft, y: touch.clientY - canvas.offsetTop };
        if (lastMousePosition) {
          scratchLine(lastMousePosition, currentMousePosition);
        }
        lastMousePosition = currentMousePosition;
      }
    });
  
    canvas.addEventListener("touchend", () => {
      isScratching = false;
      lastMousePosition = null;
      checkScratchCompletion();
    });
  }
  
  function scratchLine(start, end) {
    ctx.globalCompositeOperation = "destination-out"; // Erase overlay
    ctx.lineWidth = 40; // Width of the "scratch"
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  function checkScratchCompletion() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const totalPixels = imageData.data.length / 4;
    let revealedPixels = 0;
  
    // Count transparent pixels
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) {
        revealedPixels++;
      }
    }
  
    if (revealedPixels / totalPixels > 0.5) {
      // Remove the scratch card
      scratchCardContainer.style.display = "none";
  
      // Enable interactions with the puzzle
      puzzleContainer.style.pointerEvents = "auto";
    }
  }
  