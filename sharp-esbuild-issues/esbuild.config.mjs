import { build } from 'esbuild';

await build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'build/app.cjs',
  external: ['sharp'],
});

console.log('bundled to build/app.cjs (sharp left external)');
