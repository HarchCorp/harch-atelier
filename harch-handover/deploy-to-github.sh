#!/usr/bin/env bash
# ============================================================================
# Harch Atelier V16 — Déploiement vers GitHub (à exécuter sur VOTRE machine)
# ============================================================================
#
# Ce script copie les fichiers V12→V16 depuis l'archive harch-v16-src.tar.gz
# vers votre repo local HarchCorp, installe les dépendances manquantes,
# vérifie le build TypeScript, puis vous laisse faire le commit + push.
#
# ⚠️  EXÉCUTEZ CECI VOUS-MÊME sur votre machine. N'utilisez JAMAIS un token
#     GitHub fourni dans un prompt LLM — traitez tout token partagé comme
#     compromis et révoquez-le sur github.com/settings/tokens.
#
# PRÉREQUIS :
#   - Vous avez cloné https://github.com/HarchCorp/harch-corp localement
#   - Vous avez l'archive harch-v16-src.tar.gz à côté de ce script
#   - Node 18+ et npm/bun installés
#
# USAGE :
#   chmod +x deploy-to-github.sh
#   ./deploy-to-github.sh /chemin/vers/harch-corp
# ============================================================================

set -euo pipefail

REPO_DIR="${1:-}"
ARCHIVE="harch-v16-src.tar.gz"

if [ -z "$REPO_DIR" ]; then
  echo "Usage: $0 <chemin-vers-le-repo-harch-corp>"
  echo "Exemple: $0 ~/projects/harch-corp"
  exit 1
fi

if [ ! -d "$REPO_DIR" ]; then
  echo "❌ Le dossier '$REPO_DIR' n'existe pas."
  echo "   Clonez d'abord : git clone https://github.com/HarchCorp/harch-corp.git"
  exit 1
fi

if [ ! -f "$ARCHIVE" ]; then
  echo "❌ Archive '$ARCHIVE' introuvable dans le dossier courant."
  echo "   Placez ce script et l'archive dans le même dossier."
  exit 1
fi

echo "📦 Déploiement Harch Atelier V16 vers : $REPO_DIR"
echo ""

# 1. Extraire l'archive dans un dossier temporaire
TMP_DIR=$(mktemp -d)
echo "1/5  Extraction de l'archive vers $TMP_DIR ..."
tar -xzf "$ARCHIVE" -C "$TMP_DIR"

# 2. Copier les fichiers vers le repo (en préservant la structure)
echo "2/5  Copie des fichiers source vers le repo..."
mkdir -p "$REPO_DIR/src/components/dataviz" \
         "$REPO_DIR/src/components/dashboard" \
         "$REPO_DIR/src/hooks" \
         "$REPO_DIR/src/lib" \
         "$REPO_DIR/src/app" \
         "$REPO_DIR/mini-services/signal-pulse"

cp -r "$TMP_DIR/src/components/dataviz/." "$REPO_DIR/src/components/dataviz/"
cp -r "$TMP_DIR/src/components/dashboard/." "$REPO_DIR/src/components/dashboard/"
cp "$TMP_DIR/src/components/theme-provider.tsx" "$REPO_DIR/src/components/" 2>/dev/null || true
cp "$TMP_DIR/src/hooks/use-signal-pulse.ts" "$REPO_DIR/src/hooks/"
cp "$TMP_DIR/src/lib/mock-data.ts" "$REPO_DIR/src/lib/"
cp "$TMP_DIR/src/lib/risk-store.ts" "$REPO_DIR/src/lib/"
cp "$TMP_DIR/src/lib/csv-export.ts" "$REPO_DIR/src/lib/"
cp "$TMP_DIR/src/app/page.tsx" "$REPO_DIR/src/app/"
cp "$TMP_DIR/src/app/layout.tsx" "$REPO_DIR/src/app/"
cp "$TMP_DIR/src/app/globals.css" "$REPO_DIR/src/app/"
cp "$TMP_DIR/next.config.ts" "$REPO_DIR/" 2>/dev/null || echo "   (next.config.ts — vérifiez manuellement si vous avez déjà des options custom)"
cp "$TMP_DIR/mini-services/signal-pulse/index.ts" "$REPO_DIR/mini-services/signal-pulse/"
cp "$TMP_DIR/mini-services/signal-pulse/package.json" "$REPO_DIR/mini-services/signal-pulse/"
cp "$TMP_DIR/mini-services/signal-pulse/tsconfig.json" "$REPO_DIR/mini-services/signal-pulse/" 2>/dev/null || true

