#!/usr/bin/env sh
# Layani game di http://localhost:8000 untuk uji di browser desktop.
cd "$(dirname "$0")/../app/src/main/assets/www" && python3 -m http.server 8000
