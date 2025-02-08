// letter.js

function triggerLoveLetter() {
    // Hide the puzzle container
    const puzzleContainer = document.getElementById("puzzleContainer");
    if (puzzleContainer) {
      puzzleContainer.style.display = "none";
    }
  
    // Create the loveLetterContainer
    const loveLetterContainer = document.createElement("div");
    loveLetterContainer.id = "loveLetterContainer";
    document.body.appendChild(loveLetterContainer);
  
    // Create the envelope elements
    const envelope = document.createElement("div");
    envelope.classList.add("envelope");
  
    const envelopeFront = document.createElement("div");
    envelopeFront.classList.add("envelope-front");
  
    const envelopeFlap = document.createElement("div");
    envelopeFlap.classList.add("envelope-flap");
  
    const envelopeBody = document.createElement("div");
    envelopeBody.classList.add("envelope-body");
  
    const seal = document.createElement("div");
    seal.classList.add("seal");
    seal.textContent = "💌";
  
    envelopeBody.appendChild(seal);
    envelopeFront.appendChild(envelopeFlap);
    envelopeFront.appendChild(envelopeBody);
    envelope.appendChild(envelopeFront);
    loveLetterContainer.appendChild(envelope);
  
    // Create the letter elements
    const letter = document.createElement("div");
    letter.classList.add("letter");
  
    const letterContent = document.createElement("div");
    letterContent.classList.add("letter-content");
  
    const message = document.createElement("p");
    message.innerHTML = `
      My dearest [Name],
      <br><br>
      From the moment we met, you've brought so much joy and warmth into my life. Your smile lights up my day, and every moment with you is a treasure. I can't imagine this journey without you by my side.
      <br><br>
      Will you be my Valentine?
    `;
  
    const yesButton = document.createElement("button");
    yesButton.id = "yesButton";
    yesButton.textContent = "Yes";
  
    const noButton = document.createElement("button");
    noButton.id = "noButton";
    noButton.textContent = "No";
  
    letterContent.appendChild(message);
    letterContent.appendChild(yesButton);
    letterContent.appendChild(noButton);
    letter.appendChild(letterContent);
    loveLetterContainer.appendChild(letter);
  
    // Add event listeners
    seal.addEventListener("click", openEnvelope);
    yesButton.addEventListener("click", () => {
      alert("Yay! ❤️");
      // Implement any further actions here
    });
    noButton.addEventListener("click", () => {
      alert("Oh no! 💔");
      // Implement any further actions here
    });
  }
  
  function openEnvelope() {
    const envelopeFlap = document.querySelector(".envelope-flap");
    envelopeFlap.classList.add("open");
  
    const seal = document.querySelector(".seal");
    seal.style.display = "none";
  
    // Play opening sound
    const openSound = new Audio('sounds/envelope-open.mp3');
    openSound.play();
  
    // Delay the letter reveal to sync with the flap animation
    setTimeout(() => {
      const letter = document.querySelector(".letter");
      letter.classList.add("open");
    }, 1000);
  }
  
  