// app.js

// Grab all the bits
const cardEl = document.getElementById("card");
const leftWordEl = document.getElementById("leftWord");
const rightWordEl = document.getElementById("rightWord");
const wheelLeft = document.getElementById("wheelLeft");
const wheelRight = document.getElementById("wheelRight");
const wheelContainer = document.getElementById("wheelContainer");
const wheelFace = wheelContainer.querySelector(".wheel-face");
const selectorEl = document.getElementById("selector");
const hideBtn = document.getElementById("hideBtn");
const guessBtn = document.getElementById("guessBtn");
const resetBtn = document.getElementById("resetBtn");
const instructionsEl = document.getElementById("instructions");

let currentAngle = 0;
let isDragging = false;

// before_spin, after_spin, guess, reveal
let phase = "before_spin";

// --- State helpers ---
function reset() {
  wheelFace.classList.remove("hidden");
  selectorEl.classList.add("hidden");

  hideBtn.classList.add("hidden");
  guessBtn.classList.add("hidden");
  resetBtn.classList.add("hidden");

  instructionsEl.textContent =
    "ℹ️ Tap the wheel to spin! (You can also draw a new card if you don't like this one.)";
  phase = "before_spin";
}

function pickCard() {
  const [left, right] = cards[Math.floor(Math.random() * cards.length)];

  // flip to back
  cardEl.classList.add("flipped");
  // after halfway through the flip, swap words
  setTimeout(() => {
    const [left, right] = cards[Math.floor(Math.random() * cards.length)];
    leftWordEl.textContent = left;
    rightWordEl.textContent = right;
    wheelLeft.textContent = left;
    wheelRight.textContent = right;
    // flip back to front
    cardEl.classList.remove("flipped");
  }, 300); // half of 600ms
}

// --- 1. Tap Card → get a new card ---
cardEl.addEventListener("click", () => {
  if (phase !== "before_spin") {
    return;
  }
  pickCard();
});

// --- 2. Tap wheel → random spin. Can only do once. ---
wheelContainer.addEventListener("click", (e) => {
  // only spin if in right state
  if (phase !== "before_spin") {
    return;
  }
  phase = "after_spin";
  instructionsEl.textContent =
    "ℹ️ Give your clue. Then press 'Hide' and pass the phone to the other player(s).";
  newAngle = Math.random() * 180 - 90;
  // we spin 3x
  if (currentAngle <= 540) {
    newAngle += 1080;
  } else {
    newAngle -= 1080;
  }
  currentAngle = newAngle;
  wheelFace.style.transform = `rotate(${currentAngle}deg)`;
  hideBtn.classList.remove("hidden");
});

// --- 4. Hide → hide wheel, show selector ---
hideBtn.addEventListener("click", () => {
  if (phase !== "after_spin") {
    return;
  }
  phase = "guess";
  wheelFace.classList.add("hidden");
  selectorEl.classList.remove("hidden");
  selectorEl.style.transform = `rotate(0deg)`;

  hideBtn.classList.add("hidden");
  guessBtn.classList.remove("hidden");
  instructionsEl.textContent =
    "ℹ️ Move the selector to a position and press 'Lock Guess'.";
});

// --- allow tapping/dragging selector on wheelContainer ---
wheelContainer.addEventListener("pointerdown", (e) => {
  if (phase !== "guess") {
    return;
  }
  isDragging = true;
  updateSelector(e);
});
window.addEventListener("pointermove", (e) => {
  if (isDragging) updateSelector(e);
});
window.addEventListener("pointerup", () => {
  isDragging = false;
});

function updateSelector(e) {
  const rect = wheelContainer.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height; // bottom center
  const dx = e.clientX - cx;
  const dy = cy - e.clientY;
  const deg = (Math.atan2(dx, dy) * 180) / Math.PI;

  if (deg < -89 || deg > 89) {
    return;
  }

  selectorEl.style.transform = `rotate(${deg}deg)`;
}

// --- 5. Guess → reveal wheel under selector ---
guessBtn.addEventListener("click", () => {
  if (phase !== "guess") {
    return;
  }
  wheelFace.classList.remove("hidden");
  guessBtn.classList.add("hidden");
  resetBtn.classList.remove("hidden");
  instructionsEl.textContent =
    "ℹ️ Pass the phone to the next clue-giver and click 'Reset'!";
  phase = "reveal";
});

// --- 6. Reset everything ---
resetBtn.addEventListener("click", reset);

// --- INIT ---
// When page loads, we call reset() to set everything up.
reset();
pickCard();
