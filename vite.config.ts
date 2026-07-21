import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
const patch = /更新游戏数据至(\d+\.\d+)/.exec(changelog)?.[1];
const version = /### `([^`]+)`/.exec(changelog)?.[1];

if (patch === undefined || version === undefined) {
  throw new Error('Could not read the patch and version from CHANGELOG.md.');
}

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __PATCH__: JSON.stringify(patch),
    __VERSION__: JSON.stringify(version),
    __BUILD_DATE__: JSON.stringify(Date.now()),
  },
  build: {
    rollupOptions: {
      input: {
        main: path.join(root, 'index.html'),
        lodestone: path.join(root, 'lodestone.html'),
      },
    },
  },
});
