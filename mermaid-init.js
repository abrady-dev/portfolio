/**
 * Mermaid diagram initialization. Theme-aware: re-renders diagrams whenever
 * the user toggles dark/light mode. Runs synchronously at bottom of body,
 * after the mermaid CDN script has loaded.
 */

function getMermaidCfg() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const vars = dark ? {
    background: '#111318',
    mainBkg: '#1c2030',
    nodeBorder: '#2a4a6a',
    primaryColor: '#1a2a40',
    primaryTextColor: '#e2e0dc',
    primaryBorderColor: '#2a4a6a',
    lineColor: '#5b9bd5',
    secondaryColor: '#14171f',
    tertiaryColor: '#1c2030',
    clusterBkg: '#14171f',
    clusterBorder: '#252839',
    titleColor: '#e2e0dc',
    edgeLabelBackground: '#1c2030',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  } : {
    background: '#f0ede7',
    mainBkg: '#f0ede7',
    nodeBorder: '#c2d8ed',
    primaryColor: '#dce8f4',
    primaryTextColor: '#1a1a1a',
    primaryBorderColor: '#c2d8ed',
    lineColor: '#2c5f8a',
    secondaryColor: '#e8e5df',
    tertiaryColor: '#f0ede7',
    clusterBkg: '#e8e5df',
    clusterBorder: '#d2cfc8',
    titleColor: '#1a1a1a',
    edgeLabelBackground: '#f0ede7',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  };

  return {
    startOnLoad: false,
    theme: 'base',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 12,
    flowchart: { curve: 'basis', htmlLabels: false, padding: 18 },
    themeVariables: vars,
  };
}

// Preserve original diagram source before mermaid replaces the element with SVG
function cacheSrc() {
  document.querySelectorAll('pre.mermaid').forEach(el => {
    if (!el.dataset.src) {
      el.dataset.src = el.textContent.trim();
    }
  });
}

// Restore raw diagram text so mermaid can re-process on theme change
function restoreSrc() {
  document.querySelectorAll('pre.mermaid').forEach(el => {
    if (el.dataset.src) {
      el.textContent = el.dataset.src;
      el.removeAttribute('data-processed');
    }
  });
}

function renderDiagrams() {
  restoreSrc();
  mermaid.initialize(getMermaidCfg());
  mermaid.run().catch(() => {});
}

cacheSrc();
renderDiagrams();

// Re-render with the new palette after each theme toggle
document.querySelectorAll('.theme-toggle').forEach(btn => {
  btn.addEventListener('click', () => setTimeout(renderDiagrams, 50));
});
