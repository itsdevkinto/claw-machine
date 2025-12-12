# 🎮 Claw Machine Game

A retro pixel art claw machine arcade game built with vanilla JavaScript. Experience the nostalgic thrill of the classic arcade claw machine right in your browser!

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Authentic Claw Mechanics**: Realistic claw movement with horizontal and vertical controls
- **Pixel Art Graphics**: Beautiful retro-styled visuals with custom color palette
- **6 Unique Toys**: Collect bears, bunnies, golems, cucumbers, penguins, and robots
- **Victory Celebration**: Confetti animation and victory melody when you collect all toys
- **Keyboard Support**: Full keyboard controls for accessibility (Arrow keys or WASD)
- **Responsive Design**: Works on desktop and tablet devices
- **Sound Effects**: Web Audio API powered victory sound
- **Arcade Background**: Animated arcade studio environment with a mascot cat

## Live Demo

[🎮 View Live Demo](https://serkanbyx.github.io/claw-machine/)

## Technologies

- **HTML5**: Semantic and accessible markup with ARIA labels
- **CSS3**: Modern CSS features, animations, custom properties, and pixel art styling
- **Vanilla JavaScript (ES6+)**: Classes, modules, async/await, and modern syntax
- **Web Audio API**: Dynamic sound generation for victory melody
- **CSS Animations**: Smooth transitions, confetti effects, and pulsing animations

## Installation

### Local Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Serkanbyx/claw-machine.git
   cd claw-machine
   ```

2. **Open with a local server**:

   Using Python:

   ```bash
   # Python 3
   python -m http.server 8000
   ```

   Using Node.js:

   ```bash
   npx serve
   ```

   Using VS Code:

   - Install "Live Server" extension
   - Right-click on `index.html` → "Open with Live Server"

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

## Usage

1. **Start the game** by pressing the **right arrow button** (or Arrow Right / D key)
2. **Move the claw** horizontally by holding the button - release to stop
3. **Lower the claw** by pressing the **up arrow button** (or Arrow Up / W key)
4. **Release the button** to grab and lift the toy
5. **Click on collected toys** in the drop zone to add them to your collection
6. **Collect all 11 toys** to trigger the victory celebration!

### Controls

| Action      | Mouse/Touch                     | Keyboard        |
| ----------- | ------------------------------- | --------------- |
| Move Right  | Hold right button               | Arrow Right / D |
| Grab        | Hold up button, release to grab | Arrow Up / W    |
| Collect Toy | Click on dropped toy            | Click           |

## How It Works?

### Claw Movement System

The claw operates on a rail system with linked objects:

```javascript
const vertRail = new WorldObject({
  className: "vert",
  linkedObjects: [null, armJoint],
});
```

### Collision Detection

Toys are detected using rectangle overlap:

```javascript
const doRectsOverlap = (rectA, rectB) => {
  return (
    rectB.x > rectA.x &&
    rectB.x < rectA.x + rectA.w &&
    rectB.y > rectA.y &&
    rectB.y < rectA.y + rectA.h
  );
};
```

### Victory Sound Generation

Victory melody is generated using Web Audio API oscillators:

```javascript
const melody = [
  { freq: 523.25, duration: 0.15 }, // C5
  { freq: 659.25, duration: 0.15 }, // E5
  { freq: 783.99, duration: 0.15 }, // G5
  { freq: 1046.5, duration: 0.3 }, // C6
];
```

## Customization

### Change Color Palette

Edit the CSS custom properties in `css/styles.css`:

```css
:root {
  --color-background: #fff8dc;
  --color-machine: #face68;
  --color-blue: #5a9cb5;
  --color-dark-blue: #faac68;
}
```

### Add New Toy Types

1. Add toy definition in `js/main.js`:

   ```javascript
   const toyTypes = {
     // existing toys...
     newToy: { w: 20 * CONFIG.SCALE, h: 28 * CONFIG.SCALE },
   };
   ```

2. Add toy styles in `css/styles.css`:
   ```css
   .toy.newToy::after {
     background-image: url(data:image/png;base64,...);
   }
   ```

### Modify Game Speed

Adjust timing in `js/main.js`:

```javascript
const CONFIG = {
  MOVE_SPEED: 100, // Movement interval (ms)
  FAST_MOVE_SPEED: 50, // Fast movement (ms)
  GRAB_DELAY: 500, // Grab delay (ms)
  DROP_DELAY: 700, // Drop delay (ms)
};
```

## Project Structure

```
claw-machine/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Main game styles
│   ├── background.css  # Arcade background styles
│   └── victory.css     # Victory screen styles
├── js/
│   ├── main.js         # Main game logic
│   └── victory.js      # Victory system
└── README.md           # Documentation
```

## Features in Detail

### Completed Features

- ✅ Fully functional claw machine mechanics
- ✅ 6 unique collectible toys
- ✅ Victory screen with confetti animation
- ✅ Web Audio API victory sound
- ✅ Keyboard accessibility support
- ✅ Responsive pixel art design
- ✅ Arcade studio background with mascot cat
- ✅ Custom color palette theming

### Future Features

- [ ] Mobile touch optimization
- [ ] Difficulty levels
- [ ] Score/timer system
- [ ] Local storage for high scores
- [ ] More toy varieties
- [ ] Background music toggle

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` CSS/styling changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Developer

**Serkanby**

- 🌐 Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- 💻 GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- 📧 Email: serkanbyx1@gmail.com

## Acknowledgments

- Inspired by classic arcade claw machine games
- Pixel art style influenced by retro gaming aesthetics
- Built as part of GitHub Bootcamp project

## Contact

- 🐛 Found a bug? [Open an issue](https://github.com/Serkanbyx/claw-machine/issues)
- 📧 Email: serkanbyx1@gmail.com
- 🌐 Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
