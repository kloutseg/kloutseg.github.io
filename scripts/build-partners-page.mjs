import { build } from 'esbuild';

const sharedOptions = {
  bundle: true,
  format: 'esm',
  logLevel: 'info',
  minify: true,
  sourcemap: false,
  splitting: true,
  target: ['es2020'],
};

await build({
  ...sharedOptions,
  entryPoints: ['src/scripts/partners-page.js', 'src/scripts/smooth-scroll.js'],
  outdir: 'public/scripts',
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
});
