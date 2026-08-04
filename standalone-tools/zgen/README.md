# ZGEN — Generation Finder

Enter a birth year, get the matching generation (Silent, Boomer, Gen X, Gen Y,
Gen Z, Alpha, Beta), its traits/vibes, and a directional compatibility guide
(do's, don'ts, one joke) against every other generation.

Fully static — vanilla HTML/CSS/JS, no build step, no backend, no analytics,
no external requests. Everything (including all copy and avatars) is bundled
in this folder and every asset path is relative, so the folder works from
any subpath or domain.

## Files

- `index.html` — markup + app logic (inline `<script>`)
- `data.js` — `ZGEN_DATA`: generation ranges, traits, vibes, and the full
  directional compatibility matrix
- `style.css` — all styling (solid-color palette cards, dark background)
- `img/gen_<id>_<m|f>.jpg` — male/female avatar per generation (14 files)

## Use

Drop the whole `zgen/` folder into any static host or repo and open
`index.html` directly, or serve it with any static file server, e.g.:

```bash
npx serve .
# or
python -m http.server 8080
```

## Extending

- Edit `data.js` to change ranges, traits, vibes, or compatibility text —
  `compat[youId][otherId]` is directional, so `genz.boomer` and
  `boomer.genz` are independent entries.
- Adding a new generation: append to `generations`, add a `profiles[id]`
  entry, add `compat[id]` (outbound) and a `compat[<other>][id]` entry
  (inbound) for every existing generation, and drop its two avatar images
  into `img/`.
