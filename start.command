#!/bin/bash
cd "$(dirname "$0")"
echo "Serving wedding invitation at http://localhost:8000  (Ctrl+C to stop)"
(sleep 1; open http://localhost:8000) &
python3 -m http.server 8000
