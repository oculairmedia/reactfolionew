#!/bin/bash
echo "Checking CDN URLs..."
> cdn-images-verified.txt
while IFS= read -r url; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "✓ $url"
    echo "$url" >> cdn-images-verified.txt
  else
    echo "✗ [$status] $url"
  fi
done < cdn-images-found.txt
echo "Done! Verified URLs saved to cdn-images-verified.txt"
wc -l cdn-images-verified.txt
