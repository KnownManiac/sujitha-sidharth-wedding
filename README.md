# Sujitha & Sidharth — wedding invitation

Static site: index.html · styles.css · script.js · assets/

## Run locally
    cd wedding
    python3 -m http.server 8000
then open http://localhost:8000 (must be served over http, not opened as a file, for the music and scratch canvas to work).

## Deploy
Drop the folder on Vercel (no build step) or any static host.

## Edit
- Copy: index.html
- RSVP endpoint, WhatsApp number, dress-code colours, calendar times: top of script.js (CONFIG)
- Music: assets/audio/song.mp3 (Subramaniapuram love theme; replace with any mp3)
- Illustrations: assets/img/ (transparent PNGs cut from the ChatGPT composite)

