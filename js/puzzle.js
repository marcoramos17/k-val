// puzzle.js

const puzzleContainer = document.getElementById('puzzleContainer');
const canvases = {}; // To store the off-screen canvases
let placedPieces = 0;

// Add a check to prevent removing the scenery
function startPuzzle() {
  puzzleContainer.style.display = 'block';
  puzzleContainer.innerHTML = '';

  const kcat = createPuzzlePiece('./img/kcat.png', 'kcat');
  const mcat = createPuzzlePiece('./img/mcat.png', 'mcat');

  let imagesLoaded = 0;

  [kcat, mcat].forEach((piece) => {
    piece.onload = () => {
      createCanvasForImage(piece, piece.id);
      imagesLoaded++;
      if (imagesLoaded === 2) {
        randomizePositions([kcat, mcat]);
        makeDraggable(kcat);
        makeDraggable(mcat);
      }
    };
  });

  puzzleContainer.appendChild(kcat);
  puzzleContainer.appendChild(mcat);

  // Keep the background scenery (grass, trees, bench) visible even after the puzzle is complete
  drawScenery();
}



function drawScenery() {
  const sceneryCanvas = document.createElement('canvas');
  sceneryCanvas.width = window.innerWidth;
  sceneryCanvas.height = window.innerHeight;
  const ctx = sceneryCanvas.getContext('2d');
  
  // Draw Grass (a bit higher)
  ctx.fillStyle = '#6dbd45';  // Grass color
  ctx.strokeStyle = '#4c9c2e'; // Cartoonish contour color
  ctx.lineWidth = window.innerWidth * 0.005;
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight * 0.7);
  ctx.lineTo(window.innerWidth, window.innerHeight * 0.7);
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.lineTo(0, window.innerHeight);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();  // Add contour to the grass

  // Draw Trees
  drawTree(ctx, window.innerWidth * 0.25, window.innerHeight * 0.75, ((window.innerHeight * window.innerWidth)/200000) * 0.9); // Left tree
  drawTree(ctx, window.innerWidth * 0.75, window.innerHeight * 0.75, ((window.innerHeight * window.innerWidth)/200000) * 0.9); // Right tree

  // Draw Bench (a bit higher)
  drawBench(ctx, window.innerWidth * 0.5, window.innerHeight * 0.71, ((window.innerHeight * window.innerWidth)/200000) * 0.5); // Centered bench

  puzzleContainer.appendChild(sceneryCanvas); // Add scenery to puzzle container
}

function drawBench(ctx, centerX, y, scale) {
  scale = scale || 1;

  // Use the smaller of width or height to maintain proportions
  const baseSize = Math.min(window.innerWidth, window.innerHeight);
  
  const benchWidth = baseSize * 0.2 * scale;
  const benchHeight = baseSize * 0.02 * scale;
  const legWidth = baseSize * 0.01 * scale;
  const legHeight = baseSize * 0.18 * scale;
  const backrestHeight = baseSize * 0.08 * scale;
  const plankHeight = backrestHeight / 3;
  const backrestOffset = baseSize * 0.015 * scale;
  const legOffset = baseSize * 0.12 * scale;
  const x = centerX - benchWidth / 2;
  
  ctx.lineWidth = baseSize * 0.005 * scale;
  
  // Bench legs
  ctx.fillStyle = '#8b4513';
  ctx.strokeStyle = '#5d2f1b';
  ctx.fillRect(x + benchWidth * 0.05, y + benchHeight - legOffset, legWidth, legHeight);
  ctx.strokeRect(x + benchWidth * 0.05, y + benchHeight - legOffset, legWidth, legHeight);
  ctx.fillRect(x + benchWidth * 0.9, y + benchHeight - legOffset, legWidth, legHeight);
  ctx.strokeRect(x + benchWidth * 0.9, y + benchHeight - legOffset, legWidth, legHeight);
  
  // Bench seat
  ctx.fillStyle = '#d2b48c';
  ctx.strokeStyle = '#a0522d';
  ctx.fillRect(x, y, benchWidth, benchHeight);
  ctx.strokeRect(x, y, benchWidth, benchHeight);
  
  // Bench backrest
  for (let i = 0; i < 3; i++) {
    const plankY = y - backrestHeight - backrestOffset + i * plankHeight;
    ctx.fillStyle = '#d2b48c';
    ctx.strokeStyle = '#a0522d';
    ctx.fillRect(x, plankY, benchWidth, plankHeight);
    ctx.strokeRect(x, plankY, benchWidth, plankHeight);
  }
}

