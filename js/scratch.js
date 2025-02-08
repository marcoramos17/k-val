// scratch.js

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
    scratchCanvas.style.zIndex = '9999'; // Ensure it's on top
    scratchCanvas.style.cursor = 'crosshair';
  
    // Append the canvas to the body
    document.body.appendChild(scratchCanvas);
  
    // Get the drawing context
    const ctx = scratchCanvas.getContext('2d');
  
    // Variables for scratching
    let isScratching = false;
    let lastPoint = null;
  
    // Draw the scratchable overlay
    function drawOverlay() {
      ctx.fillStyle = '#B0B0B0'; // Gray overlay color
      ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
  
      // Add text if desired
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.fillText('Scratch here!', scratchCanvas.width / 2, scratchCanvas.height / 2);
  
      // Set composite operation for scratching
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
      scratchLine(lastPoint.x, lastPoint.y, true);
    }
  
    // Continue scratching
    function moveScratch(e) {
      if (!isScratching) return;
      e.preventDefault();
      const currentPoint = getPosition(e);
      scratchLine(currentPoint.x, currentPoint.y, false);
      lastPoint = currentPoint;
    }
  
    // Stop scratching
    function endScratch(e) {
      isScratching = false;
      checkScratchCompletion();
    }
  
    // Draw the scratch line
    function scratchLine(x, y, fresh) {
      ctx.lineWidth = 50; // Adjust the scratch line width as desired
      ctx.lineCap = 'round';
  
      if (fresh) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
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
  

