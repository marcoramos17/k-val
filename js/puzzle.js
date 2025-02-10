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
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight - 300);
  ctx.lineTo(window.innerWidth, window.innerHeight - 300);
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.lineTo(0, window.innerHeight);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();  // Add contour to the grass

  // Draw Trees
  drawTree(ctx, window.innerWidth / 4, window.innerHeight - 250); // Left tree
  drawTree(ctx, window.innerWidth * 3 / 4, window.innerHeight - 250); // Right tree
  
  // Draw Bench (a bit higher)
  drawBench(ctx, window.innerWidth / 2 - 100, window.innerHeight - 290); // Centered bench
  
  puzzleContainer.appendChild(sceneryCanvas); // Add scenery to puzzle container
}

function drawTree(ctx, x, y) {
  // Tree trunk (rounded)
  ctx.fillStyle = '#8b4513';  // Brown color for trunk
  ctx.strokeStyle = '#5d2f1b'; // Cartoonish contour color for trunk
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 60);
  ctx.lineTo(x + 15, y - 60);
  ctx.lineTo(x + 15, y);
  ctx.lineTo(x - 15, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tree foliage (rounded circle with a contour)
  ctx.beginPath();
  ctx.arc(x, y - 90, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#228b22';  // Green color for foliage
  ctx.strokeStyle = '#1e5d1a'; // Darker green contour
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();
}

function drawBench(ctx, x, y) {
  // Bench legs (rectangles)
  ctx.fillStyle = '#8b4513';  // Brown color for legs
  ctx.strokeStyle = '#6a3f2a'; // Cartoonish contour color for legs
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.rect(x + 30, y - 20, 20, 80);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.rect(x + 170, y - 20, 20, 80);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bench seat (rounded edges)
  ctx.fillStyle = '#deb887';  // Light brown color for the bench
  ctx.strokeStyle = '#b08d57'; // Cartoonish contour color
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 220, y);
  ctx.lineTo(x + 220, y + 20);
  ctx.lineTo(x, y + 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bench backrest
  ctx.beginPath();
  ctx.moveTo(x, y - 80);
  ctx.lineTo(x + 220, y - 80);
  ctx.lineTo(x + 220, y - 20);
  ctx.lineTo(x, y - 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bench backrest details
  ctx.beginPath();
  ctx.moveTo(x, y - 40);
  ctx.lineTo(x + 220, y - 40);
  ctx.moveTo(x, y - 60);
  ctx.lineTo(x + 220, y - 60);
  ctx.stroke();
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

const idealPositions = {
  kcat: { x: window.innerWidth / 2 - 70, y: window.innerHeight / 2 - 113 },
  mcat: { x: window.innerWidth / 2 + 3, y: window.innerHeight / 2 - 100 },
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
