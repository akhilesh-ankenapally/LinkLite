import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting LinkLite Comprehensive Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- Test 1: Extension Build & Manifest V3 Verification ---
  console.log('📦 1. Manifest V3 & Build Artifacts Verification');
  const manifestPath = path.resolve(__dirname, 'extension/dist/manifest.json');
  const indexHtmlPath = path.resolve(__dirname, 'extension/dist/index.html');
  const bgPath = path.resolve(__dirname, 'extension/dist/background.js');
  const contentPath = path.resolve(__dirname, 'extension/dist/content.js');
  const icon128Path = path.resolve(__dirname, 'extension/dist/icons/icon128.png');

  assert(fs.existsSync(manifestPath), 'dist/manifest.json exists');
  assert(fs.existsSync(indexHtmlPath), 'dist/index.html exists');
  assert(fs.existsSync(bgPath), 'dist/background.js exists');
  assert(fs.existsSync(contentPath), 'dist/content.js exists');
  assert(fs.existsSync(icon128Path), 'dist/icons/icon128.png exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.manifest_version === 3, 'manifest_version is 3');
  assert(manifest.action.default_popup === 'index.html', 'default_popup is index.html');
  assert(manifest.background.service_worker === 'background.js', 'service_worker is background.js');
  assert(manifest.permissions.includes('activeTab'), 'permissions includes activeTab');
  assert(manifest.permissions.includes('storage'), 'permissions includes storage');
  assert(manifest.permissions.includes('clipboardWrite'), 'permissions includes clipboardWrite');

  // --- Test 2: Backend Health & Neon Database Check ---
  console.log('\n🏥 2. Backend Health & Neon PostgreSQL Connection');
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint HTTP 200 OK');
    assert(health.status === 'healthy', 'Health status is healthy');
    assert(health.database === 'connected', 'Database is connected to Neon PostgreSQL');
  } catch (err) {
    assert(false, `Health check request failed: ${err.message}`);
  }

  // --- Test 3: Link Shortening (GitHub.com E2E Flow) ---
  console.log('\n🔗 3. URL Shortening API (https://github.com)');
  let generatedShortCode = '';
  let generatedUrlId = '';
  let generatedShortUrl = '';

  try {
    const shortenRes = await fetch(`${BASE_URL}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://github.com' }),
    });

    assert(shortenRes.status === 201, 'Shorten endpoint HTTP 201 Created');
    const data = await shortenRes.json();
    assert(data.id && data.shortCode && data.shortUrl, 'Response contains id, shortCode, and shortUrl');
    assert(data.originalUrl === 'https://github.com/', 'Original URL normalized correctly');
    generatedShortCode = data.shortCode;
    generatedUrlId = data.id;
    generatedShortUrl = data.shortUrl;
    console.log(`     Generated Code: ${generatedShortCode} -> ${generatedShortUrl}`);
  } catch (err) {
    assert(false, `Shorten request failed: ${err.message}`);
  }

  // --- Test 4: Custom Alias Shortening ---
  console.log('\n🏷️ 4. Custom Alias Shortening');
  const testAlias = `gh-test-${Math.floor(Math.random() * 1000)}`;
  try {
    const aliasRes = await fetch(`${BASE_URL}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://github.com/trending', customAlias: testAlias }),
    });

    assert(aliasRes.status === 201, 'Custom alias HTTP 201 Created');
    const aliasData = await aliasRes.json();
    assert(aliasData.shortCode === testAlias, `Custom shortCode matches '${testAlias}'`);
  } catch (err) {
    assert(false, `Custom alias request failed: ${err.message}`);
  }

  // --- Test 5: Recent Links Listing ---
  console.log('\n📋 5. Recent Links Listing & Search');
  try {
    const listRes = await fetch(`${BASE_URL}/api/urls?search=github`);
    assert(listRes.status === 200, 'URLs list HTTP 200 OK');
    const listData = await listRes.json();
    assert(Array.isArray(listData.urls), 'urls is an array');
    assert(listData.urls.length > 0, `Search query found ${listData.urls.length} matching links`);
  } catch (err) {
    assert(false, `List URLs request failed: ${err.message}`);
  }

  // --- Test 6: Short Link Redirect & Click Tracking ---
  console.log('\n🔀 6. HTTP 302 Redirect & Async Click Logging');
  try {
    const redirectRes = await fetch(`${BASE_URL}/${generatedShortCode}`, {
      redirect: 'manual',
    });

    assert(redirectRes.status === 302, 'Redirect returns HTTP 302 Found');
    const location = redirectRes.headers.get('location');
    assert(location === 'https://github.com/', `Redirect Location is 'https://github.com/' (Got: ${location})`);
    const cacheControl = redirectRes.headers.get('cache-control');
    assert(cacheControl.includes('no-cache'), 'Cache-Control header prevents stale caching');
  } catch (err) {
    assert(false, `Redirect request failed: ${err.message}`);
  }

  // Wait 2 seconds for async analytics transaction to settle in remote DB
  await new Promise((r) => setTimeout(r, 2000));

  // --- Test 7: Analytics Retrieval ---
  console.log('\n📊 7. Analytics Metrics Retrieval');
  try {
    const analyticsRes = await fetch(`${BASE_URL}/api/urls/${generatedUrlId}/analytics`);
    assert(analyticsRes.status === 200, 'Analytics endpoint HTTP 200 OK');
    const analyticsData = await analyticsRes.json();
    assert(analyticsData.totalClicks >= 1, `Total clicks recorded (Got: ${analyticsData.totalClicks})`);
    assert(analyticsData.lastClickAt !== null, 'lastClickAt timestamp recorded');
    assert(Array.isArray(analyticsData.countries), 'countries breakdown is an array');
    assert(Array.isArray(analyticsData.referrers), 'referrers breakdown is an array');
  } catch (err) {
    assert(false, `Analytics request failed: ${err.message}`);
  }

  // --- Test 8: Deletion & Cascade ---
  console.log('\n🗑️ 8. Delete URL & Cascade Verification');
  try {
    const deleteRes = await fetch(`${BASE_URL}/api/urls/${generatedUrlId}`, {
      method: 'DELETE',
    });
    assert(deleteRes.status === 200, 'Delete endpoint HTTP 200 OK');

    const verifyDeleted = await fetch(`${BASE_URL}/${generatedShortCode}`, {
      redirect: 'manual',
    });
    assert(verifyDeleted.status === 404, 'Deleted short link returns HTTP 404 Not Found');
  } catch (err) {
    assert(false, `Delete request failed: ${err.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🏁 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Integration test runner fatal error:', e);
  process.exit(1);
});
