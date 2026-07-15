# Lumina website prototype

Stanford Startup Education · Module 2 prototype.

Modern one-page site built on the Lumina brand book (v1.0, July 2026).

## Run

```bash
cd "/Users/ivan/Documents/Stanford Startup Education/Module 2/Prototype"
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

Languages: English (`index.html`) and Ukrainian (`uk.html`), switcher in the top nav. SamiAI chat answers in the page's language.

## Page flow

1. **Hero** - "Wine left the bottle to match your lifestyle" + four action buttons
2. **Actions** - Ask SamiAI · Find a local party · Start a subscription · Discover each wine
3. **Wines** - horizontal shelf with all ten cans (real product photos in `assets/`)
4. **Story** - honest wine, no lecture; can back with QR
5. **Timeline** - qvevri to amphora to bottle to can
6. **SamiAI** - AI app section with live chat demo (keyword matching, no backend)
7. **Parties** - event list with ticket platforms
8. **Wine Tree** - sponsor a vine, $180/year, reservation modal
9. **Subscription** - three monthly plans, fake checkout

## Design tokens (from the brand book)

- Cream `#FFF6EC` · Sand `#FFE4CC` · Crush `#FF3B5C` · Gold `#FFC857` · Mint `#5FD4C8` · Ink `#2A1810`
- Can colors used only on product cards, never for interface
- Wordmark: letterspaced grotesque caps with the Crush grape dot over the I (pure CSS)
- Type: Fraunces (display, echoes the can lettering) + Outfit (body)
