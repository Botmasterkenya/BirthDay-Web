

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
let balloonsToPop = 20; // Number of balloons required to trigger the reveal
let activeBalloons = 0;
const balloonContainer = document.getElementById('balloon-container');
const instructions = document.getElementById('instructions');
const revealContainer = document.getElementById('reveal-container');
let instructionsHidden = false;
let gameWon = false;

function createBalloon() {
  if (gameWon) return;

  const balloon = document.createElement('div');
  balloon.classList.add('balloon');

  // Randomize color
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  balloon.style.backgroundColor = randomColor;
  balloon.style.setProperty('--balloon-color', randomColor); // Used for pseudo-element

  // Randomize horizontal position 
  // keeping it mostly within bounds to ensure clickability
  const xPosition = Math.random() * 80 + 10; // 10% to 90% view width
  balloon.style.left = `${xPosition}vw`;

  // Randomize float speed and delay
  const floatDuration = Math.random() * 5 + 5; // 5s to 10s
  balloon.style.animationDuration = `${floatDuration}s, 3s`;
  
  // Custom click handler
  balloon.addEventListener('pointerdown', (e) => {
    if (balloon.classList.contains('popped')) return;

    // Play a tiny haptic feedback built into browsers (if supported/enabled)
    if (navigator.vibrate) navigator.vibrate(20);

    // Visual pop
    balloon.classList.add('popped');
    
    // Hide instructions on first pop
    if (!instructionsHidden) {
      instructions.classList.add('hidden');
      instructionsHidden = true;
    }

    // Small pop confetti locally at cursor
    confetti({
      particleCount: 15,
      startVelocity: 15,
      spread: 360,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      },
      colors: [randomColor, '#ffffff']
    });

    // Handle game logic
    balloonsToPop--;
    
    // Remove after animation completes
    setTimeout(() => {
      if (balloonContainer.contains(balloon)) {
        balloonContainer.removeChild(balloon);
        activeBalloons--;
      }
    }, 100); // Quick remove since it's zero scale

    checkWinCondition();
  });

  // Automatically remove if it floats off screen
  balloon.addEventListener('animationend', (e) => {
    if (e.animationName === 'floatUp') {
      if (balloonContainer.contains(balloon)) {
        balloonContainer.removeChild(balloon);
        activeBalloons--;
      }
    }
  });

  balloonContainer.appendChild(balloon);
  activeBalloons++;
}

function checkWinCondition() {
  if (balloonsToPop <= 0 && !gameWon) {
    gameWon = true;

    // Stop making balloons, remove current ones
    balloonContainer.innerHTML = '';
    
    // Trigger grand reveal
    revealContainer.classList.remove('hidden');

    // Grand explosion effect
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      // launch a few confetti from the left edge
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      // and from the right edge
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
}

// Initial Spawn Loop
function spawnLoop() {
  if (!gameWon) {
    // Keep max 10 balloons on screen at a time to not overwhelm the UI
    if (activeBalloons < 10) {
       // spawn 1 to 2 at a time
       const count = Math.ceil(Math.random() * 2);
       for(let i=0; i<count; i++) {
        createBalloon();
       }
    }
    // Check every 500-1500ms
    const nextSpawn = Math.random() * 1000 + 500;
    setTimeout(spawnLoop, nextSpawn);
  }
}

// Start
spawnLoop();
