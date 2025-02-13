// letter.js

// Global variables
let scene, camera, renderer, mouse, raycaster, seal, flap;
let envelopeObjects = {};
let isEnvelopeOpened = false;

const letterMessage = `
  Dear Kinza,

  Words could hardly express everything you mean to me. It has been quite the ride, we've had our ups and dows. But I hope you know, these were the best 6 months of my life.
  With all the good and the bad, I wouldn't have it any other way. Because it was through the good that I learned to love you and through the bad that I learned to cherish you.
  Sometimes it's scary, I really don't want to lose you, you are and have become my everything. Before I even noticed you became my best friend, my beloved girlfriend (and future wife), my princess, my love, my sweetheart.
  Truth be told, I fear living in a world without you. I fear not being able to achieve everything we set out to do, our goals, our dream, our plans and our future together.
  But it won't stop me, nothing will. I will fight for you, I will fight for us, I will fight for our love. I will fight for our future. From the very start, until the very end, I won't give up on you, I won't let you suffer alone, and I won't ever abandon you.
  This much I can promise, and this much I will do. I love you, Kinza, with all my heart and soul. I love you more than anything in this world, and I will love you for all eternity.
  With all that said and done,

  Will you be my Valentine?
`;

// Sentences in case of rejection
const sentences = [
  "Shush, don't be silly! Say yes!",
  "Ugh, imagine hating me!",
  "Seriously, what am I gonna do with you!",
  "NO! Not allowed! 😠",
  "Shhh baby, just be mine.",
  "We are not leaving here until you say yes",
  "Playing hard to get, huh?!",
  "Meanie! 😡",
  "This is who you're saying no to, by the way, if you even care: 😿",
  "But my love for you is big! Big like dinosaur! 🐱‍🐉 rawr",
];


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

  // Create the static 2D scenery canvas
  createThreeSceneryCanvas();
  //createSceneryCanvas();

  // Create the scene, camera, and renderer (your existing code)
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 3;

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
  //enableTouchControls();
  window.addEventListener('resize', onWindowResize, false);

  // Start the render loop
  animate();
}



