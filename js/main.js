/**
 * Claw Machine Game
 * 
 * A retro pixel art claw machine arcade game
 * Built with vanilla JavaScript (ES6+)
 * 
 * @author GitHub Bootcamp
 * @version 1.0.0
 */

// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
  // Scale multiplier for pixel art
  SCALE: 2,
  
  // Buffer distances
  CORNER_BUFFER: 16,
  MACHINE_BUFFER: { x: 36, y: 16 },
  
  // Animation timing (ms)
  MOVE_SPEED: 100,
  FAST_MOVE_SPEED: 50,
  GRAB_DELAY: 500,
  DROP_DELAY: 700,
  
  // Toy grid configuration
  TOYS_PER_ROW: 4,
  TOYS_ROWS: 3,
  SKIP_INDEX: 8, // Index to skip for collection point
  TOTAL_TOYS: 11, // Total collectible toys
};

// ============================================
// GAME STATE
// ============================================

const gameState = {
  targetToy: null,
  collectedCount: 0,
  isPlaying: false,
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  clawMachine: document.querySelector('.claw-machine'),
  box: document.querySelector('.box'),
  collectionBox: document.querySelector('.collection-box'),
  collectionArrow: document.querySelector('.collection-arrow'),
  toys: [],
};

// ============================================
// TOY DEFINITIONS
// ============================================

const toyTypes = {
  bear: { w: 20 * CONFIG.SCALE, h: 27 * CONFIG.SCALE },
  bunny: { w: 20 * CONFIG.SCALE, h: 29 * CONFIG.SCALE },
  golem: { w: 20 * CONFIG.SCALE, h: 27 * CONFIG.SCALE },
  cucumber: { w: 16 * CONFIG.SCALE, h: 28 * CONFIG.SCALE },
  penguin: { w: 24 * CONFIG.SCALE, h: 22 * CONFIG.SCALE },
  robot: { w: 20 * CONFIG.SCALE, h: 30 * CONFIG.SCALE },
  roses: { w: 20 * CONFIG.SCALE, h: 30 * CONFIG.SCALE },
};

// Shuffle toys for random placement
const shuffledToys = [...Object.keys(toyTypes), ...Object.keys(toyTypes)]
  .sort(() => Math.random() - 0.5);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Converts radians to degrees
 * @param {number} rad - Radians
 * @returns {number} Degrees
 */
const radToDeg = (rad) => Math.round(rad * (180 / Math.PI));

/**
 * Calculates X position in grid
 * @param {number} index - Item index
 * @param {number} columns - Number of columns
 * @returns {number} X position
 */
const calcGridX = (index, columns) => index % columns;

/**
 * Calculates Y position in grid
 * @param {number} index - Item index
 * @param {number} columns - Number of columns
 * @returns {number} Y position
 */
const calcGridY = (index, columns) => Math.floor(index / columns);

/**
 * Generates random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
const randomInRange = (min, max) => {
  return Math.round(min - 0.5 + Math.random() * (max - min + 1));
};

/**
 * Adjusts angle to 0-360 range
 * @param {number} angle - Angle in degrees
 * @returns {number} Adjusted angle
 */
const normalizeAngle = (angle) => {
  const adjusted = angle % 360;
  return adjusted < 0 ? adjusted + 360 : adjusted;
};

/**
 * Checks if two rectangles overlap
 * @param {Object} rectA - First rectangle
 * @param {Object} rectB - Second rectangle
 * @returns {boolean} True if overlapping
 */
const doRectsOverlap = (rectA, rectB) => {
  return (
    rectB.x > rectA.x &&
    rectB.x < rectA.x + rectA.w &&
    rectB.y > rectA.y &&
    rectB.y < rectA.y + rectA.h
  );
};

// ============================================
// MACHINE DIMENSIONS
// ============================================

const machineBounds = document.querySelector('.claw-machine').getBoundingClientRect();
const machineTopBounds = document.querySelector('.machine-top').getBoundingClientRect();
const machineBottomBounds = document.querySelector('.machine-bottom').getBoundingClientRect();

const dimensions = {
  machineWidth: machineBounds.width,
  machineHeight: machineBounds.height,
  machineTop: machineBounds.top,
  machineTopHeight: machineTopBounds.height,
  machineBottomHeight: machineBottomBounds.height,
  machineBottomTop: machineBottomBounds.top,
  maxArmLength: machineBottomBounds.top - machineBounds.top - CONFIG.MACHINE_BUFFER.y,
};

// ============================================
// BUTTON CLASS
// ============================================

class Button {
  /**
   * Creates a game button
   * @param {Object} options - Button options
   */
  constructor({ className, isLocked = true, onPress, onRelease }) {
    this.el = document.querySelector(`.${className}`);
    this.isLocked = isLocked;
    this.onPress = onPress;
    this.onRelease = onRelease;
    
    this.bindEvents();
    
    if (!isLocked) {
      this.activate();
    }
  }
  
