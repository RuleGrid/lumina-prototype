# camp-checker

Checks live campsite availability on ReserveAmerica by rendering the search
page in headless Chromium (the site has no public API and blocks plain HTTP
clients). Default target: **Anthony Chabot Regional Park** (Castro Valley,
~35 min from Berkeley), arrival **2026-08-15**, **10 nights** (checkout
Aug 25), filtered to RV/trailer sites.

Context: Anthony Chabot has only 12 hookup sites — **sites 1–12, Loop A**
(water + sewer + 30-amp electric). Pads average ~30 ft, max 39 ft. Nearby
alternative with 60 full-hookup 50-amp sites: Dumbarton Quarry (see below).

## Run it

```bash
cd camp-checker
npm install
npx playwright install chromium   # skip if Chromium is already provisioned
npm run check -- --arrival 2026-08-15 --nights 10
```

Output lands in `camp-checker/output/`:

- `page.png` — full screenshot of the results (the ground truth)
- `page.txt` / `page.html` — rendered text and markup
- `api/*.json` — raw availability JSON the page fetched, indexed in `api/index.json`

The console prints a best-effort summary of site/availability lines.

## Other campgrounds

```bash
# Dumbarton Quarry Campground on the Bay (Fremont) — 60 full-hookup sites
npm run check -- --facility dumbarton-quarry-campground-on-the-bay/EB/110750 --arrival 2026-08-15 --nights 10
```

## Notes

- In a sandboxed Claude Code environment, outbound traffic must be allowed to
  `www.reserveamerica.com` (environment settings → network access), otherwise
  the script exits with a clear "network policy is blocking" message. See
  https://code.claude.com/docs/en/claude-code-on-the-web
- If `page.png` shows an "Access Denied"/CAPTCHA page, the site's bot
  protection triggered: rerun with `--headed` and complete the check once.
- Booking is via reserveamerica.com or **1-888-327-2757, option 2** (East Bay
  Regional Park District), at least 2 business days before arrival.
