import { cp, mkdir, rm, readFile, readdir, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

for (const path of ['index.html', 'src', 'public', 'docs', 'LICENSE']) {
  await cp(path, `dist/${path}`, { recursive: true });
}

const html = await readFile('index.html', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const mark = 'data:image/svg+xml,' + encodeURIComponent(await readFile('public/mark.svg', 'utf8'));

const docFiles = (await readdir('docs')).filter(f => f.endsWith('.md'));
const docs = Object.fromEntries(
  await Promise.all(docFiles.map(async f => [f, await readFile(`docs/${f}`, 'utf8')]))
);

const domain = (await readFile('src/domain.js', 'utf8')).replace(/^export /gm, '');
const app = (await readFile('src/app.js', 'utf8'))
  .replace(/^import .*\n/, '')
  .replaceAll('./public/mark.svg', mark);

const bundled = `window.EMERGENCE_DOCS = ${JSON.stringify(docs).replaceAll('<', '\\u003c')};\n${domain}\n${app}`;

const offline = html
  .replace('<link rel="stylesheet" href="./src/styles.css">', `<style>${css}</style>`)
  .replace('./public/mark.svg', mark)
  .replace(
    '<script type="module" src="./src/app.js"></script>',
    `<script type="module">${bundled.replaceAll('</script', '<\\/script')}</script>`
  );

await writeFile('dist/google-emergence.html', offline);
await writeFile('dist/emergence.html', offline);

console.log('Built Google Emergence modular site and standalone offline distribution → dist/.');
