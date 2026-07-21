import * as mobx from 'mobx';
import * as G from '../game';
import foods from '../../data/out/foods.js';
import recentGears from '../../data/out/gears-recent.js';
import gearGroupsData from '../../data/out/gearGroups.js';
import gearGroupBasisData from '../../data/out/gearGroupBasis.js';

export const gearData = mobx.observable.map<G.GearId, G.GearBase>({}, { deep: false });
mobx.runInAction(() => {
  for (const item of foods as unknown as G.GearBase[]) {
    gearData.set(item.id, item);
  }
  for (const item of recentGears as unknown as G.GearBase[]) {
    gearData.set(item.id, item);
  }
});

const gearDataModules = import.meta.glob<{ default: G.GearBase[] }>([
  '../../data/out/gears-*.js',
  '!../../data/out/gears-recent.js',
]);

const gearDataLoadStatus = mobx.observable.map<string | number, 'loading' | 'finished'>({});  // TODO: handle failures
export const gearDataLoading = mobx.computed(() => {
  for (const status of gearDataLoadStatus.values()) {
    if (status === 'loading') return true;
  }
  return false;
});

export const loadGearData = async (groupId: string | number) => {
  if (groupId === undefined || gearDataLoadStatus.has(groupId)) return;
  mobx.runInAction(() => gearDataLoadStatus.set(groupId, 'loading'));
  const load = gearDataModules[`../../data/out/gears-${groupId}.js`];
  if (load === undefined) throw new Error(`Unknown gear data group: ${groupId}`);
  const data = (await load()).default;
  console.debug(`Load gears-${groupId}.`);
  mobx.runInAction(() => {
    for (const item of data) {
      if (!gearData.has(item.id)) {
        gearData.set(item.id, item);
      }
    }
    gearDataLoadStatus.set(groupId, 'finished');
  });
};

const gearGroups = gearGroupsData as number[];
export const loadGearDataOfGearId = (gearId: G.GearId) => loadGearData(gearGroups[gearId]);

const gearGroupBasis = gearGroupBasisData as number[];
export const loadGearDataOfLevelRange = (minLevel: number, maxLevel: number) => {
  let i = 0;
  while (gearGroupBasis[i + 1] <= minLevel) i++;
  while (gearGroupBasis[i] <= maxLevel) {
    loadGearData(gearGroupBasis[i]);
    i++;
  }
};
gearDataLoadStatus.set(gearGroupBasis[gearGroupBasis.length - 1], 'finished');

export const gearDataOrdered = mobx.observable.box([] as G.GearBase[], { deep: false });
mobx.autorun(() => {
  if (!gearDataLoading.get()) {
    mobx.runInAction(() => {
      gearDataOrdered.set(Array.from(gearData.values()).sort((a, b) => {
        const k = a.level - b.level;
        return k !== 0 ? k : a.id - b.id;
      }));
    });
  }
});
