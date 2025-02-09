// letter.js

// Global variables
let scene, camera, renderer, mouse, raycaster, seal, flap;
let envelopeObjects = {};
let isEnvelopeOpened = false;

// Dynamically load Three.js and GSAP libraries
function loadLibraries(callback) {
  // Load Three.js
  const threeScript = document.createElement('script');
  threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  document.head.appendChild(threeScript);

  // Load GSAP
  const gsapScript = document.createElement('script');
  gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
  document.head.appendChild(gsapScript);

  // Wait for both scripts to load
  let scriptsLoaded = 0;
  threeScript.onload = () => {
    scriptsLoaded++;
    if (scriptsLoaded === 2) callback();
  };
  gsapScript.onload = () => {
    scriptsLoaded++;
    if (scriptsLoaded === 2) callback();
  };
}

// Initialize the 3D envelope scene
function init3DEnvelope() {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Hide other elements if necessary
  const puzzleContainer = document.getElementById('puzzleContainer');
  if (puzzleContainer) {
    puzzleContainer.style.display = 'none';
  }

  // Create the scene, camera, and renderer (your existing code)
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '10000';

  // Create the envelope (which now groups all envelope parts)
  createEnvelope();

  // Animate the envelope appearance (call it just once after creation)
  animateEnvelopeAppearance();

  // Enable mouse controls, handle window resize, etc.
  enableMouseControls();
  window.addEventListener('resize', onWindowResize, false);

  // Start the render loop
  animate();
}