rm -rf "$TMP_DIR"
echo "   ✅ Fichiers copiés."

# 3. Installer les dépendances manquantes dans le repo principal
echo "3/5  Installation des dépendances manquantes dans le repo principal..."
cd "$REPO_DIR"
PKG_MGR=""
if command -v bun >/dev/null 2>&1; then
  PKG_MGR="bun add"
elif command -v npm >/dev/null 2>&1; then
  PKG_MGR="npm install"
else
  echo "   ⚠️  Ni bun ni npm trouvé. Installez les deps manuellement."
fi

if [ -n "$PKG_MGR" ]; then
  # Vérifier chaque dépendance avant de l'ajouter (évite les doublons)
  for dep in recharts lucide-react next-themes zustand cmdk sonner socket.io-client date-fns; do
    if ! grep -q "\"$dep\"" package.json 2>/dev/null; then
      echo "   + $dep"
      $PKG_MGR "$dep" 2>/dev/null || echo "   ⚠️  échec install $dep — vérifiez manuellement"
    else
      echo "   ✓ $dep déjà présent"
    fi
  done
fi

# 4. Installer les deps du mini-service
echo "4/5  Installation des dépendances du mini-service signal-pulse..."
if [ -d "mini-services/signal-pulse" ]; then
  cd mini-services/signal-pulse
  if command -v bun >/dev/null 2>&1; then
    bun install 2>/dev/null || echo "   ⚠️  bun install échoué pour le mini-service"
  elif command -v npm >/dev/null 2>&1; then
    npm install 2>/dev/null || echo "   ⚠️  npm install échoué pour le mini-service"
  fi
  cd "$REPO_DIR"
fi

# 5. Vérification TypeScript
echo "5/5  Vérification TypeScript..."
if command -v npx >/dev/null 2>&1; then
  if npx tsc --noEmit 2>&1 | head -20; then
    echo "   ✅ Build TypeScript OK"
  else
    echo "   ⚠️  Erreurs TypeScript détectées — voir ci-dessus."
    echo "   (Les erreurs dans des dossiers pré-existants comme examples/ peuvent être ignorées.)"
  fi
fi

echo ""
echo "============================================================================"
echo "✅ Transfert terminé. Prochaines étapes (à exécuter VOUS-MÊME) :"
echo "============================================================================"
echo ""
echo "  cd $REPO_DIR"
echo "  git status                          # vérifiez les fichiers modifiés"
echo "  git add ."
echo "  git commit -m \"feat: V16 Enterprise Risk Intelligence UI"
echo "    - 9 dataviz widgets (RiskMatrix, ShareOfVoice, MediaCoverage,"
echo "      SentimentTrend, RiskPillars, TopSources, GeoDistribution,"
echo "      RiskTrendTimeline, RiskEventsTable)"
echo "    - Premium Light Fintech theme + dark mode (next-themes)"
echo "    - Zustand store with localStorage persistence"
echo "    - Command palette (Cmd+K) + keyboard shortcuts"
echo "    - Bulk select, CSV export, saved views"
echo "    - Live signal-pulse websocket mini-service (port 3003)"
echo "    - Risk event drawer with GLM-4 synthesis\""
echo "  git push origin main"
echo ""
echo "  # Puis démarrez le mini-service signal-pulse séparément :"
echo "  cd mini-services/signal-pulse && bun run dev &"
echo ""
echo "⚠️  SÉCURITÉ :"
echo "  - N'utilisez JAMAIS un token GitHub fourni dans un prompt LLM."
echo "  - Si un token a circulé dans une conversation, révoquez-le sur"
echo "    github.com/settings/tokens et générez-en un nouveau via gh auth login"
echo "    ou via les Secrets GitHub."
echo "============================================================================"
