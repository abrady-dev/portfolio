const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://banani.dev';

// Formatted as "Month YYYY" for the footer last-updated stamp
const BUILD_DATE = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const sections = [
  'layout-open',
  'hero',
  'about',
  'skills',
  'projects',
  'experience',
  'contact',
  'footer',
  'layout-close',
];

const body = sections
  .map(name => fs.readFileSync(path.join(__dirname, 'sections', `${name}.html`), 'utf8').trimEnd())
  .join('\n\n')
  .replace(/\{\{BUILD_DATE\}\}/g, BUILD_DATE);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aden Brady — Systems &amp; Infrastructure Engineer</title>
  <meta name="description" content="Portfolio of Aden Brady, a systems and infrastructure engineer focused on enterprise IT, virtualization, and cyber defense." />

  <!-- OpenGraph — LinkedIn and general link previews -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/" />
  <meta property="og:title" content="Aden Brady — Systems &amp; Infrastructure Engineer" />
  <meta property="og:description" content="Systems and infrastructure engineer focused on enterprise IT, VMware virtualization, and cyber defense. Currently at the City of Orlando." />
  <meta property="og:image" content="${SITE_URL}/images/4U1A1609.jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

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
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script src="mermaid-init.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Built index.html from', sections.length, 'sections.');
