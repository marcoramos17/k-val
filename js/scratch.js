function setupScratchOverlay() {
  // Create the canvas element
  const scratchCanvas = document.createElement('canvas');
  scratchCanvas.id = 'scratchCanvas';

  // Set canvas dimensions to full viewport
  scratchCanvas.width = window.innerWidth;
  scratchCanvas.height = window.innerHeight;

  // Style the canvas to position it absolutely over the hearts game
  scratchCanvas.style.position = 'fixed';
  scratchCanvas.style.top = '0';
  scratchCanvas.style.left = '0';
  scratchCanvas.style.width = '100vw';
  scratchCanvas.style.height = '100vh';
  scratchCanvas.style.zIndex = '10002'; // Ensure it's on top
  scratchCanvas.style.cursor = 'crosshair';

  // Append the canvas to the body
  document.body.appendChild(scratchCanvas);

  // Get the drawing context
  const ctx = scratchCanvas.getContext('2d');

  // Variables for scratching
  let isScratching = false;
  let lastPoint = null;

  // Draw the scratchable overlay with a heart shape
  function drawOverlay() {
      ctx.fillStyle = '#e6325c'; // Pink overlay color
      ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

      // Add text if desired
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#ff9a9e';
      ctx.textAlign = 'center';
      ctx.fillText('Scratch here!', scratchCanvas.width / 2, scratchCanvas.height / 2);

      ctx.globalCompositeOperation = 'destination-out';
  }

  // Initialize the overlay
  drawOverlay();

  // Handle window resize
  window.addEventListener('resize', () => {
      // Update canvas dimensions
      scratchCanvas.width = window.innerWidth;
      scratchCanvas.height = window.innerHeight;

      // Redraw the overlay
      drawOverlay();
  });

  // Event handlers for scratching

  // Get the position within the canvas
  function getPosition(e) {
      const rect = scratchCanvas.getBoundingClientRect();
      let x, y;
      if (e.touches) {
          x = e.touches[0].clientX - rect.left;
          y = e.touches[0].clientY - rect.top;
      } else {
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
      }
      return { x, y };
  }

  // Start scratching
  function startScratch(e) {
      e.preventDefault();
      isScratching = true;
      lastPoint = getPosition(e);
      scratchShape(lastPoint.x, lastPoint.y, true); // Use scratchShape instead of scratchLine
  }

  // Continue scratching
  function moveScratch(e) {
      if (!isScratching) return;
      e.preventDefault();
      const currentPoint = getPosition(e);
      scratchShape(currentPoint.x, currentPoint.y, false); // Use scratchShape
      lastPoint = currentPoint;
  }

  // Stop scratching
  function endScratch(e) {
      isScratching = false;
      checkScratchCompletion();
  }

  // Draw the scratch shape (heart)
  function scratchShape(x, y, fresh) {
    const radius = 30; // Adjust heart size
    ctx.lineWidth = radius * 2; // Make line width based on radius
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'destination-out'; // Set composite operation here

    if (fresh) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    // Improved Heart Shape with more segments and adjusted control points
    ctx.beginPath();
    ctx.moveTo(x, y - radius * 0.7); // Start slightly higher for sharper bottom point

    // Left side of the heart
    ctx.bezierCurveTo(
        x - radius * 1.3, y - radius * 1.1,  // Control point 1 (Adjusted)
        x - radius * 1.7, y - radius * 0.1,   // Control point 2 (Adjusted)
        x - radius * 0.7, y + radius * 0.8    // End point
    );

    // Bottom of the heart (more curved)
    ctx.bezierCurveTo(
        x - radius * 0.3, y + radius * 1.5,  // Control point 1 (Adjusted)
        x + radius * 0.3, y + radius * 1.5,   // Control point 2 (Adjusted)
        x + radius * 0.7, y + radius * 0.8    // End point
    );

    // Right side of the heart
    ctx.bezierCurveTo(
        x + radius * 1.7, y - radius * 0.1,   // Control point 1 (Adjusted)
        x + radius * 1.3, y - radius * 1.1,  // Control point 2 (Adjusted)
        x, y - radius * 0.7                     // End point (back to the top center)
    );

    ctx.closePath();
    ctx.stroke();
}

  // Check how much has been scratched
  function checkScratchCompletion() {
      const imageData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;

      // Count transparent pixels
      for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] === 0) {
              transparentPixels++;
          }
      }

      const totalPixels = pixels.length / 4;
      const percentage = (transparentPixels / totalPixels) * 100;

      if (percentage > 70) {
          // Remove the overlay when threshold is reached
          scratchCanvas.style.transition = 'opacity 0.5s';
          scratchCanvas.style.opacity = '0';
          setTimeout(() => {
              scratchCanvas.parentNode.removeChild(scratchCanvas);
          }, 500);
      }
  }

  // Add event listeners
  scratchCanvas.addEventListener('mousedown', startScratch);
  scratchCanvas.addEventListener('mousemove', moveScratch);
  scratchCanvas.addEventListener('mouseup', endScratch);
  scratchCanvas.addEventListener('mouseleave', endScratch);

  // Touch events for mobile devices
  scratchCanvas.addEventListener('touchstart', startScratch);
  scratchCanvas.addEventListener('touchmove', moveScratch);
  scratchCanvas.addEventListener('touchend', endScratch);
  scratchCanvas.addEventListener('touchcancel', endScratch);
}

// Expose the function globally
window.setupScratchOverlay = setupScratchOverlay;