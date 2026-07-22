// ===========================================================
// Garde-fou : cohérence nav / footer entre les 3 pages HTML
// (règle CLAUDE.md : "tout changement de nav/footer se répercute
//  dans les 3 fichiers"). Appelé en hook PostToolUse après Edit/Write.
//
// Implémentation de RÉFÉRENCE (Node). Un miroir Python existe
// (check-nav-consistency.py) — si tu modifies l'une, modifie l'autre.
//
// Entrée : JSON du hook sur stdin (contient tool_input.file_path).
// Sortie : exit 0 = cohérent / non concerné ; exit 2 = divergence
//          (le message stderr est remonté à Claude pour correction).
// ===========================================================
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const PAGES = ['index.html', 'projets.html', 'experiences.html'];

// --- 1. Lire l'entrée du hook (tolérant : exécution manuelle possible) ---
let hook = {};
try { hook = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { /* pas de stdin */ }
const editedPath = hook?.tool_input?.file_path || '';

// Ne se déclenche que si le fichier édité est l'une des 3 pages.
if (editedPath && !PAGES.includes(basename(editedPath))) process.exit(0);

// --- 2. Racine du repo : env du hook, sinon dossier du fichier édité, sinon cwd ---
const root = process.env.CLAUDE_PROJECT_DIR
  || (editedPath ? dirname(editedPath) : process.cwd());

// --- 3. Extraction ---
const stripTags = (s) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function extract(html) {
  const nav = (html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i) || [, ''])[1];
  const logo = stripTags((nav.match(/<a\b[^>]*class="[^"]*nav-logo[^"]*"[^>]*>([\s\S]*?)<\/a>/i) || [, ''])[1]);
  const linksBlock = (nav.match(/<ul\b[^>]*class="[^"]*nav-links[^"]*"[^>]*>([\s\S]*?)<\/ul>/i) || [, ''])[1];
  const labels = [...linksBlock.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map(m => stripTags(m[1]));
  const footer = stripTags((html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i) || [, ''])[1]);
  return { logo, labels, footer };
}

// --- 4. Lire les 3 pages ---
const data = {};
for (const p of PAGES) {
  try { data[p] = extract(readFileSync(join(root, p), 'utf8')); }
  catch { process.exit(0); } // une page manque -> pas de comparaison possible
}

// --- 5. Comparer par rapport à index.html (référence) ---
const ref = data['index.html'];
const problems = [];
for (const p of PAGES.slice(1)) {
  const d = data[p];
  if (d.logo !== ref.logo)
    problems.push(`- Logo différent dans ${p} : "${d.logo}" vs "${ref.logo}" (index.html)`);
  if (JSON.stringify(d.labels) !== JSON.stringify(ref.labels))
    problems.push(`- Libellés de nav différents dans ${p} :\n    ${p} = [${d.labels.join(', ')}]\n    index.html = [${ref.labels.join(', ')}]`);
  if (d.footer !== ref.footer)
    problems.push(`- Footer différent dans ${p} :\n    ${p} = "${d.footer}"\n    index.html = "${ref.footer}"`);
}

if (problems.length) {
  console.error('[check-nav-consistency] Divergence nav/footer entre les pages (règle CLAUDE.md #2) :\n'
    + problems.join('\n')
    + '\nRépercute le changement de nav/footer dans les 3 fichiers (index.html, projets.html, experiences.html).');
  process.exit(2);
}
process.exit(0);
