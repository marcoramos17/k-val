// puzzle.js

const puzzleContainer = document.getElementById('puzzleContainer');
const canvases = {}; // To store the off-screen canvases
let placedPieces = 0;

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

const idealPositions = {
  kcat: { x: window.innerWidth / 2 - 43, y: window.innerHeight / 2 - 113 },
  mcat: { x: window.innerWidth / 2 + 30, y: window.innerHeight / 2 - 100 },
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

    if (placedPieces === 2) {
      setTimeout(() => {
        alert('Congratulations!');
      }, 100);
    }
  }
}