function drawTree(ctx, x, y, scale) {
  scale = scale || 1;

  // Use the smaller of width or height to maintain proportions
  const baseSize = Math.min(window.innerWidth, window.innerHeight);

  const trunkWidth = baseSize * 0.015 * scale;
  const trunkHeight = baseSize * 0.06 * scale;
  const foliageSize = baseSize * 0.1 * scale; // Square foliage

  ctx.fillStyle = '#8b4513';
  ctx.strokeStyle = '#5d2f1b';
  ctx.lineWidth = baseSize * 0.005 * scale;
  
  // Tree trunk
  ctx.fillRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight);
  ctx.strokeRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight);

  // Tree foliage (rectangular for easy manipulation)
  ctx.fillStyle = '#228B22';
  ctx.strokeStyle = '#006400';
  ctx.fillRect(x - foliageSize / 2, y - foliageSize, foliageSize, foliageSize);
  ctx.strokeRect(x - foliageSize / 2, y - foliageSize, foliageSize, foliageSize);
}








function createPuzzlePiece(src, id) {
  const img = document.createElement('img');
  img.src = src;
  img.id = id;
  img.classList.add('puzzleImage');
  img.style.position = 'absolute';
  img.style.cursor = 'grab';
  img.dataset.placed = 'false';
  img.setAttribute('draggable', 'false'); // Disable default dragging

  // Set the desired width and height
  img.style.width = '80px'; // Adjust to your desired size
  img.style.height = 'auto'; // Maintain aspect ratio
  return img;
}

function createCanvasForImage(imageElement, id) {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0);

  canvases[id] = canvas;
}

function randomizePositions(pieces) {
  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 200;
  pieces.forEach((piece) => {
    piece.style.left = Math.random() * maxX + 'px';
    piece.style.top = Math.random() * maxY + 'px';
  });
}

function isOpaquePixel(element, x, y) {
  const canvas = canvases[element.id];
  if (!canvas) return false;

  const scaleX = canvas.width / element.offsetWidth;
  const scaleY = canvas.height / element.offsetHeight;

  const adjustedX = x * scaleX;
  const adjustedY = y * scaleY;

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(adjustedX, adjustedY, 1, 1);
  const alpha = imageData.data[3];

  return alpha > 0;
}

function makeDraggable(element) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  element.addEventListener('mousedown', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isOpaquePixel(element, x, y)) {
      isDragging = true;
      offsetX = e.clientX - parseInt(element.style.left);
      offsetY = e.clientY - parseInt(element.style.top);
      element.style.cursor = 'grabbing';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      element.style.left = e.clientX - offsetX + 'px';
      element.style.top = e.clientY - offsetY + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = 'grab';
      checkPlacement(element);
    }
  });

  // Touch events for mobile support
  element.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = element.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (isOpaquePixel(element, x, y)) {
      isDragging = true;
      offsetX = touch.clientX - parseInt(element.style.left);
      offsetY = touch.clientY - parseInt(element.style.top);
      element.style.cursor = 'grabbing';
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      element.style.left = touch.clientX - offsetX + 'px';
      element.style.top = touch.clientY - offsetY + 'px';
    }
  });

  document.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = 'grab';
      checkPlacement(element);
    }
  });
}

const imageDimensions = {
  width: 80,
  height: 'auto' // Maintain aspect ratio
};

const benchX = window.innerWidth / 2 - 100;
const benchY = window.innerHeight - 290;

const idealPositions = {
  kcat: { x: benchX + 30, y: benchY - 113 }, // Adjusted relative to the bench
  mcat: { x: benchX + 103, y: benchY - 100 }, // Adjusted relative to the bench
};

function checkPlacement(piece) {
  const pieceId = piece.id;
  const idealPos = idealPositions[pieceId];
  const currentPos = {
    x: parseInt(piece.style.left),
    y: parseInt(piece.style.top),
  };

  const distance = Math.hypot(currentPos.x - idealPos.x, currentPos.y - idealPos.y);
  const snapThreshold = 200;

  if (distance < snapThreshold) {
    piece.style.left = idealPos.x + 'px';
    piece.style.top = idealPos.y + 'px';
    piece.dataset.placed = 'true';

    if (!piece.dataset.counted) {
      placedPieces++;
      piece.dataset.counted = 'true';
    }

    // Trigger the love letter/envelope only when both pieces are placed
    if (placedPieces === 2) {
      const sound = new Audio('sounds/claps.mp3'); // Replace with your sound file path
      sound.play();
      setTimeout(() => {
        scoreDisplay.textContent = "Rotate and open the envelope!";
        triggerLoveLetter();  // Trigger the love letter animation or action
      }, 3000);
    }
  }
}


function triggerLoveLetter() {
  // Trigger the love letter animation or action here.
  alert('Puzzle Completed! Love Letter Triggered');
}
