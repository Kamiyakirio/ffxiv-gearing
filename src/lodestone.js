import lodestoneIds from '../data/out/lodestoneIds.js';

(async () => {
  const [ region, gearId ] = window.location.search.slice(1).split(':');
  const lodestoneId = lodestoneIds[gearId];
  if (region && lodestoneId !== undefined) {
    window.location.href = `https://${region}.finalfantasyxiv.com/lodestone/playguide/db/item/${lodestoneId}/`;
  } else {
    document.body.innerText = 'Not Found';
  }
})();
