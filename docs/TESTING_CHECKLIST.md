# LinkLite — Quality Assurance & Testing Checklist

This comprehensive checklist ensures high reliability across both the Chrome Extension client and the Express/PostgreSQL backend before deploying to production.

---

## 1. Extension Popup & Frontend Verification

- [ ] **Tab Auto-Detection**:
  - [ ] Opening popup on standard website (`https://github.com`, `https://news.ycombinator.com`) auto-fills current tab URL.
  - [ ] Opening popup on restricted browser pages (`chrome://extensions`, `about:blank`) gracefully shows empty input with placeholder without crashing.
- [ ] **Shortening Flow**:
  - [ ] Submitting empty input triggers error validation toast.
  - [ ] Submitting valid URL triggers loading spinner on button and creates short URL.
  - [ ] Generated link is automatically copied to clipboard.
  - [ ] "Copied" feedback state appears for 2 seconds.
- [ ] **Custom Alias**:
  - [ ] Custom alias toggle unfolds smoothly (180ms).
  - [ ] Alphanumeric constraints enforced (rejects spaces, special punctuation).
  - [ ] Server collision with existing alias returns user-friendly error message.
- [ ] **QR Code Modal**:
  - [ ] Clicking "View QR Code" opens modal smoothly without layout shift.
  - [ ] QR code canvas renders clearly at 180x180 with high contrast.
  - [ ] Clicking "Download" downloads a valid PNG file.
  - [ ] Clicking "Copy Image" places image binary into clipboard.
- [ ] **Recent Links Tab**:
  - [ ] Newly generated link appears at top of recent links list.
  - [ ] Real-time search filters items by URL and short code without debounce lag.
  - [ ] Clicking "Copy" on any card copies short URL.
  - [ ] Clicking "Open" opens short URL in new active browser tab.
  - [ ] Clicking "Delete" removes item from local storage and sends delete request to server.
- [ ] **Analytics Tab**:
  - [ ] Clicking analytics button on a card opens metrics drilldown.
  - [ ] Total click count, last clicked timestamp, top country distribution, and referrer tags are rendered.
  - [ ] Clicking "Back to Recent Links" returns smoothly to main list.
- [ ] **Theme & Settings**:
  - [ ] Toggling between Dark and Light mode applies exact color tokens instantly.
  - [ ] Theme choice is preserved across browser sessions.
  - [ ] Testing backend endpoint in Settings checks server health status.

---

## 2. Backend API & Redirect Verification

- [ ] **Endpoint Tests**:
  - [ ] `POST /api/shorten` returns HTTP 201 with `{ id, shortCode, shortUrl, originalUrl, clickCount }`.
  - [ ] `POST /api/shorten` validates input with Zod and rejects malformed inputs with HTTP 400.
  - [ ] `GET /:shortCode` issues HTTP 302 Found redirect to target URL.
  - [ ] `GET /:shortCode` with non-existent code returns friendly 404 page.
  - [ ] `GET /:shortCode` sets `Cache-Control: no-cache, no-store, must-revalidate`.
  - [ ] `GET /api/urls` returns paginated list with total count.
  - [ ] `GET /api/urls/:id/analytics` returns aggregated country and referrer metrics.
  - [ ] `DELETE /api/urls/:id` cascades deletion to `click_logs` table.
  - [ ] `GET /api/health` returns status of DB connection and latency.
- [ ] **Security & Performance**:
  - [ ] Rate limiting enforces max 30 shortens/min per IP.
  - [ ] Helmet security headers present in all responses.
  - [ ] Database connection pool properly cleans up on SIGTERM/SIGINT.
