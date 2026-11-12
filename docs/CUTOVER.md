# DNS cutover plan — phantastic.net → GitHub Pages

**Status: NOT APPLIED.** Nothing here has been run. Huy approves the cutover after reviewing the preview at
<https://phantasticinc.github.io/Phantastic-paper/>.

DNS for phantastic.net is hosted at Wix (nameservers `ns0.wixdns.net` / `ns1.wixdns.net`). Today the apex has an
**A record → 64.239.109.1** (Grok/Vercel) and `www` is a **CNAME → cname.vercel-dns.com**.

## 0. Before touching DNS (no downtime)

1. Confirm the preview works on every route (guide, risk, privacy, ladder, login, desk) on desktop and mobile.
2. In the GitHub repo set **Actions variables**:
   - `PAGES_BASE` = `/`
   - `PAGES_CNAME` = `phantastic.net`
   Re-run the workflow (Actions → *Deploy to GitHub Pages* → *Run workflow*). The build now uses base `/`
   and writes `dist/CNAME` (a copy of `cutover/CNAME`).
   > Note: with base `/`, the *project* URL `phantasticinc.github.io/Phantastic-paper/` will stop rendering correctly
   > (it is served under a sub-path). That is expected once the custom domain is set.
3. Set the custom domain on the Pages site (no DNS change needed yet):
   `gh api -X PUT repos/Phantasticinc/Phantastic-paper/pages -f cname=phantastic.net`
   GitHub will report the domain as "DNS check unsuccessful" until step 2 below — that is normal.

## 1. DNS changes at Wix (Domains → phantastic.net → DNS records)

Delete the old records, then add:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 1h (3600) |
| A | `@` | `185.199.109.153` | 1h |
| A | `@` | `185.199.110.153` | 1h |
| A | `@` | `185.199.111.153` | 1h |
| CNAME | `www` | `phantasticinc.github.io` | 1h |

Delete: the existing `A @ 64.239.109.1` and `CNAME www cname.vercel-dns.com`. Do **not** touch MX/TXT (email) records.
Optional IPv6 (AAAA `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

## 2. Enforce HTTPS

1. Wait for the Pages settings to show **DNS check successful** (usually minutes, up to ~1 h for propagation).
2. GitHub provisions a Let's Encrypt certificate for `phantastic.net` and `www.phantastic.net` automatically
   (typically 10–60 min after the DNS check passes; occasionally up to 24 h).
3. When the checkbox is enabled: Settings → Pages → **Enforce HTTPS**, or
   `gh api -X PUT repos/Phantasticinc/Phantastic-paper/pages -F https_enforced=true`.
4. Verify: `curl -I https://phantastic.net/` (200), `curl -I https://www.phantastic.net/` (redirects to the apex),
   and open /guide, /ladder, /login directly (served via the `404.html` SPA fallback — GitHub Pages returns HTTP 404
   status for those deep links but renders the app; browsers don't care, crawlers may).

## 3. Risks

- **Downtime:** a few minutes (TTL-bound) while resolvers switch from the old A/CNAME to GitHub. Lower the TTL at Wix to
  60–300 s a day before to shorten it.
- **Certificate delay:** until GitHub issues the cert, `https://phantastic.net` may show a certificate warning for up to
  an hour (HTTP works). Don't enforce HTTPS until the checkbox is available.
- **Deep-link status codes:** SPA fallback returns 404 status + app HTML on direct hits to non-root routes.
- **State:** the live app stores desks in each visitor's localStorage on the *phantastic.net origin*; moving hosting
  keeps that origin, so existing users keep their local book. (Grok-account data/ladder rows on Grok's servers do not move.)
- **Broken `www` today** (cert only covers the apex) gets fixed by this cutover.

## 4. Rollback

Restore `A @ 64.239.109.1` and `CNAME www cname.vercel-dns.com` at Wix, remove the custom domain in Pages
(`gh api -X DELETE repos/Phantasticinc/Phantastic-paper/pages` removes Pages entirely; or clear the `cname`). Propagation is
TTL-bound again.
