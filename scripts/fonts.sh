#!/bin/sh
# Rebuilds src/assets/fonts/ from the upstream OFL sources (Fontsource CDN,
# pinned versions). The upstream files are variable and carry axes and
# glyphs the site never uses, so each one is subset, then pinned to the
# axis values the design uses. Run it again after changing a version, a
# weight or one of the two fixed strings below.
#
# Needs python3 and curl; fonttools is installed in a throwaway venv.
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT="$ROOT/src/assets/fonts"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

CDN="https://cdn.jsdelivr.net/fontsource/fonts"
VERSION="5.3.0"
# English and French: ASCII, Latin-1 (é, ç, à...), Œ œ, typographic quotes, en dash, bullet, ellipsis, euro.
LATIN="U+0020-007E,U+00A0-00FF,U+0152-0153,U+2013,U+2018-201F,U+2022,U+2026,U+20AC"
# The mono only sets data (stack names, dates, coordinates): ASCII and the degree sign.
DATA="U+0020-007E,U+00B0,U+00B7"
# Strings set in a single face: their files only need these glyphs.
WORDMARK="Thibaut Lefrançois"
EMAIL="hello@thibaut-lefrancois.com"

python3 -m venv "$WORK/venv"
"$WORK/venv/bin/pip" install --quiet fonttools brotli
FONTTOOLS="$WORK/venv/bin/fonttools"

# build <source path on the CDN> <output name> <subset option> [axis=value ...]
build() {
  source=$1 name=$2 glyphs=$3
  shift 3
  curl -fsSL "$CDN/$source" -o "$WORK/$name.source.woff2"
  "$FONTTOOLS" subset "$WORK/$name.source.woff2" "$glyphs" \
    --layout-features="kern,liga,calt,tnum,lnum,case" --output-file="$WORK/$name.subset.ttf"
  if [ "$#" -gt 0 ]; then
    "$FONTTOOLS" varLib.instancer "$WORK/$name.subset.ttf" "$@" --output="$WORK/$name.ttf" --quiet
  else
    mv "$WORK/$name.subset.ttf" "$WORK/$name.ttf"
  fi
  if [ "${FORMAT:-woff2}" = woff ]; then
    mkdir -p "$OUT/og"
    "$FONTTOOLS" ttLib "$WORK/$name.ttf" --flavor woff -o "$OUT/og/$name.woff"
    printf '%-32s %6s bytes\n' "og/$name.woff" "$(wc -c < "$OUT/og/$name.woff" | tr -d ' ')"
  else
    "$FONTTOOLS" ttLib "$WORK/$name.ttf" --flavor woff2 -o "$OUT/$name.woff2"
    printf '%-32s %6s bytes\n' "$name.woff2" "$(wc -c < "$OUT/$name.woff2" | tr -d ' ')"
  fi
}

build "archivo:vf@$VERSION/latin-wdth-normal.woff2" archivo-wordmark "--text=$WORDMARK" wght=800 wdth=125
build "stack-sans-notch:vf@$VERSION/latin-wght-normal.woff2" stack-sans-notch-email "--text=$EMAIL" wght=700
build "stack-sans-headline:vf@$VERSION/latin-wght-normal.woff2" stack-sans-headline "--unicodes=$LATIN" wght=700
build "stack-sans-text:vf@$VERSION/latin-wght-normal.woff2" stack-sans-text "--unicodes=$LATIN" wght=400:500
build "fragment-mono@$VERSION/latin-400-normal.woff2" fragment-mono "--unicodes=$DATA"

# Open Graph images are rendered at build time by Satori, which reads WOFF
# but not WOFF2. These files never reach the browser.
FORMAT=woff build "archivo:vf@$VERSION/latin-wdth-normal.woff2" archivo-wordmark "--text=$WORDMARK" wght=800 wdth=125
FORMAT=woff build "stack-sans-headline:vf@$VERSION/latin-wght-normal.woff2" stack-sans-headline "--unicodes=$LATIN" wght=700
FORMAT=woff build "stack-sans-text:vf@$VERSION/latin-wght-normal.woff2" stack-sans-text "--unicodes=$LATIN" wght=400