  /**
   * Binds event listeners
   */
  bindEvents() {
    // Press events
    ['mousedown', 'touchstart'].forEach((event) => {
      this.el.addEventListener(event, (e) => {
        e.preventDefault();
        if (!this.isLocked && this.onPress) {
          this.onPress();
        }
      });
    });
    
    // Release events
    ['mouseup', 'touchend'].forEach((event) => {
      this.el.addEventListener(event, (e) => {
        e.preventDefault();
        if (!this.isLocked && this.onRelease) {
          this.onRelease();
        }
      });
    });
  }
  
  /**
   * Activates the button
   */
  activate() {
    this.isLocked = false;
    this.el.classList.add('active');
  }
  
  /**
   * Deactivates the button
   */
  deactivate() {
    this.isLocked = true;
    this.el.classList.remove('active');
  }
}

// ============================================
// WORLD OBJECT CLASS
// ============================================

class WorldObject {
  /**
   * Creates a world object
   * @param {Object} props - Object properties
   */
  constructor(props) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
    this.h = 0;
    this.angle = 0;
    this.transformOrigin = { x: 0, y: 0 };
    this.interval = null;
    this.defaultValues = {};
    this.linkedObjects = [];
    
    // Apply props
    Object.assign(this, props);
    
    // Get element if className provided
    if (props.className) {
      this.el = document.querySelector(`.${props.className}`);
      const bounds = this.el.getBoundingClientRect();
      this.w = bounds.width;
      this.h = bounds.height;
    }
    
    // Store default values
    ['x', 'y', 'w', 'h'].forEach((key) => {
      this.defaultValues[key] = this[key];
    });
    
    this.applyStyles();
  }
  
  /**
   * Applies CSS styles
   */
  applyStyles() {
    if (!this.el) return;
    
    Object.assign(this.el.style, {
      left: `${this.x}px`,
      top: this.bottom ? undefined : `${this.y}px`,
      bottom: this.bottom,
      width: `${this.w}px`,
      height: `${this.h}px`,
      transformOrigin: typeof this.transformOrigin === 'string' 
        ? this.transformOrigin 
        : `${this.transformOrigin.x}px ${this.transformOrigin.y}px`,
      zIndex: this.z,
    });
  }
  
  /**
   * Sets transform origin
   * @param {Object|string} origin - Origin point or 'center'
   */
  setTransformOrigin(origin) {
    this.transformOrigin = origin === 'center' 
      ? 'center' 
      : `${origin.x}px ${origin.y}px`;
    this.applyStyles();
  }
  
  /**
   * Sets claw position reference
   * @param {Object} pos - Claw position
   */
  setClawPosition(pos) {
    this.clawPos = pos;
  }
  
  /**
   * Updates shadow scale based on arm length
   */
  updateShadowScale() {
    const scale = 0.5 + this.h / dimensions.maxArmLength / 2;
    elements.box.style.setProperty('--scale', scale);
  }
  
  /**
   * Clears movement interval and calls callback
   * @param {Function} callback - Callback function
   */
  stopMovement(callback) {
    clearInterval(this.interval);
    this.interval = null;
    if (callback) callback();
  }
  
  /**
   * Moves object to target
   * @param {Object} options - Movement options
   */
  move({ axis, target, speed, onComplete }) {
    if (this.interval) {
      this.stopMovement(onComplete);
      return;
    }
    
    const targetValue = target ?? this.defaultValues[axis];
    
    this.interval = setInterval(() => {
      const distance = Math.abs(this[axis] - targetValue);
      const step = Math.min(distance, 10);
      const direction = this[axis] > targetValue ? -1 : 1;
      
      if ((direction > 0 && this[axis] < targetValue) || 
          (direction < 0 && this[axis] > targetValue)) {
        this[axis] += step * direction;
        this.applyStyles();
        
        if (axis === 'h') {
          this.updateShadowScale();
        }
        
        // Move linked objects
        this.linkedObjects.forEach((obj) => {
          if (!obj) return;
          const linkedAxis = axis === 'h' ? 'y' : axis;
          obj[linkedAxis] += step * direction;
          obj.applyStyles();
        });
      } else {
        this.stopMovement(onComplete);
      }
    }, speed || CONFIG.MOVE_SPEED);
  }
  
  /**
   * Resumes movement after clearing interval
   * @param {Object} options - Movement options
   */
  resumeMove(options) {
    this.interval = null;
    this.move(options);
  }
  
  /**
   * Calculates distance to another object
   * @param {Object} target - Target object
   * @returns {number} Distance
   */
  distanceTo(target) {
    return Math.round(
      Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2))
    );
  }
}

// ============================================
// TOY CLASS
// ============================================

