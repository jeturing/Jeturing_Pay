#!/bin/bash
# Create 1x1 PNG then resize with sips
echo -e '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xa0\xa1\xa1\x01\x00\x00\x06\x00\x02\xc3\x1dh\xb1\x00\x00\x00\x00IEND\xaeB`\x82' > temp.png

sips -z 1024 1024 temp.png --out icon.png > /dev/null 2>&1
sips -z 1024 1024 temp.png --out adaptive-icon.png > /dev/null 2>&1
sips -z 2778 1284 temp.png --out splash.png > /dev/null 2>&1
sips -z 48 48 temp.png --out favicon.png > /dev/null 2>&1

rm temp.png
echo "✓ Created placeholder images"
