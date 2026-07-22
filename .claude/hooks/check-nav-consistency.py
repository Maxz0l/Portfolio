# ===========================================================
# Garde-fou : cohérence nav / footer entre les 3 pages HTML.
# Miroir de check-nav-consistency.mjs (Node = référence).
# Si tu modifies l'un, modifie l'autre.
#
# Entrée : JSON du hook sur stdin (tool_input.file_path).
# Sortie : exit 0 = cohérent / non concerné ; exit 2 = divergence.
# ===========================================================
import sys, os, json, re

PAGES = ['index.html', 'projets.html', 'experiences.html']

# --- 1. Entrée du hook (tolérant à une exécution manuelle) ---
try:
    hook = json.loads(sys.stdin.read() or '{}')
except Exception:
    hook = {}
edited = (hook.get('tool_input') or {}).get('file_path', '')

if edited and os.path.basename(edited) not in PAGES:
    sys.exit(0)

# --- 2. Racine du repo ---
root = os.environ.get('CLAUDE_PROJECT_DIR') \
    or (os.path.dirname(edited) if edited else os.getcwd())

# --- 3. Extraction ---
def strip_tags(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', s)).strip()

def extract(html):
    nav = (re.search(r'<nav\b[^>]*>([\s\S]*?)</nav>', html, re.I) or [None, ''])
    nav = nav.group(1) if hasattr(nav, 'group') else ''
    logo_m = re.search(r'<a\b[^>]*class="[^"]*nav-logo[^"]*"[^>]*>([\s\S]*?)</a>', nav, re.I)
    logo = strip_tags(logo_m.group(1)) if logo_m else ''
    links_m = re.search(r'<ul\b[^>]*class="[^"]*nav-links[^"]*"[^>]*>([\s\S]*?)</ul>', nav, re.I)
    links = links_m.group(1) if links_m else ''
    labels = [strip_tags(m) for m in re.findall(r'<a\b[^>]*>([\s\S]*?)</a>', links, re.I)]
    foot_m = re.search(r'<footer\b[^>]*>([\s\S]*?)</footer>', html, re.I)
    footer = strip_tags(foot_m.group(1)) if foot_m else ''
    return {'logo': logo, 'labels': labels, 'footer': footer}

# --- 4. Lire les 3 pages ---
data = {}
for p in PAGES:
    try:
        with open(os.path.join(root, p), encoding='utf-8') as f:
            data[p] = extract(f.read())
    except Exception:
        sys.exit(0)

# --- 5. Comparer par rapport à index.html ---
ref = data['index.html']
problems = []
for p in PAGES[1:]:
    d = data[p]
    if d['logo'] != ref['logo']:
        problems.append(f'- Logo différent dans {p} : "{d["logo"]}" vs "{ref["logo"]}" (index.html)')
    if d['labels'] != ref['labels']:
        problems.append(f'- Libellés de nav différents dans {p} :\n    {p} = {d["labels"]}\n    index.html = {ref["labels"]}')
    if d['footer'] != ref['footer']:
        problems.append(f'- Footer différent dans {p} :\n    {p} = "{d["footer"]}"\n    index.html = "{ref["footer"]}"')

if problems:
    sys.stderr.write('[check-nav-consistency] Divergence nav/footer entre les pages (règle CLAUDE.md #2) :\n'
                     + '\n'.join(problems)
                     + '\nRépercute le changement de nav/footer dans les 3 fichiers.\n')
    sys.exit(2)
sys.exit(0)