class Toy extends WorldObject {
  /**
   * Creates a toy
   * @param {Object} props - Toy properties
   */
  constructor(props) {
    const type = shuffledToys[props.index];
    const size = toyTypes[type];
    
    // Create element
    const el = document.createElement('div');
    el.className = `toy pix ${type}`;
    
    // Calculate position
    const x = CONFIG.CORNER_BUFFER +
      calcGridX(props.index, CONFIG.TOYS_PER_ROW) * 
      ((dimensions.machineWidth - CONFIG.CORNER_BUFFER * 3) / CONFIG.TOYS_PER_ROW) +
      size.w / 2 +
      randomInRange(-6, 6);
      
    const y = dimensions.machineBottomTop -
      dimensions.machineTop +
      CONFIG.CORNER_BUFFER +
      calcGridY(props.index, CONFIG.TOYS_PER_ROW) *
      ((dimensions.machineBottomHeight - CONFIG.CORNER_BUFFER * 2) / CONFIG.TOYS_ROWS) -
      size.h / 2 +
      randomInRange(-2, 2);
    
    super({
      el,
      x,
      y,
      z: 0,
      type,
      ...size,
      ...props,
    });
    
    elements.box.appendChild(this.el);
    this.el.addEventListener('click', () => this.collect());
    elements.toys.push(this);
  }
  
  /**
   * Collects the toy
   */
  collect() {
    this.el.classList.remove('selected');
    this.x = dimensions.machineWidth / 2 - this.w / 2;
    this.y = dimensions.machineHeight / 2 - this.h / 2;
    this.z = 7;
    this.el.style.setProperty('--rotate-angle', '0deg');
    this.setTransformOrigin('center');
    this.el.classList.add('display');
    elements.clawMachine.classList.add('show-overlay');
    
    gameState.collectedCount++;
    
    // Add to collection box
    const wrapper = document.createElement('div');
    wrapper.className = `toy-wrapper ${gameState.collectedCount > 6 ? 'squeeze-in' : ''}`;
    wrapper.innerHTML = `<div class="toy pix ${this.type}"></div>`;
    elements.collectionBox.appendChild(wrapper);
    
    // Remove overlay after animation
    setTimeout(() => {
      elements.clawMachine.classList.remove('show-overlay');
      if (!document.querySelector('.selected')) {
        elements.collectionArrow.classList.remove('active');
      }
      
      // Check for victory
      if (gameState.collectedCount === CONFIG.TOTAL_TOYS) {
        showVictoryScreen();
      }
    }, 1000);
  }
  
  /**
   * Sets rotation angle based on claw position
   */
  setRotationAngle() {
    const angle = radToDeg(
      Math.atan2(
        this.y + this.h / 2 - this.clawPos.y,
        this.x + this.w / 2 - this.clawPos.x
      )
    ) - 90;
    
    const normalized = Math.round(normalizeAngle(angle));
    this.angle = normalized < 180 ? normalized * -1 : 360 - normalized;
    this.el.style.setProperty('--rotate-angle', `${this.angle}deg`);
  }
}

// ============================================
// GAME INITIALIZATION
// ============================================

// Set shadow position
elements.box.style.setProperty('--shadow-pos', `${dimensions.maxArmLength}px`);

// Create game objects
const armJoint = new WorldObject({ className: 'arm-joint' });
const vertRail = new WorldObject({ className: 'vert', linkedObjects: [null, armJoint] });
const arm = new WorldObject({ className: 'arm' });

// Initial shadow scale
armJoint.updateShadowScale();

// ============================================
// GAME FUNCTIONS
// ============================================

/**
 * Finds the closest toy to the claw
 */
function findClosestToy() {
  const claw = {
    y: armJoint.y + dimensions.maxArmLength + CONFIG.MACHINE_BUFFER.y + 7,
    x: armJoint.x + 7,
    w: 40,
    h: 32,
  };
  
  const overlapping = elements.toys.filter((toy) => doRectsOverlap(toy, claw));
  
  if (overlapping.length) {
    const toy = overlapping.sort((a, b) => b.index - a.index)[0];
    toy.setTransformOrigin({ x: claw.x - toy.x, y: claw.y - toy.y });
    toy.setClawPosition({ x: claw.x, y: claw.y });
    gameState.targetToy = toy;
  }
}

/**
 * Activates horizontal button
 */
function activateHorizontalButton() {
  horiBtn.activate();
  [vertRail, armJoint, arm].forEach((obj) => (obj.interval = null));
}

/**
 * Stops horizontal movement and activates vertical button
 */
function switchToVerticalControl() {
  armJoint.interval = null;
  horiBtn.deactivate();
  vertBtn.activate();
}

/**
 * Grabs the targeted toy
 */
