import * as React from 'react';

const icons = import.meta.glob<string>('../../../img/**/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const iconViewBoxes = new Map<string, string>();
const domParser = new DOMParser();
function loadIcon(name: string) {
  let viewBox = iconViewBoxes.get(name);
  if (viewBox === undefined) {
    const svgString = icons[`../../../img/${name}.svg`];
    if (svgString === undefined) throw new Error(`Unknown icon: ${name}`);
    const svgEl = domParser.parseFromString(svgString, 'image/svg+xml').documentElement;
    viewBox = svgEl.getAttribute('viewBox') ?? '';
    iconViewBoxes.set(name, viewBox);
    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    for (const attribute of svgEl.attributes) {
      if (attribute.name !== 'width' && attribute.name !== 'height') {
        symbol.setAttribute(attribute.name, attribute.value);
      }
    }
    symbol.setAttribute('id', name);
    symbol.innerHTML = svgEl.innerHTML;
    let root = document.getElementById('svg-sprites');
    if (root === null) {
      root = document.createElement('svg');
      root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      root.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      root.setAttribute('id', 'svg-sprites');
      root.style.display = 'none';
      document.body.prepend(root);
    }
    root.appendChild(symbol);
  }
  return viewBox;
}

export const Icon = React.memo<{ className?: string, name: string }>(({ className, name }) => {
  const viewBox = loadIcon(name);
  return (
    <svg className={className} viewBox={viewBox}>
      <use href={'#' + name} />
    </svg>
  );
});