// Create the 3D envelope with correctly oriented flap
function createEnvelope() {
  createPuzzleSceneryCanvas();  // Draw the background scenery
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

  // Create the envelope body (thinner)
  const envelopeBodyGeometry = new THREE.BoxGeometry(2, 1, 0.02);
  const envelopeBody = new THREE.Mesh(envelopeBodyGeometry, envelopeMaterial);
  
  // Add outline to envelope body
  const envelopeEdges = new THREE.EdgesGeometry(envelopeBodyGeometry);
  const envelopeOutline = new THREE.LineSegments(
    envelopeEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  envelopeBody.add(envelopeOutline);

  // Adjust envelope body position
  envelopeBody.position.y = -0.5; // Align bottom edge
  
  // Add envelope body to the group
  envelopeGroup.add(envelopeBody);

  // Create the triangular flap pointing downward
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-1, 0);    // Top left corner
  flapShape.lineTo(1, 0);     // Top right corner
  flapShape.lineTo(0, -0.6);  // Bottom center point (tip)
  flapShape.lineTo(-1, 0);    // Close the shape

  const flapGeometry = new THREE.ShapeGeometry(flapShape);
  flapGeometry.translate(0, 0, 0);

  flap = new THREE.Mesh(flapGeometry, flapMaterial);

  // Position the flap
  flap.position.y = 0.0;
  flap.position.z = 0.01;
  flap.rotation.x = 0;
  
  // Add outline to flap
  const flapEdges = new THREE.EdgesGeometry(flapGeometry);
  const flapOutline = new THREE.LineSegments(
    flapEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  flap.add(flapOutline);

  // Add flap to the group
  envelopeGroup.add(flap);

  // Create the seal and attach it to the tip of the flap
  const sealGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32);
  seal = new THREE.Mesh(sealGeometry, sealMaterial);
  
  const flapTipY = flap.position.y - 0.6;
  seal.position.set(0, flapTipY, 0.02);
  seal.rotation.x = Math.PI / 2;
  seal.name = "seal";
  flap.name = "flap";
  
  // Add outline to seal
  const sealEdges = new THREE.EdgesGeometry(sealGeometry);
  const sealOutline = new THREE.LineSegments(
    sealEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  seal.add(sealOutline);

  // Add the strawberry image to the seal
  const loader = new THREE.TextureLoader();
  loader.load('img/strawberry.webp', (texture) => {
    const sealImageMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const sealImageGeometry = new THREE.CircleGeometry(0.08, 32); // Slightly smaller than the seal
    const sealImage = new THREE.Mesh(sealImageGeometry, sealImageMaterial);
    sealImage.position.set(0, 0.02, 0.011); // Slightly above the seal face
    sealImage.rotation.x = Math.PI + (Math.PI/2); // Rotate to face away from the envelope
    sealImage.rotation.y = Math.PI /2  - (Math.PI*.5); // Rotate to face away from the envelope
    sealImage.rotation.z = Math.PI *2; // Rotate to face away from the envelope
    seal.add(sealImage);
  });

  // Add seal to the group
  envelopeGroup.add(seal);

  // Add the complete envelope group to the scene
  scene.add(envelopeGroup);

  // Create the letter (separate from the envelope group)
  const letterGeometry = new THREE.PlaneGeometry(1.8, 1.0);
  const oldPaperColor = new THREE.Color('#f4e1c1');  // Light tan for old paper

  const letterMaterial = new THREE.MeshPhongMaterial({
    color: oldPaperColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const letter = new THREE.Mesh(letterGeometry, letterMaterial);
  letter.position.z = -0.005;
  letter.position.y = -0.5;
  scene.add(letter);

  // Add outline to letter and initially hide it
  const letterEdges = new THREE.EdgesGeometry(letterGeometry);
  const letterOutline = new THREE.LineSegments(
    letterEdges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  letterOutline.visible = false;
  letter.add(letterOutline);

  // Adjust lighting
  const ambientLight = new THREE.AmbientLight(0xf4e1c1, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, -1).normalize();
  scene.add(directionalLight);

  // Store envelope objects for later reference and animation
  envelopeObjects = {
    envelope: envelopeGroup,
    envelopeBody,
    flap,
    seal,
    letter
  };

  // Add the envelope back detail (text and images) to the envelope group
  addEnvelopeBackDetail();
}


function createEnvelopeBackTexture() {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  // Fill the background with the envelope color (mint green)
  context.fillStyle = '#a3d9a5';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw "From: Marco" at the top left
  context.font = "80px Tangerine, cursive";
  context.weight = "700";
  context.fillStyle = "#000";
  context.textAlign = "left";
  context.fillText("From: Marco", 50, 70); // Coordinates: (50,70)
  
  // Draw "To: Kinza" at the bottom right
  context.textAlign = "right";
  context.fillText("To: Kinza", canvas.width - 50, canvas.height - 30); // Coordinates: (canvas.width-50, canvas.height-30)
  
  // --- Draw 3 Images ---
  // Create three image objects with placeholder sources (change these URLs as needed)
  const img1 = new Image();
  const img2 = new Image();
  const img3 = new Image();
  img1.src = 'img/dino.png';
  img2.src = 'img/strawberry.png';
  img3.src = 'img/stamp.png';
  
  // Define coordinates and sizes for each image (adjust as desired)
  const img1Coords = { x: 100, y: 100, width: 250, height: 250 };
  const img2Coords = { x: 550, y: 280, width: 200, height: 260 };
  const img3Coords = { x: 800, y: 50, width: 200, height: 200 };
  
  // Create a canvas texture now so we can update it when images load.
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  
  // When each image loads, draw it on the canvas and update the texture.
   // When each image loads, draw it on the canvas and update the texture.
   img1.onload = function() {
    context.save(); // Save the current context state
    context.translate(img1Coords.x + img1Coords.width / 2, img1Coords.y + img1Coords.height / 2); // Move to the image's center
    context.rotate(Math.PI / 18);  // Rotate the image by 10 degrees
    context.drawImage(img1, -img1Coords.width / 2, -img1Coords.height / 2, img1Coords.width, img1Coords.height);  // Draw image centered
    context.restore();  // Restore the context to its original state
    texture.needsUpdate = true;
  };

  img2.onload = function() {
    context.save(); // Save the current context state
    context.translate(img2Coords.x + img2Coords.width / 2, img2Coords.y + img2Coords.height / 2); // Move to the image's center
    context.rotate(Math.PI / -24);  // Rotate the image by 7.5 degrees
    context.drawImage(img2, -img2Coords.width / 2, -img2Coords.height / 2, img2Coords.width, img2Coords.height);  // Draw image centered
    context.restore();  // Restore the context to its original state
    texture.needsUpdate = true;
  };
  img3.onload = function() {
    context.drawImage(img3, img3Coords.x, img3Coords.y, img3Coords.width, img3Coords.height);
    texture.needsUpdate = true;
  };
  
  return texture;
}


function addEnvelopeBackDetail() {
  // Create a plane geometry the same size as the envelope body (2 x 1)
  const geometry = new THREE.PlaneGeometry(2, 1);
  
  // Create a material using the canvas texture
  const texture = createEnvelopeBackTexture();
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
  
  const backDetail = new THREE.Mesh(geometry, material);
  
  // Position the back detail on the back side of the envelope.
  // The envelope body is centered at y = -0.5; its thickness is 0.02.
  // We offset slightly on the z-axis (e.g., -0.011) so that it sits on the back.
  backDetail.position.set(0, -0.5, -0.011);
  
  // Apply a negative scale on the x-axis to mirror the texture horizontally
  backDetail.scale.x = -1;
  

  // Add the back detail as a child of the envelope group
  envelopeObjects.envelope.add(backDetail);
}




// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function enableMouseControls() {
  let isInteracting = false;
  let lastTouchX = 0, lastTouchY = 0;

  // Mouse Events
  renderer.domElement.addEventListener('mousedown', (event) => {
    isInteracting = true;
  });

  renderer.domElement.addEventListener('mousemove', (event) => {
    if (!isInteracting) return;

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
    isInteracting = false;
  });

  renderer.domElement.addEventListener('mouseleave', () => {
    isInteracting = false;
  });

  // Touch Events
  renderer.domElement.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      isInteracting = true;
      lastTouchX = event.touches[0].clientX;
      lastTouchY = event.touches[0].clientY;
    }
  });

  renderer.domElement.addEventListener('touchmove', (event) => {
    if (!isInteracting || event.touches.length !== 1) return;

    const touch = event.touches[0];

    const deltaMove = {
      x: touch.clientX - lastTouchX,
      y: touch.clientY - lastTouchY,
    };

    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;

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

  renderer.domElement.addEventListener('touchend', () => {
    isInteracting = false;
  });

  renderer.domElement.addEventListener('touchcancel', () => {
    isInteracting = false;
  });
}

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
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
        console.log("Envelope opened!");
        // Trigger the pop-up after some delay (you can adjust this timing)
        setTimeout(() => {
          showPopUp();
        }, 3000);  // Show the pop-up after 5 seconds
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
  context.font = "65px Tangerine, cursive";
  context.weight = "700";
  context.textAlign = 'center';
  context.textBaseline = 'top';  // Align text to the top for better spacing

  const margin = 100;  // Add margin for text positioning
  const maxWidth = canvas.width - 2 * margin;  // Max width for text
  const lineHeight = 50; // Increase line height for better spacing

  // Use the shared message
  const message = letterMessage;

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

function playNoSound() {
  const noSound = new Audio("sounds/wait-no.mp3");
  noSound.play();
}

// Function to show the pop-up and add buttons dynamically
function showPopUp() {
  scoreDisplay.textContent = "Please say yes! 🥺";
  // Create the container for the love letter pop-up
  const loveLetterContainer = document.createElement('div');
  loveLetterContainer.id = 'loveLetterContainer';
  loveLetterContainer.style.width = '80%'; // Set width to 80% of the screen width
  loveLetterContainer.style.maxWidth = '800px'; // Set a maximum width
  loveLetterContainer.style.margin = '0 auto'; // Center the container horizontally

  // Create the letter content (message and buttons)
  const letterContent = document.createElement('div');
  letterContent.classList.add('letter-content');
  
  // Add the love message
  const message = document.createElement('p');
  message.innerHTML = letterMessage.replace(/\n/g, '<br>'); // Replace newlines with <br> for HTML formatting
  letterContent.appendChild(message);

  // Create buttons (Yes and No)
  const yesButton = document.createElement('button');
  yesButton.innerText = 'Yes';
  yesButton.classList.add('reply-btn');
  yesButton.addEventListener('click', () => {
    scoreDisplay.textContent = "YAYYY!! ❤️";  // Update the score display
    //triggerExplosionAndSound();  // Trigger the explosion and sound
    //closePopUp();  // Close the pop-up
  });

  const noButton = document.createElement('button');
  noButton.innerText = 'No';
  noButton.classList.add('reply-btn');
  noButton.addEventListener('click', () => {
    playNoSound();  // Play a sad sound
    scoreDisplay.textContent = getRandomSentence();
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
    duration: 5,
    ease: "power2.out"
  });

  // Animate position (moving along z so it comes into view)
  gsap.to(envelope.position, {
    z: 0,
    duration: 5,
    ease: "power2.out"
  });

  // Animate rotation: spin and end with its back facing the viewer
  // (Rotating around the y-axis so it ends at Math.PI)
  gsap.to(envelope.rotation, {
    y: Math.PI,
    duration: 5,
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



// Create explosion and sound effect when "Yes" is clicked
function triggerExplosionAndSound() {
  // Create a container for the explosion effect
  const explosionContainer = document.createElement('div');
  explosionContainer.classList.add('explosion-container');

  // Number of emojis in the explosion
  const numEmojis = 70;

  // Emojis for the explosion effect
  const emojis = ['🍓', '👠', '❤️', '✨', '🐻'];

  // Create emoji elements and append them to the container
  for (let i = 0; i < numEmojis; i++) {
    const emoji = document.createElement('span');
    emoji.classList.add('emoji');
    emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    // Randomize initial position and size of the emojis
    emoji.style.position = 'absolute';
    emoji.style.left = `${Math.random() * 100}%`;
    emoji.style.top = `${Math.random() * 100}%`;
    emoji.style.fontSize = `${Math.random() * 30 + 20}px`; // Random size between 20px and 50px
    emoji.style.opacity = '1';
    emoji.style.transition = 'all 1s ease-out';

    // Animate the explosion (random direction and distance)
    setTimeout(() => {
      const angle = Math.random() * 360;
      const distance = Math.random() * 200 + 100; // Random distance between 100px and 300px
      const xOffset = distance * Math.cos(angle);
      const yOffset = distance * Math.sin(angle);

      emoji.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      emoji.style.opacity = '0'; // Fade out
    }, 100);

    // Append emoji to the container
    explosionContainer.appendChild(emoji);
  }

  // Append the explosion container to the body
  document.body.appendChild(explosionContainer);

  // Play the explosion sound
  const explosionSound = new Audio('sounds/brainrot-cat.mp3');  // Replace with the actual path of your sound file
  explosionSound.play();

  // Remove explosion container after animation
  setTimeout(() => {
    explosionContainer.remove();
  }, 2000);  // Remove after 1 second (when animation is complete)
}

// Expose the function globally so it can be called from other scripts
window.triggerLoveLetter = triggerLoveLetter;

function getRandomSentence() {
  const randomIndex = Math.floor(Math.random() * sentences.length);
  return sentences[randomIndex];
}


function createThreeSceneryCanvas() {
  // Create a canvas that sits behind the 3D canvas
  const sceneryCanvas = document.createElement('canvas');
  sceneryCanvas.width = width;
  sceneryCanvas.height = height;
  sceneryCanvas.style.position = 'fixed';
  sceneryCanvas.style.top = '0';
  sceneryCanvas.style.left = '0';
  sceneryCanvas.style.zIndex = '1'; // Ensure it's behind the 3D canvas

  document.body.appendChild(sceneryCanvas);

  const ctx = sceneryCanvas.getContext('2d');

  // Use the shared function to draw the scenery
  drawSharedScenery(ctx, sceneryCanvas.width, sceneryCanvas.height);

  // Load and draw cat images
  const kcat = new Image();
  kcat.src = './img/kcat.png';
  kcat.onload = () => {
    ctx.drawImage(kcat, idealPositions.kcat.x, idealPositions.kcat.y, catWidth, kcatHeight);
  };

  const mcat = new Image();
  mcat.src = './img/mcat.png';
  mcat.onload = () => {
    ctx.drawImage(mcat, idealPositions.mcat.x, idealPositions.mcat.y, catWidth, mcatHeight);
  };

}