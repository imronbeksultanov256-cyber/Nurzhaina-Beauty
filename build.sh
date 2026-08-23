#!/usr/bin/env bash
# ============================================================
# NURZHANA BEAUTY — сборка страниц
# Вставляет _partials/header.html и _partials/footer.html
# во все *.html. Скрипт идемпотентный: можно запускать сколько угодно раз.
#
# Запуск:  bash build.sh
# ============================================================
set -e
cd "$(dirname "$0")"

for f in *.html; do
  awk '
    BEGIN{
      while((getline line < "_partials/header.html")>0) hdr = hdr line "\n"
      close("_partials/header.html")
      while((getline line < "_partials/footer.html")>0) ftr = ftr line "\n"
      close("_partials/footer.html")
    }
    /<!--HEADER:START-->/ { skip=1; print "<!--HEADER:START-->"; printf "%s", hdr; next }
    /<!--HEADER:END-->/   { skip=0; print "<!--HEADER:END-->";   next }
    /<!--FOOTER:START-->/ { skip=1; print "<!--FOOTER:START-->"; printf "%s", ftr; next }
    /<!--FOOTER:END-->/   { skip=0; print "<!--FOOTER:END-->";   next }
    /<!--HEADER-->/ { print "<!--HEADER:START-->"; printf "%s", hdr; print "<!--HEADER:END-->"; next }
    /<!--FOOTER-->/ { print "<!--FOOTER:START-->"; printf "%s", ftr; print "<!--FOOTER:END-->"; next }
    skip != 1 { print }
  ' "$f" > ".build.tmp"
  mv ".build.tmp" "$f"
  echo "  ✓ $f"
done

echo "Готово."
