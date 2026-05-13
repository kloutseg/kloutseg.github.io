import { build } from 'esbuild';

await build({
  bundle: true,
  entryPoints: ['src/scripts/partners-page.js'],
  format: 'esm',
  logLevel: 'info',
  minify: true,
  outfile: 'public/scripts/partners-page.js',
  sourcemap: false,
  splitting: false,
  target: ['es2020'],
});
