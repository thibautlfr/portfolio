#!/usr/bin/env bash
# Builds the capture tool against the game's repository (next to the portfolio) and writes the
# captures to media/bowser-bros/captures/. Needs Homebrew's qtbase and qtmultimedia, and ffmpeg.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
game="$(cd "$here/../../../.." && pwd)/IUT-BowserBros"
out="$here/../captures"
work="${TMPDIR:-/tmp}/bowser-bros-capture"

rm -rf "$work"
mkdir -p "$work/build" "$work/run/a/b/c/d/e" "$work/run/DataBase" "$work/run/Settings" "$out"
(cd "$work/build" && qmake "$here/capture.pro" >/dev/null && make -j8 >/dev/null)

# The game reads ../../../../../DataBase/ScoreBoard.json and Settings/settings.txt from where it runs.
cp "$game/Database/ScoreBoard.json" "$work/run/DataBase/"
cp "$game/Settings/settings.txt" "$work/run/Settings/"

export QT_QPA_PLATFORM=offscreen
capture="$work/build/capture"
cd "$work/run/a/b/c/d/e"

for screen in menu training scoreboard; do
  "$capture" still "$screen" "$out/$screen.png" >/dev/null 2>&1
done

# Level 4 a second in: Goombas and a Koopa walking, a fireball falling.
echo "# idle" >"$work/idle.txt"
"$capture" run 4 "$work/idle.txt" 121 120 "$work/level4" >/dev/null 2>&1
cp "$work/level4/0001.png" "$out/level4.png"

# The climb: a frame every 4 ticks, 25 frames a second of game time, encoded near-lossless.
"$capture" run 1 "$here/scripts/climb.txt" 560 4 "$work/climb" 2>/dev/null >"$work/climb.log"
ffmpeg -loglevel error -y -framerate 25 -i "$work/climb/%04d.png" \
  -c:v libx264 -crf 10 -preset slow -pix_fmt yuv420p "$out/climb.mp4"
cp "$work/climb/0060.png" "$out/climb.png"

ls -la "$out"
