/**
 * Victory System
 * 
 * Handles victory screen, confetti animations, and celebration effects
 * when player collects all toys
 */

// ============================================
// CONFETTI ANIMATION
// ============================================

/**
 * Creates confetti animation
 */
function createConfetti() {
  const container = document.getElementById('confettiContainer');
  const colors = ['#FACE68', '#5A9CB5', '#FA6868', '#FAAC68'];
  
  // Create 100 confetti pieces
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    container.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => confetti.remove(), 5000);
  }
}

// ============================================
// VICTORY SOUND
// ============================================

/**
 * Plays victory sound using Web Audio API
 */
function playVictorySound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Victory melody notes (frequencies in Hz)
  const melody = [
    { freq: 523.25, duration: 0.15 }, // C5
    { freq: 659.25, duration: 0.15 }, // E5
    { freq: 783.99, duration: 0.15 }, // G5
    { freq: 1046.50, duration: 0.3 }, // C6
    { freq: 783.99, duration: 0.15 }, // G5
    { freq: 1046.50, duration: 0.4 }, // C6
  ];
  
  let time = audioContext.currentTime;
  
  melody.forEach(note => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = note.freq;
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
    
    oscillator.start(time);
    oscillator.stop(time + note.duration);
    
    time += note.duration;
  });
}

// ============================================
// VICTORY SCREEN
// ============================================

/**
 * Shows victory screen
 */
function showVictoryScreen() {
  const victoryScreen = document.getElementById('victoryScreen');
  
  // Play sound
  playVictorySound();
  
  // Show screen with delay for dramatic effect
  setTimeout(() => {
    victoryScreen.classList.add('show');
    victoryScreen.setAttribute('aria-hidden', 'false');
    
    // Create confetti
    createConfetti();
    
    // Add more confetti bursts
    setTimeout(() => createConfetti(), 500);
    setTimeout(() => createConfetti(), 1000);
  }, 500);
}

/**
 * Restarts the game
 */
function restartGame() {
  const victoryScreen = document.getElementById('victoryScreen');
  
  // Hide victory screen
  victoryScreen.classList.remove('show');
  victoryScreen.setAttribute('aria-hidden', 'true');
  
  // Clear confetti
  document.getElementById('confettiContainer').innerHTML = '';
  
  // Reset game state (if gameState is defined in main.js)
  if (typeof gameState !== 'undefined') {
    gameState.collectedCount = 0;
    gameState.targetToy = null;
    gameState.isPlaying = false;
  }
  
  // Clear collection box (if elements is defined in main.js)
  if (typeof elements !== 'undefined' && elements.collectionBox) {
    elements.collectionBox.innerHTML = '';
  }
  
  // Reload page for fresh start
  setTimeout(() => location.reload(), 300);
}

// ============================================
// EVENT LISTENERS
// ============================================

// Restart button event listener
document.addEventListener('DOMContentLoaded', () => {
  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
  }
});

// Developer shortcut - Keyboard to show victory screen
document.addEventListener('keydown', (e) => {
  // Ctrl + Shift + V = Show victory screen (for testing)
  if (e.ctrlKey && e.shiftKey && e.key === 'V') {
    e.preventDefault();
    showVictoryScreen();
    console.log('🎉 Victory screen triggered via keyboard shortcut');
  }
});

// Expose to window for console access
window.showVictoryScreen = showVictoryScreen;
window.restartGame = restartGame;
