// puzzle.js

// Get the puzzle container
const puzzleContainer = document.getElementById('puzzleContainer');

// Define ideal positions for the images (you can adjust these values)
const idealPositions = {
  kcat: { x: window.innerWidth / 2 - 0, y: window.innerHeight / 2 - 100 },
  mcat: { x: window.innerWidth / 2 + 0, y: window.innerHeight / 2 - 100 },
};

// Variable to track the number of correctly placed pieces
let placedPieces = 0;

// Function to start the puzzle
function startPuzzle() {
  // Ensure the puzzle container is visible
  puzzleContainer.style.display = 'block';

  // Clear any existing content in the puzzle container
  puzzleContainer.innerHTML = '';

  // Create and set up the puzzle pieces
  const kcat = createPuzzlePiece('./img/kcat.png', 'kcat');
  const mcat = createPuzzlePiece('./img/mcat.png', 'mcat');

  // Append the puzzle pieces to the container
  puzzleContainer.appendChild(kcat);
  puzzleContainer.appendChild(mcat);

  // Randomly position the pieces on the screen
  randomizePositions([kcat, mcat]);

  // Make the pieces draggable
  makeDraggable(kcat);
  makeDraggable(mcat);
}

// Create a puzzle piece element
function createPuzzlePiece(src, id) {
  const img = document.createElement('img');
  img.src = src;
  img.id = id;
  img.classList.add('puzzleImage'); // Assuming this class exists in your CSS
  img.style.position = 'absolute';
  img.style.cursor = 'grab';
  img.dataset.placed = 'false'; // Custom attribute to track placement
  return img;
}

// Randomly position the puzzle pieces within the viewport
function randomizePositions(pieces) {
  pieces.forEach((piece) => {
    const maxX = window.innerWidth - 200; // Assuming image width is less than 200px
    const maxY = window.innerHeight - 200; // Assuming image height is less than 200px
    piece.style.left = Math.random() * maxX + 'px';
    piece.style.top = Math.random() * maxY + 'px';
  });
}

// Make an element draggable
function makeDraggable(element) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  // Mouse events
  element.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - parseInt(element.style.left);
    offsetY = e.clientY - parseInt(element.style.top);
    element.style.cursor = 'grabbing';
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
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - parseInt(element.style.left);
    offsetY = touch.clientY - parseInt(element.style.top);
    element.style.cursor = 'grabbing';
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

// Check if the piece is near its ideal position and snap into place
function checkPlacement(piece) {
  const pieceId = piece.id;
  const idealPos = idealPositions[pieceId];
  const currentPos = {
    x: parseInt(piece.style.left),
    y: parseInt(piece.style.top),
  };

  const distance = Math.hypot(currentPos.x - idealPos.x, currentPos.y - idealPos.y);
  const snapThreshold = 200; // You can adjust this threshold

  if (distance < snapThreshold) {
    // Snap the piece to its ideal position
    piece.style.left = idealPos.x + 'px';
    piece.style.top = idealPos.y + 'px';
    piece.dataset.placed = 'true';

    // Increase the placed pieces count if not already counted
    if (!piece.dataset.counted) {
      placedPieces++;
      piece.dataset.counted = 'true';
    }

    // Check if all pieces are placed
    if (placedPieces === 2) {
      setTimeout(() => {
        alert('Congratulations!');
      }, 100);
    }
  }
}

// Start the puzzle
startPuzzle();
