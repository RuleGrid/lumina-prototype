// Checks ReserveAmerica campsite availability by rendering the search page in
// headless Chromium, since the site has no public JSON API and blocks plain
// HTTP clients. Saves a screenshot, the page text/HTML, and every JSON API
// response the page loads, then prints a best-effort availability summary.
//
// Usage:
//   npm run check -- --arrival 2026-08-15 --nights 10
//   npm run check -- --facility dumbarton-quarry-campground-on-the-bay/EB/110750
//
// Options:
//   --arrival  YYYY-MM-DD   first night (default 2026-08-15)
//   --nights   N            length of stay (default 10 → checkout Aug 25)
//   --equip    CODE         ReserveAmerica "looking for" filter (default 2001 = RV/trailer)
//   --facility SLUG         explore-page facility path (default Anthony Chabot)
//   --out      DIR          output directory (default ./output)
//   --headed                show the browser window (helps past bot checks locally)

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const arrival = args.arrival ?? '2026-08-15';
const nights = Number(args.nights ?? 10);
const equip = args.equip ?? '2001';
const facility = (args.facility ?? 'anthony-chabot/EB/110004').replace(/^\/+|\/+$/g, '');
const outDir = path.resolve(args.out ?? path.join(import.meta.dirname, 'output'));

const url =
  `https://www.reserveamerica.com/explore/${facility}/campsites` +
  `?arrivalDate=${arrival}&lengthOfStay=${nights}&lookingFor=${equip}` +
  `&availStartDate=${arrival}&pageNumber=0`;

console.log(`Checking: ${url}`);
console.log(`Stay: ${arrival} + ${nights} nights\n`);

fs.mkdirSync(path.join(outDir, 'api'), { recursive: true });

const browser = await launchBrowser(!args.headed);
const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  viewport: { width: 1440, height: 1000 },
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles',
});
const page = await context.newPage();

// Capture the JSON the page fetches — this is the ground-truth availability data.
const apiIndex = [];
page.on('response', async (res) => {
  try {
    const u = res.url();
    if (!/reserveamerica\.com/.test(u)) return;
    if (!/api|avail|campsite|search|facility/i.test(u)) return;
    if (!(res.headers()['content-type'] ?? '').includes('json')) return;
    const body = await res.text();
    if (!body || body.length > 3_000_000 || apiIndex.length >= 50) return;
    const file = `api/${String(apiIndex.length).padStart(3, '0')}.json`;
    fs.writeFileSync(path.join(outDir, file), body);
    apiIndex.push({ file, status: res.status(), url: u });
  } catch {
    /* response bodies can be unavailable after navigation; ignore */
  }
});

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page
    .waitForSelector('text=/site|no results|available|sold out/i', { timeout: 20_000 })
    .catch(() => {});
  await page.waitForTimeout(2_000); // let late XHRs land
} catch (err) {
  await browser.close().catch(() => {});
  explainNavigationFailure(err);
  process.exit(2);
}

const text = await page.evaluate(() => document.body.innerText).catch(() => '');
await page.screenshot({ path: path.join(outDir, 'page.png'), fullPage: true }).catch(() => {});
fs.writeFileSync(path.join(outDir, 'page.html'), await page.content().catch(() => ''));
fs.writeFileSync(path.join(outDir, 'page.txt'), text);
fs.writeFileSync(path.join(outDir, 'api', 'index.json'), JSON.stringify(apiIndex, null, 2));
await browser.close();

summarize(text, apiIndex);
console.log(`\nSaved: page.png, page.html, page.txt and ${apiIndex.length} API responses in ${outDir}`);

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

async function launchBrowser(headless) {
  const opts = { headless };
  if (process.env.HTTPS_PROXY) opts.proxy = { server: process.env.HTTPS_PROXY };
  if (process.getuid?.() === 0) opts.args = ['--no-sandbox'];
  try {
    return await chromium.launch(opts);
  } catch (err) {
    // Sandboxed environments ship Chromium at a fixed path that may not match
    // the installed playwright version's expected browser build.
    const fallback = '/opt/pw-browsers/chromium';
    if (fs.existsSync(fallback)) {
      return await chromium.launch({ ...opts, executablePath: fallback });
    }
    throw err;
  }
}

function explainNavigationFailure(err) {
  const msg = String(err?.message ?? err);
  console.error(`\nCould not load the page: ${msg.split('\n')[0]}`);
  if (/ERR_TUNNEL_CONNECTION_FAILED|ERR_PROXY|ERR_NO_SUPPORTED_PROXIES|403/i.test(msg)) {
    console.error(
      '\nThis machine\'s outbound network policy is blocking reserveamerica.com.\n' +
        'Fix: allow www.reserveamerica.com (or enable full network access) in the\n' +
        'environment settings, or run this script on a normal machine:\n' +
        '  cd camp-checker && npm install && npx playwright install chromium\n' +
        '  npm run check -- --arrival 2026-08-15 --nights 10'
    );
  } else if (/ERR_NAME_NOT_RESOLVED|ENOTFOUND/i.test(msg)) {
    console.error('\nDNS failed — check the internet connection.');
  } else {
    console.error(
      '\nIf the saved page.png shows an "Access Denied" or CAPTCHA page, the site\'s\n' +
        'bot protection triggered — rerun with --headed and complete the check once.'
    );
  }
}

function summarize(text, api) {
  console.log('=== Best-effort summary (verify with page.png / api/*.json) ===');

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^(site\b|loop\b|#?\d{1,3}\b.*\b(rv|trailer|hookup))/i.test(lines[i]) ||
        /\b(available|unavailable|sold out|book now|enter dates|no results)\b/i.test(lines[i])) {
      hits.push(lines[i]);
    }
  }
  if (hits.length) {
    for (const h of hits.slice(0, 80)) console.log('  ' + h);
    if (hits.length > 80) console.log(`  … ${hits.length - 80} more lines, see page.txt`);
  } else {
    console.log('  No obvious availability text found — open page.png to see what rendered.');
  }

  const availFiles = api.filter((a) => /avail/i.test(a.url));
  if (availFiles.length) {
    console.log('\nAPI responses that look like availability data:');
    for (const a of availFiles) console.log(`  ${a.file}  ${a.url}`);
  }
}
