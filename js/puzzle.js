// Values
const width = window.innerWidth;
const height = window.innerHeight;

const baseSize = Math.min(width, height);

// Bench dimensions
const benchScale = calculateScale(0.5, 0.3);

const benchWidth = baseSize * 0.2 * benchScale; // Adjust the scale as needed
const benchHeight = baseSize * 0.02 * benchScale; // Adjust the scale as needed
const legHeight = baseSize * 0.18 * benchScale;
const legWidth = baseSize * 0.01 * benchScale;
const benchX = width / 2;
const benchY = height * 0.85 - legHeight / 2;

let idealPositions = {};

// Cat's dimensions
const catWidth = benchWidth * 0.4;
let kcatHeight, mcatHeight;

calculateProportionalHeight('img/kcat.png', catWidth, function(height) {
    kcatHeight = height;
    console.log('Kcat Height:', kcatHeight);
    calculateProportionalHeight('img/mcat.png', catWidth, function(height) {
        mcatHeight = height;
        console.log('Mcat Height:', mcatHeight);

        // Ideal positions for the puzzle pieces
        idealPositions = {
            kcat: { x: (width/2) - (catWidth/2) - (catWidth*.45), y: benchY - kcatHeight}, // Adjusted relative to the bench
            mcat: { x: (width/2) - (catWidth/2) + (catWidth*.45), y: benchY - mcatHeight}, // Adjusted relative to the bench
        };

        console.log('Ideal Positions:', idealPositions);
    });
});

// 
const puzzleContainer = document.getElementById('puzzleContainer');
const canvases = {}; // To store the off-screen canvases
let placedPieces = 0;

// Calculate Scale
function calculateScale(proportion, max) {
    return 1 + Math.max(Math.log((width * height) / 200000 + 1) * proportion, max);
}

// Calculate Height
function calculateProportionalHeight(imagePath, desiredWidth, callback) {
    const img = new Image();
    img.src = imagePath;

    img.onload = function() {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Calculate the proportional height
        const proportionalHeight = (desiredWidth / originalWidth) * originalHeight;

        console.log('Proportional Height:', proportionalHeight);
        callback(proportionalHeight);
    };

    img.onerror = function() {
        console.error('Failed to load image:', imagePath);
        callback(undefined);
    };
}

// Draw the shared scenery
function drawSharedScenery(ctx, width, height) {
    // Draw grass
    ctx.fillStyle = '#6dbd45';  // Grass color
    ctx.strokeStyle = '#4c9c2e'; // Cartoonish contour color
    ctx.lineWidth = width * 0.005;
    ctx.fillRect(0, benchY * .9, width, height);
    ctx.strokeRect(0, benchY * .9, width, height);
    
    // Draw path with perspective
    ctx.fillStyle = '#735024';  // Dirt color
    ctx.strokeStyle = '#63441c'; // Cartoonish contour color
    ctx.lineWidth = width * 0.005;
    const pathTopWidth = width * 0.3;
    const pathBottomWidth = width * 0.5;
    const pathHeight = height * 0.5;
    const pathTopY = benchY * 0.9;
    const pathBottomY = pathTopY + pathHeight;

    ctx.beginPath();
    ctx.moveTo((width - pathTopWidth) / 2, pathTopY);
    ctx.lineTo((width + pathTopWidth) / 2, pathTopY);
    ctx.lineTo((width + pathBottomWidth) / 2, pathBottomY);
    ctx.lineTo((width - pathBottomWidth) / 2, pathBottomY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Left trees
    drawTree(ctx, width * 0.14, height * 0.69, calculateScale(.9, .6));
    drawTree(ctx, width * 0.24, height * 0.65, calculateScale(.9, .6));
    drawTree(ctx, width * 0.2, height * 0.75, calculateScale(.9, .6));
    drawTree(ctx, width * 0.06, height * 1.05, calculateScale(.9, .6));
    
    

    // Right trees
    drawTree(ctx, width * 0.89, height * 0.70, calculateScale(.9, .6));
    drawTree(ctx, width * 0.8, height * 0.75, calculateScale(.9, .6));
    drawTree(ctx, width * 0.96, height * 0.95, calculateScale(.9, .6));
    
  
    // Bench
    drawBench(ctx, benchX, benchY); // Centered bench

    // More trees
    //drawTree(ctx, width * 0.7, height * 0.97, calculateScale(.9, .6));
}

function drawBench(ctx, centerX, y) {
    const backrestHeight = baseSize * 0.08 * benchScale;
    const plankHeight = backrestHeight / 3;
    const backrestOffset = baseSize * 0.015 * benchScale;
    const legOffset = baseSize * 0.12 * benchScale;
    const x = centerX - benchWidth / 2;
    
    ctx.lineWidth = baseSize * 0.005 * benchScale;
    
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

function checkPlacement(piece) {
    const pieceId = piece.id;
    const idealPos = idealPositions[pieceId];
    const currentPos = {
      x: parseInt(piece.style.left),
      y: parseInt(piece.style.top),
    };
  
    const distance = Math.hypot(currentPos.x - idealPos.x, currentPos.y - idealPos.y);
    const snapThreshold = 200;
  
    console.log('Ideal Position:', idealPos);

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

// Function to create a puzzle piece
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
    img.style.width = catWidth + 'px'; // Adjust to your desired percentage of the bench width
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
    const maxX = width - 200;
    const maxY = height - 200;
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
        console.log('Element:', element);
        checkPlacement(element);
        console.log('Placed Pieces:', placedPieces);
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




// Function to create the puzzle scenery canvas
function createPuzzleSceneryCanvas() {
    // Create a canvas and append it to the puzzle container
    const sceneryCanvas = document.createElement('canvas');
    sceneryCanvas.width = width;
    sceneryCanvas.height = height;
  
    // If you have a "puzzleContainer" DOM element:
    puzzleContainer.appendChild(sceneryCanvas);
  
    const ctx = sceneryCanvas.getContext('2d');
  
    // Use the shared function to draw the scenery
    drawSharedScenery(ctx, sceneryCanvas.width, sceneryCanvas.height);
}

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
    createPuzzleSceneryCanvas();
  }

