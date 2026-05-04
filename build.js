const fs = require('fs');
const path = require('path');

const sections = [
  'nav',
  'hero',
  'about',
  'skills',
  'projects',
  'experience',
  'contact',
];

const body = sections
  .map(name => fs.readFileSync(path.join(__dirname, 'sections', `${name}.html`), 'utf8').trimEnd())
  .join('\n\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Adens Archive — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

<canvas id="bg-canvas"></canvas>

${body}

<footer>
  <span>© 2026 Aden Brady · Built with HTML & CSS</span>
</footer>

<script src="bg-animation.js"></script>
<script src="main.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Built index.html from', sections.length, 'sections.');
