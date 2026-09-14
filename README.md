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
Images are optional — the page renders a labeled placeholder ("DROP HERE")
wherever a screenshot is missing, so you can ship without them and add
each one later. Just save your images with these **exact filenames** into
`assets/images/`:

| Filename | Where it appears | What to capture |
|---|---|---|
| `exhibit-01-static-triage.jpg` | Exhibit 01 | File properties / static triage (hash, PE headers, size) |
| `exhibit-02-strings.jpg` | Exhibit 02 | `strings` / resource dump output |
| `exhibit-03-ransom-ui.jpg` | Exhibit 03 | The sample's own ransom-note window (this is *your* screenshot of the malware's behavior — fine to include) |
| `exhibit-06-locker-source.jpg` | Exhibit 06 | Decompiled `Locker` class showing the AES key/IV constants |

Any JPG/PNG works — they're rendered with `object-fit: cover`, so roughly
16:10 crops look cleanest. Add more evidence cards yourself by copying an
`.evidence` block in `index.html` if you want extra exhibits per section.

## Filling in the real hash
`#sampleHash` in Exhibit 01 currently reads "— pending upload —". Open
`index.html`, search for `sampleHash`, and drop in the real SHA-256 from
your analysis.

## Notes on the Jigsaw visual identity
The hero mark is an **original abstract SVG**, not a reproduction of the
film character — reusing that specific copyrighted design isn't something
I can generate or source. If you want the actual "Billy the puppet" imagery
that the ransomware itself displays, use your own screenshot of the
sample's ransom-note UI (`exhibit-03-ransom-ui.jpg` above) — that's
documenting the malware's behavior, not decorative use of the IP.

## Structure
```
index.html
css/styles.css
js/main.js
assets/images/   ← drop screenshots here
```
