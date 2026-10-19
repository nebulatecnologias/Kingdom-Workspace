#!/bin/bash
# Tradução do reel 10x Mindset: ritmo por secção -> tapar legendas EN -> laranja Kingdom -> 1080x1920 + legendas PT + botão + som PT
set -e
cd "$(dirname "$0")"
DUR=$(python3 -c "import json;print(json.load(open('plan.json'))['dur'])")
ffmpeg -v error -i ../referencias/referencia-1.mp4 -filter_complex_script remap.fc -map '[out]' -f rawvideo -pix_fmt rgb24 - \
 | python3 -I recolor.py 720 1280 \
 | ffmpeg -v error -y -f rawvideo -pix_fmt rgb24 -s 720x1280 -r 30 -i - -loop 1 -framerate 30 -i pill.png -i audio/mix.wav \
     -filter_complex_script final.fc -map '[out]' -map 2:a -t "$DUR" -c:v libx264 -preset medium -crf 17 -c:a aac -b:a 192k -movflags +faststart traducao.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 traducao.mp4
