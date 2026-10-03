import { readFile, writeFile, mkdir } from 'node:fs/promises';
const css = await readFile(new URL('./font-download.css', import.meta.url), 'utf8');
const directory = new URL('../public/fonts/', import.meta.url);
await mkdir(directory, { recursive: true });
let localCSS = css;
for (const block of css.matchAll(/@font-face\s*\{[^}]+\}/g)) {
  const family = /font-family: '([^']+)'/.exec(block[0])[1];
  const weight = /font-weight: (\d+)/.exec(block[0])[1];
  const remote = /url\(([^)]+)\)/.exec(block[0])[1];
  if (new URL(remote).hostname !== 'fonts.gstatic.com') throw Error('Unexpected font host');
  const name = `${family.toLowerCase().replaceAll(' ', '-')}-${weight}.ttf`;
  const response = await fetch(remote); if (!response.ok) throw Error(`Font download failed: ${response.status}`);
  await writeFile(new URL(name, directory), Buffer.from(await response.arrayBuffer()));
  localCSS = localCSS.replace(remote, './' + name);
}
for (const [family, repoPath] of [['outfit', 'outfit'], ['dm-mono', 'dmmono']]) {
  const response = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${repoPath}/OFL.txt`);
  if (!response.ok) throw Error('Font license download failed');
  await writeFile(new URL(`${family}-OFL.txt`, directory), await response.text());
}
await writeFile(new URL('fonts.css', directory), localCSS);
console.log('Downloaded seven font faces and both open-font licenses.');
