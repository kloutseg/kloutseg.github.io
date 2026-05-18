import { build } from 'esbuild';

const sharedOptions = {
  bundle: true,
  format: 'esm',
  logLevel: 'info',
  minify: true,
  sourcemap: false,
  splitting: false,
  target: ['es2020'],
};

await Promise.all([
  build({
    ...sharedOptions,
    entryPoints: ['src/scripts/partners-page.js'],
    outfile: 'public/scripts/partners-page.js',
  }),
  build({
    ...sharedOptions,
    entryPoints: ['src/scripts/smooth-scroll.js'],
    outfile: 'public/scripts/smooth-scroll.js',
  }),
]);
