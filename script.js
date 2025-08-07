const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin");
const resultText = document.getElementById("result");
const spinSound = document.getElementById("spinSound");
const winSound = document.getElementById("winSound");

const userDisplay = document.getElementById("userDisplay");
const userPoints = document.getElementById("userPoints");
const spinLeftDisplay = document.getElementById("spinLeft");

const segments = ["10 Robux", "50 Robux", "0 Robux", "100 Robux", "20 Robux", "200 Robux"];
const colors = ["#f54242", "#42f554", "#f5e342", "#4287f5", "#f542dd", "#42f5e3"];

let angle = 0;
let spinning = false;

const user = localStorage.getItem("loggedInUser");
if (!user) {
  alert("Nicht eingeloggt! Du wirst zurück zur Login-Seite geleitet.");
  window.location.href = "login.html";
}

let userData = JSON.parse(localStorage.getItem(user)) || {
  password: "",
  points: 0,
  spinsLeft: 3
};

function updateUserUI() {
  userDisplay.textContent = user;
  userPoints.textContent = userData.points;
  spinLeftDisplay.textContent = userData.spinsLeft;
  resultText.textContent = "";
}

function saveUserData() {
  localStorage.setItem(user, JSON.stringify(userData));
}

function drawWheel() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;
  const arcSize = (2 * Math.PI) / segments.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < segments.length; i++) {
    const startAngle = i * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.fillStyle = colors[i];
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    // Text zeichnen
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#222";
    ctx.font = "bold 22px Arial";
    ctx.fillText(segments[i], radius - 15, 10);
    ctx.restore();
  }

  // Kreislinie
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#0ca20c";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawSpinningWheel() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  drawWheel();
  ctx.restore();

  // Pfeil oben mittig zeichnen
  ctx.fillStyle = "#0ca20c";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 15, 20);
  ctx.lineTo(canvas.width / 2 + 15, 20);
  ctx.lineTo(canvas.width / 2, 50);
  ctx.closePath();
  ctx.fill();
}

function spinWheel() {
  if (spinning) return;

  if (userData.spinsLeft <= 0) {
    alert("Du hast keine Drehversuche mehr!");
    return;
  }

  spinning = true;
  spinButton.disabled = true;

  if (spinSound) {
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});
  }

  const extraSpin = 360 * 5 + Math.floor(Math.random() * 360);
  const startAngle = angle;
  const targetAngle = angle + extraSpin;

  gsap.to({}, {
    duration: 4,
    ease: "power4.out",
    onUpdate() {
      angle = startAngle + extraSpin * this.progress();
      angle %= 360;
      drawSpinningWheel();
    },
    onComplete() {
      angle = targetAngle % 360;
      drawSpinningWheel();
      spinning = false;
      spinButton.disabled = false;
      showResult();
    }
  });
}

function showResult() {
  const degreesPerSegment = 360 / segments.length;
  const normalizedAngle = (angle + 360) % 360;
  const pointerAngle = (normalizedAngle + 90) % 360; // Pfeil zeigt bei 90°

  let index = Math.floor(pointerAngle / degreesPerSegment);
  index = (segments.length - 1 - index + segments.length) % segments.length;

  const resultSegment = segments[index];

  // Animation für Ergebnis-Text zurücksetzen
  resultText.style.animation = 'none';
  void resultText.offsetWidth; // Reflow triggern
  resultText.style.animation = null;

  resultText.textContent = `🎉 Du hast ${resultSegment} gewonnen!`;

  if (winSound) {
    winSound.currentTime = 0;
    winSound.play().catch(() => {});
  }

  const robuxAmount = parseInt(resultSegment) || 0;
  userData.points += robuxAmount;
  userData.spinsLeft--;
  updateUserUI();
  saveUserData();
}

spinButton.addEventListener("click", spinWheel);

updateUserUI();
drawSpinningWheel();
