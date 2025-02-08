// letter.js

// Global variables
let scene, camera, renderer;
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
  // Hide other elements if necessary
  const puzzleContainer = document.getElementById('puzzleContainer');
  if (puzzleContainer) {
    puzzleContainer.style.display = 'none';
  }

  // Create the scene
  scene = new THREE.Scene();

  // Create the camera
  camera = new THREE.PerspectiveCamera(
    45, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );
  camera.position.z = 5; // Move the camera away from the origin

  // Create the renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background

  // Append the renderer's canvas element to the document
  document.body.appendChild(renderer.domElement);

  // Adjust the canvas style
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '10000'; // Ensure it's on top

  // Create the envelope
  createEnvelope();

  // Enable mouse controls
  enableMouseControls();

  // Handle window resize
  window.addEventListener('resize', onWindowResize, false);

  // Start the animation loop
  animate();
}

// Create the 3D envelope with triangular flap
function createEnvelope() {
  // Create materials
  const envelopeMaterial = new THREE.MeshPhongMaterial({ color: 0xfdf5e6 });
  const flapMaterial = new THREE.MeshPhongMaterial({ color: 0xf5deb3 });
  const sealMaterial = new THREE.MeshPhongMaterial({ color: 0xff3d68 });

  // Create the envelope body (thinner)
  const envelopeBodyGeometry = new THREE.BoxGeometry(2, 1.2, 0.02);
  const envelopeBody = new THREE.Mesh(envelopeBodyGeometry, envelopeMaterial);
  scene.add(envelopeBody);

  // Create the triangular flap using ShapeGeometry
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-1, 0);
  flapShape.lineTo(1, 0);
  flapShape.lineTo(0, 0.8);
  flapShape.lineTo(-1, 0);

  const flapGeometry = new THREE.ShapeGeometry(flapShape);
  const flap = new THREE.Mesh(flapGeometry, flapMaterial);

  // Position the flap
  flap.rotation.x = -Math.PI / 2;
  flap.position.z = 0.01;
  flap.position.y = 0.6;
  scene.add(flap);

  // Create the seal
  const sealGeometry = new THREE.CircleGeometry(0.1, 32);
  const seal = new THREE.Mesh(sealGeometry, sealMaterial);
  seal.position.set(0, 0.3, 0.011);
  scene.add(seal);

  // Create the letter as a thin plane
  const letterGeometry = new THREE.PlaneGeometry(1.8, 1.0);
  const letterMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const letter = new THREE.Mesh(letterGeometry, letterMaterial);
  letter.position.z = -0.005;
  letter.position.y = 0;
  scene.add(letter);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(0, 0, 10);
  scene.add(directionalLight);

  // Store objects for interaction
  envelopeObjects = { envelopeBody, flap, seal, letter };
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
  const previousMousePosition = { x: 0, y: 0 };

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

// Raycasting for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', onDocumentMouseClick, false);

function onDocumentMouseClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check for clicks on the seal or letter
  const objects = [envelopeObjects.seal];

  if (isEnvelopeOpened) {
    objects.push(envelopeObjects.letter);
  }

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;

    if (intersectedObject === envelopeObjects.seal && !isEnvelopeOpened) {
      // Open the envelope
      openEnvelope();
    } else if (intersectedObject === envelopeObjects.letter) {
      // Handle click on the letter
      promptForAnswer();
    }
  }
}

// Function to open the envelope
function openEnvelope() {
  isEnvelopeOpened = true;

  // Animate the flap opening
  const flap = envelopeObjects.flap;
  gsap.to(flap.rotation, {
    z: Math.PI / 2,
    duration: 1,
    onComplete: () => {
      // After the flap opens, slide out the letter
      slideOutLetter();
    },
  });

  // Remove the seal
  scene.remove(envelopeObjects.seal);
}

// Function to slide out the letter
function slideOutLetter() {
  const letter = envelopeObjects.letter;

  gsap.to(letter.position, {
    y: 1.5, // Adjust as needed
    duration: 1,
    onComplete: () => {
      // Display the letter content
      showLetterContent();
    },
  });
}

// Function to display the letter content as a texture
function showLetterContent() {
  const letter = envelopeObjects.letter;

  // Create a canvas for the letter content
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  // Draw the letter content on the canvas
  context.fillStyle = '#faf0e6'; // Light beige color
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#000000';
  context.font = '28px Great Vibes, cursive';
  context.textAlign = 'center';

  const message = `
  My dearest [Name],

  From the moment we met, you've brought so much joy and warmth into my life. Your smile lights up my day, and every moment with you is a treasure. I can't imagine this journey without you by my side.

  Will you be my Valentine?
  `;

  // Split the message into lines
  const lines = message.trim().split('\n');
  let y = 80;
  const lineHeight = 40;
  for (const line of lines) {
    context.fillText(line.trim(), canvas.width / 2, y);
    y += lineHeight;
  }

  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
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
  });
}

// Expose the function globally so it can be called from other scripts
window.triggerLoveLetter = triggerLoveLetter;