function grabToy() {
  if (gameState.targetToy) {
    [vertRail, armJoint, arm].forEach((obj) => {
      obj.linkedObjects[0] = gameState.targetToy;
    });
    gameState.targetToy.setRotationAngle();
    gameState.targetToy.el.classList.add('grabbed');
  } else {
    arm.el.classList.add('missed');
  }
}

/**
 * Drops the toy and resets
 */
function dropToy() {
  arm.el.classList.add('open');
  
  if (gameState.targetToy) {
    gameState.targetToy.z = 3;
    gameState.targetToy.move({
      axis: 'y',
      target: dimensions.machineHeight - gameState.targetToy.h - 30,
      speed: CONFIG.FAST_MOVE_SPEED,
    });
    [vertRail, armJoint, arm].forEach((obj) => (obj.linkedObjects[0] = null));
  }
  
  setTimeout(() => {
    arm.el.classList.remove('open');
    activateHorizontalButton();
    
    if (gameState.targetToy) {
      gameState.targetToy.el.classList.add('selected');
      elements.collectionArrow.classList.add('active');
      gameState.targetToy = null;
    }
  }, CONFIG.DROP_DELAY);
}

/**
 * Executes the grab sequence
 */
function executeGrabSequence() {
  clearInterval(armJoint.interval);
  vertBtn.deactivate();
  findClosestToy();
  
  setTimeout(() => {
    arm.el.classList.add('open');
    arm.move({
      axis: 'h',
      target: dimensions.maxArmLength,
      onComplete: () => {
        setTimeout(() => {
          arm.el.classList.remove('open');
          grabToy();
          arm.resumeMove({
            axis: 'h',
            onComplete: () => {
              vertRail.resumeMove({
                axis: 'x',
                onComplete: () => {
                  armJoint.resumeMove({
                    axis: 'y',
                    onComplete: dropToy,
                  });
                },
              });
            },
          });
        }, CONFIG.GRAB_DELAY);
      },
    });
  }, CONFIG.GRAB_DELAY);
}

// ============================================
// CREATE BUTTONS
// ============================================

const horiBtn = new Button({
  className: 'hori-btn',
  isLocked: true,
  onPress: () => {
    arm.el.classList.remove('missed');
    vertRail.move({
      axis: 'x',
      target: dimensions.machineWidth - armJoint.w - CONFIG.MACHINE_BUFFER.x,
      onComplete: switchToVerticalControl,
    });
  },
  onRelease: () => {
    clearInterval(vertRail.interval);
    switchToVerticalControl();
  },
});

const vertBtn = new Button({
  className: 'vert-btn',
  isLocked: true,
  onPress: () => {
    if (vertBtn.isLocked) return;
    armJoint.move({
      axis: 'y',
      target: CONFIG.MACHINE_BUFFER.y,
    });
  },
  onRelease: executeGrabSequence,
});

// ============================================
// CREATE TOYS
// ============================================

for (let i = 0; i < 12; i++) {
  if (i === CONFIG.SKIP_INDEX) continue;
  new Toy({ index: i });
}

// ============================================
// INITIAL ANIMATION
// ============================================

armJoint.move({
  axis: 'y',
  target: dimensions.machineTopHeight - CONFIG.MACHINE_BUFFER.y,
  speed: CONFIG.FAST_MOVE_SPEED,
  onComplete: () => {
    vertRail.resumeMove({
      axis: 'x',
      target: CONFIG.MACHINE_BUFFER.x,
      speed: CONFIG.FAST_MOVE_SPEED,
      onComplete: () => {
        // Set new default positions
        Object.assign(armJoint.defaultValues, {
          y: dimensions.machineTopHeight - CONFIG.MACHINE_BUFFER.y,
          x: CONFIG.MACHINE_BUFFER.x,
        });
        Object.assign(vertRail.defaultValues, {
          x: CONFIG.MACHINE_BUFFER.x,
        });
        
        // Activate game
        activateHorizontalButton();
      },
    });
  },
});

// ============================================
// KEYBOARD SUPPORT (Accessibility)
// ============================================

document.addEventListener('keydown', (e) => {
  // Prevent repeat events when key is held down
  if (e.repeat) return;
  
  if (e.key === 'ArrowRight' || e.key === 'd') {
    if (!horiBtn.isLocked) {
      horiBtn.onPress();
    }
  }
  if (e.key === 'ArrowUp' || e.key === 'w') {
    if (!vertBtn.isLocked) {
      vertBtn.onPress();
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'd') {
    if (!horiBtn.isLocked) {
      horiBtn.onRelease();
    }
  }
  if (e.key === 'ArrowUp' || e.key === 'w') {
    if (!vertBtn.isLocked) {
      vertBtn.onRelease();
    }
  }
});

// Log game ready
console.log('🎮 Claw Machine Game Ready!');
console.log('Controls: Arrow Right / D = Move | Arrow Up / W = Grab');
