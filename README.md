# Jigsaw Ransomware — Case Study Site

Static site, no build step. Pure HTML/CSS/JS + GSAP (loaded from cdnjs).

## Run locally
Just open `index.html`, or serve it (recommended, so the image
existence-check works correctly over `http://` rather than `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages
1. Push this folder as the repo root (or to a `/docs` folder).
2. Repo → Settings → Pages → Deploy from branch → pick `main` (and `/docs` if used).
3. Your link: `https://<username>.github.io/<repo>/`

No other config needed — everything is static.

## Drop in your screenshots
All the core evidence screenshots you sent are already wired in under
`assets/images/` with the right filenames — nothing left to do there.
If you want to swap one out or add more evidence cards later, the
fallback system still works: any missing filename renders a labeled
"DROP HERE" placeholder instead of a broken image, so you can add more
`.evidence` blocks in `index.html` whenever you like.

## The recovery script
`assets/decryption.ps1` is the real PowerShell decryptor from your
analysis — it's wired into Exhibit 09 both as inline code and as a
direct download link.

## Notes on the Jigsaw visual identity
The hero mark and the full-page entrance sequence are **original CSS/SVG**,
not reproductions of the film character or any Saw promotional material —
that's a hard line, regardless of the source (fan sites, official studio
GIFs, hashtag campaigns — none of it is licensed for reuse in someone
else's project). The one piece of "Billy the puppet" imagery on the site
is `exhibit-03-ransom-ui.png`, which is *your own screenshot* of the
ransomware's own UI — that documents the malware's behavior rather than
decorating the page with the IP.

## Structure
```
index.html
css/styles.css
js/main.js
assets/decryption.ps1   ← the real recovery script, linked from Exhibit 09
assets/images/           ← evidence screenshots (already filled in)
```
