const fs = require('fs');
const path = require('path');

const sections = [
  'layout-open',
  'hero',
  'about',
  'skills',
  'projects',
  'experience',
  'contact',
  'layout-close',
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
  <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="favicon_io/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="favicon_io/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="favicon_io/apple-touch-icon.png" />
  <link rel="manifest" href="favicon_io/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

<canvas id="bg-canvas"></canvas>

${body}

<script src="bg-animation.js"></script>
<script src="main.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Built index.html from', sections.length, 'sections.');
