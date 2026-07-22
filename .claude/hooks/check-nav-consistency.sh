#!/usr/bin/env bash
# ===========================================================
# Wrapper portable : détecte le runtime disponible (node ou python)
# et lance le check de cohérence nav/footer avec le bon.
# Le JSON du hook (stdin) est transmis tel quel au script choisi.
#
# Portable Git Bash (Windows) / bash (Linux/macOS).
# Ne bloque jamais si aucun runtime n'est trouvé (exit 0).
# ===========================================================
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v node >/dev/null 2>&1; then
  exec node "$DIR/check-nav-consistency.mjs"
elif command -v python3 >/dev/null 2>&1; then
  exec python3 "$DIR/check-nav-consistency.py"
elif command -v python >/dev/null 2>&1; then
  exec python "$DIR/check-nav-consistency.py"
elif command -v py >/dev/null 2>&1; then
  exec py "$DIR/check-nav-consistency.py"
else
  echo "[check-nav-consistency] ni node ni python trouvé — check sauté" >&2
  exit 0
fi
