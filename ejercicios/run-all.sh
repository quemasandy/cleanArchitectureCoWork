#!/bin/bash
# ============================================================================
# Ejecuta TODOS los 24 ejemplos (12 bad + 12 good) y reporta resultados
# ============================================================================

echo "🏗️  keyCode - Ejecutando TODOS los ejemplos de Clean Architecture"
echo "================================================================="
echo ""

PASS=0
FAIL=0
ERRORS=""

CONCEPTS=(
  "01-srp"
  "02-ocp"
  "03-lsp"
  "04-isp"
  "05-dip"
  "06-component-cohesion"
  "07-component-coupling"
  "08-dependency-rule"
  "09-business-rules"
  "10-boundaries"
  "11-screaming-architecture"
  "12-details"
)

for concept in "${CONCEPTS[@]}"; do
  for type in "bad" "good"; do
    FILE="${concept}/${type}/main.ts"
    ICON=$( [ "$type" = "bad" ] && echo "❌" || echo "✅" )

    echo "─── ${ICON} ${concept}/${type} ────────────────────────────"

    if npx ts-node "$FILE" 2>&1; then
      PASS=$((PASS + 1))
      echo ""
      echo "  ✅ ÉXITO"
    else
      FAIL=$((FAIL + 1))
      ERRORS="${ERRORS}\n  💥 ${FILE}"
      echo ""
      echo "  💥 FALLÓ"
    fi

    echo ""
  done
done

echo "================================================================="
echo "📊 RESULTADOS: ${PASS} pasaron, ${FAIL} fallaron (de 24 total)"
if [ $FAIL -gt 0 ]; then
  echo -e "\n💥 Errores:${ERRORS}"
fi
echo "================================================================="