// Create the 3D envelope with correctly oriented flap
function createEnvelope() {
  // Create a group for the entire envelope
  const envelopeGroup = new THREE.Group();

  // Create materials
  const envelopeMaterial = new THREE.MeshStandardMaterial({
    color: '#a3d9a5', // Mint green
    roughness: 0.7,
    metalness: 0.0
  });
  
  const flapMaterial = new THREE.MeshStandardMaterial({
    color: '#8fcf95', // Slightly darker mint
    roughness: 0.7,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  
  const sealMaterial = new THREE.MeshPhongMaterial({
    color: 0xff3d68,
    side: THREE.DoubleSide,
  });

  // -------------------------
  // Create the envelope body
  // -------------------------
  const envelopeBodyGeometry = new THREE.BoxGeometry(2, 1, 0.02);
  const envelopeBody = new THREE.Mesh(envelopeBodyGeometry, envelopeMaterial);
  
  // Add outline (wireframe) to envelope body
  const envelopeEdges = new THREE.EdgesGeometry(envelopeBodyGeometry);
  const envelopeOutline = new THREE.LineSegments(
    envelopeEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  envelopeBody.add(envelopeOutline);
  
  // Position the envelope body
  envelopeBody.position.y = -0.5; // Align bottom edge
  
  // Add envelope body to the group
  envelopeGroup.add(envelopeBody);

  // -------------------------
  // Create the flap
  // -------------------------
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-1, 0);       // Top left corner
  flapShape.lineTo(1, 0);        // Top right corner
  flapShape.lineTo(0, -0.6);     // Bottom center point (tip)
  flapShape.lineTo(-1, 0);       // Close the shape

  const flapGeometry = new THREE.ShapeGeometry(flapShape);
  // No translation needed if pivot is already at the bottom edge

  flap = new THREE.Mesh(flapGeometry, flapMaterial);
  
  // Position the flap
  flap.position.y = 0.0;      // Align with top edge of envelope body
  flap.position.z = 0.01;     // Slightly in front of the body
  flap.rotation.x = 0;        // Closed at start
  
  // Add outline (wireframe) to flap
  const flapEdges = new THREE.EdgesGeometry(flapGeometry);
  const flapOutline = new THREE.LineSegments(
    flapEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  flap.add(flapOutline);

  // Add flap to the group
  envelopeGroup.add(flap);

  // -------------------------
  // Create the seal
  // -------------------------
  const sealGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32);
  seal = new THREE.Mesh(sealGeometry, sealMaterial);
  
  // Calculate the seal position at the tip of the flap
  const flapTipY = flap.position.y - 0.6;
  seal.position.set(0, flapTipY, 0.02); // Slightly in front of the flap
  seal.rotation.x = Math.PI / 2; // Face forward
  
  // Name the seal (used for interaction)
  seal.name = "seal";
  flap.name = "flap";
  
  // Add outline (wireframe) to seal
  const sealEdges = new THREE.EdgesGeometry(sealGeometry);
  const sealOutline = new THREE.LineSegments(
    sealEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  seal.add(sealOutline);
  
  // Add seal to the group
  envelopeGroup.add(seal);

  // -------------------------
  // Add the complete envelope group to the scene
  // -------------------------
  scene.add(envelopeGroup);

  // -------------------------
  // Create the letter (separate from the envelope group)
  // -------------------------
  const letterGeometry = new THREE.PlaneGeometry(1.8, 1.0);
  const oldPaperColor = new THREE.Color('#f4e1c1');  // Light tan for old paper

  const letterMaterial = new THREE.MeshPhongMaterial({
    color: oldPaperColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const letter = new THREE.Mesh(letterGeometry, letterMaterial);
  letter.position.z = -0.005; // Behind the envelope body
  letter.position.y = -0.5;   // Start inside the envelope
  scene.add(letter);

  // Add outline to letter
  const letterEdges = new THREE.EdgesGeometry(letterGeometry);
  const letterOutline = new THREE.LineSegments(
    letterEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  letterOutline.visible = false;
  letter.add(letterOutline);

  // -------------------------
  // Adjust lighting
  // -------------------------
  const ambientLight = new THREE.AmbientLight(0xf4e1c1, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, -1).normalize();  // Now the light comes from in front of the letter
  scene.add(directionalLight);


  // -------------------------
  // Store envelope objects for interaction and animation
  // -------------------------
  envelopeObjects = {
    envelope: envelopeGroup, // The complete envelope group
    envelopeBody,
    flap,
    seal,
    letter
  };
}



// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Mouse controls for rotating the envelope
function enableMouseControls() {
  let isMouseDown = false;

  renderer.domElement.addEventListener('mousedown', () => {
    isMouseDown = true;
  });

  renderer.domElement.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;

    const deltaMove = {
      x: event.movementX || event.mozMovementX || event.webkitMovementX || 0,
      y: event.movementY || event.mozMovementY || event.webkitMovementY || 0,
    };

    const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        toRadians(deltaMove.y * 0.5),
        toRadians(deltaMove.x * 0.5),
        0,
        'XYZ'
      )
    );

    scene.quaternion.multiplyQuaternions(deltaRotationQuaternion, scene.quaternion);
  });

  renderer.domElement.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  renderer.domElement.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

// Function to animate the scene
function animate() {
  requestAnimationFrame(animate);
  
  // Render the scene
  renderer.render(scene, camera);
}





function onDocumentMouseClick(event) {
    // Convert mouse click position to normalized device coordinates (NDC)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    console.log(`Mouse position: x = ${mouse.x}, y = ${mouse.y}`);
  
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    console.log("Raycaster updated!");
  
    

    // Check for intersections
    const objectsToCheck = [seal, flap]; // Only check these
    const intersects = raycaster.intersectObjects(objectsToCheck, true);

    console.log(`Intersects found: ${intersects.length}`);

    for (let i = 0; i < intersects.length; i++) {
    const intersectedObject = intersects[i].object;
    
    console.log("Intersected object:", intersectedObject);

    // Ignore LineSegments (outlines)
    if (intersectedObject.type === "LineSegments") {
        console.log("Skipping LineSegments object");
        continue;
    }

    // Check if the clicked object is the seal or the flap
    if (intersectedObject.name === "seal" || intersectedObject.name === "flap") {
        console.log("Seal or Flap clicked!");
        openEnvelope();
        break; // Stop checking after finding the first valid object
    }
    }

  }
  

  
  

// Function to open the envelope
function openEnvelope() {
  isEnvelopeOpened = true;

  // Retrieve the flap from the envelope group by its name
  const flapObj = envelopeObjects.envelope.getObjectByName("flap");
  if (!flapObj) {
    console.error("Flap object not found in envelope group!");
    return;
  }

  // Animate the flap opening around the X-axis
  gsap.to(flapObj.rotation, {
    x: -Math.PI * (200 / 180), // Rotate around 200 degrees
    duration: 1,
  });

  // Animate the flap's position (move it to the back side)
  gsap.to(flapObj.position, {
    z: -0.02, // Move flap to the back side
    duration: 1,
    onComplete: () => {
      // After the flap opens, slide out the letter
      slideOutLetter();
    },
  });

  // Retrieve and remove the seal from its parent group
  const sealObj = envelopeObjects.envelope.getObjectByName("seal");
  if (sealObj && sealObj.parent) {
    sealObj.parent.remove(sealObj);
  }

  // Play a sound effect (replace the path with your sound file)
  const audio = new Audio('sounds/envelope-open.mp3');
  audio.play().catch(err => {
    console.error("Error playing sound:", err);
  });
}


// Function to slide out the letter
function slideOutLetter() {
  const letter = envelopeObjects.letter;
  
  // Correct the letter orientation so its content faces the camera.
  // By default, the letter's front face is defined for positive Z.
  // Since the envelope rotated 180º, we flip the letter back.
  letter.rotation.y = Math.PI; 
  
  // Animate the letter sliding up
  gsap.to(letter.position, {
    y: 0.5, // Move the letter upward
    duration: 1,
    onComplete: () => {
      // Display the letter content
      showLetterContent();
    },
  });
  
  // Fade in the letter
  gsap.to(letter.material, {
    opacity: 1,
    duration: 1,
  });
}


// Function to display the letter content as a texture
// Function to display the letter content as a texture
function showLetterContent() {
  const letter = envelopeObjects.letter;

  // Increase canvas resolution for better text quality
  const canvas = document.createElement('canvas');
  const canvasWidth = 1024;  // Increase the resolution
  const canvasHeight = 1024; // Increase the resolution
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext('2d');

  // Draw the letter background (light beige color)
  context.fillStyle = '#faf0e6'; // Light beige color
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the text with improved styling and margins
  context.fillStyle = '#000000'; // Black color for text
  context.font = '40px Great Vibes, cursive'; // Larger font size for better visibility
  context.textAlign = 'center';
  context.textBaseline = 'top';  // Align text to the top for better spacing

  const margin = 100;  // Add margin for text positioning
  const maxWidth = canvas.width - 2 * margin;  // Max width for text
  const lineHeight = 50; // Increase line height for better spacing

  const message = `
  My dearest [Name],

  From the moment we met, you've brought so much joy and warmth into my life. Your smile lights up my day, and every moment with you is a treasure. I can't imagine this journey without you by my side.

  Will you be my Valentine?
  `;

  // Split the message into lines and adjust text to fit within the margins
  const lines = message.trim().split('\n');
  let y = margin; // Start drawing from the top margin
  for (const line of lines) {
    // Wrap text to fit within the max width
    const words = line.trim().split(' ');
    let currentLine = '';
    for (let word of words) {
      const testLine = currentLine + word + ' ';
      const testWidth = context.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine !== '') {
        context.fillText(currentLine, canvas.width / 2, y);
        currentLine = word + ' ';
        y += lineHeight;
      } else {
        currentLine = testLine;
      }
    }
    context.fillText(currentLine, canvas.width / 2, y);
    y += lineHeight;
  }

  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;  // Apply linear filtering for better texture quality
  letter.material.map = texture;
  letter.material.needsUpdate = true;
}


// Function to prompt for an answer
function promptForAnswer() {
  const answer = confirm('Will you be my Valentine?');
  if (answer) {
    alert('Yay! ❤️');
    // Implement additional actions
  } else {
    alert('Oh no! 💔');
    // Implement additional actions
  }
}

// Function to trigger the love letter sequence
function triggerLoveLetter() {
  loadLibraries(() => {
    init3DEnvelope();
    renderer.domElement.addEventListener('click', onDocumentMouseClick, false);
  });
}

// Function to show the pop-up and add buttons dynamically
function showPopUp() {
  // Create the container for the love letter pop-up
  const loveLetterContainer = document.createElement('div');
  loveLetterContainer.id = 'loveLetterContainer';
  
  // Create the letter content (message and buttons)
  const letterContent = document.createElement('div');
  letterContent.classList.add('letter-content');
  
  // Add the love message
  const message = document.createElement('p');
  message.innerHTML = `
    My Dearest [Name],<br><br>
    From the moment we met, you've brought so much joy and warmth into my life. Your smile lights up my day, and every moment with you is a treasure. I can't imagine this journey without you by my side.<br><br>
    Will you be my Valentine?
  `;
  letterContent.appendChild(message);

  // Create buttons (Yes and No)
  const yesButton = document.createElement('button');
  yesButton.innerText = 'Yes';
  yesButton.classList.add('reply-btn');
  yesButton.addEventListener('click', () => {
    alert('You said Yes!');  // Add further actions if needed
    closePopUp();
  });

  const noButton = document.createElement('button');
  noButton.innerText = 'No';
  noButton.classList.add('reply-btn');
  noButton.addEventListener('click', () => {
    alert('You said No!');  // Add further actions if needed
    closePopUp();
  });

  // Append buttons to the letter content
  letterContent.appendChild(yesButton);
  letterContent.appendChild(noButton);

  // Append everything to the pop-up container
  loveLetterContainer.appendChild(letterContent);

  // Append the pop-up to the body
  document.body.appendChild(loveLetterContainer);
  
  // Function to close the pop-up and remove it from the DOM
  function closePopUp() {
    loveLetterContainer.style.display = 'none';
    document.body.removeChild(loveLetterContainer);  // Remove the pop-up from the DOM
  }
}


// Function to animate the envelope appearing
function animateEnvelopeAppearance() {
  // Get the envelope group
  const envelope = envelopeObjects.envelope;
  if (!envelope) return;

  // Set the initial state:
  // Start very small at the center and a bit in front (z = 2)
  envelope.scale.set(0.1, 0.1, 0.1);
  envelope.position.set(0, 0, 2);
  envelope.rotation.set(0, 0, 0);

  // Animate scaling up to full size
  gsap.to(envelope.scale, {
    x: 1, y: 1, z: 1,
    duration: 1.5,
    ease: "power2.out"
  });

  // Animate position (moving along z so it comes into view)
  gsap.to(envelope.position, {
    z: 0,
    duration: 1.5,
    ease: "power2.out"
  });

  // Animate rotation: spin and end with its back facing the viewer
  // (Rotating around the y-axis so it ends at Math.PI)
  gsap.to(envelope.rotation, {
    y: Math.PI,
    duration: 1.5,
    ease: "power2.out",
    onComplete: function() {
      // Once the envelope animation is finished, reveal the letter's wireframe.
      envelopeObjects.letter.traverse(child => {
        if (child.type === "LineSegments") {
          child.visible = true;
        }
      });
    }
  });
}






// Trigger the pop-up after some delay (you can adjust this timing)
setTimeout(() => {
  showPopUp();
}, 5000);  // Show the pop-up after 5 seconds





// Expose the function globally so it can be called from other scripts
window.triggerLoveLetter = triggerLoveLetter;
