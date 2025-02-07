const loveLetterContainer = document.getElementById("loveLetterContainer");

function triggerLoveLetter() {
  document.getElementById("puzzleContainer").style.display = "none";
  loveLetterContainer.style.display = "flex";

  document.getElementById("yesButton").addEventListener("click", () => alert("Yay! ❤️"));
  document.getElementById("noButton").addEventListener("click", () => alert("Oh no! 💔"));
}
