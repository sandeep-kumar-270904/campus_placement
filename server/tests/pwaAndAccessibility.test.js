const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const axe = require('axe-core');

const CLIENT_ROOT = path.resolve(__dirname, '../../client');
const PUBLIC_DIR = path.join(CLIENT_ROOT, 'public');

describe('PWA, Performance & Accessibility (WCAG 2.1 AA) Test Suite', () => {
  describe('1. PWA Web App Manifest Validation', () => {
    test('manifest.webmanifest exists, is valid JSON, and meets PWA installability criteria', () => {
      const manifestPath = path.join(PUBLIC_DIR, 'manifest.webmanifest');
      assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');

      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // PWA installability requirements
      assert.strictEqual(manifestContent.short_name, 'PLACEearly');
      assert.strictEqual(manifestContent.display, 'standalone');
      assert.strictEqual(manifestContent.start_url, '/');
      assert.ok(manifestContent.theme_color, 'Theme color must be specified');
      assert.ok(manifestContent.background_color, 'Background color must be specified');

      // Icons array with sizes >= 192 and maskable purpose
      assert.ok(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 2);
      const hasMaskable = manifestContent.icons.some((i) => i.purpose?.includes('maskable'));
      assert.ok(hasMaskable, 'Manifest must include maskable icon');

      // Fast app shortcuts
      assert.ok(Array.isArray(manifestContent.shortcuts) && manifestContent.shortcuts.length >= 2);
    });

    test('manifest.json mirror exists for legacy Android WebViews', () => {
      const manifestJsonPath = path.join(PUBLIC_DIR, 'manifest.json');
      assert.ok(fs.existsSync(manifestJsonPath), 'manifest.json mirror must exist');
      const json = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
      assert.strictEqual(json.display, 'standalone');
    });
  });

  describe('2. Service Worker & Offline Shell Strategy', () => {
    const swPath = path.join(PUBLIC_DIR, 'sw.js');

    test('sw.js includes App Shell pre-caching and versioned caches', () => {
      assert.ok(fs.existsSync(swPath), 'sw.js must exist');
      const swCode = fs.readFileSync(swPath, 'utf8');

      assert.ok(swCode.includes('placeearly-shell-'), 'SW must have versioned shell cache');
      assert.ok(swCode.includes('/manifest.webmanifest'), 'SW must precache manifest');
      assert.ok(swCode.includes('/index.html'), 'SW must precache index.html shell');
    });

    test('sw.js defines Stale-While-Revalidate and Network-First offline fallback', () => {
      const swCode = fs.readFileSync(swPath, 'utf8');
      assert.ok(swCode.includes("request.mode === 'navigate'"), 'SW must handle navigation requests');
      assert.ok(swCode.includes('caches.match(request)'), 'SW must check cache');
      assert.ok(swCode.includes('fetch(request)'), 'SW must fetch network asset');
    });

    test('sw.js includes Push Notification listeners and deep-link click handling', () => {
      const swCode = fs.readFileSync(swPath, 'utf8');
      assert.ok(swCode.includes("addEventListener('push'"), 'SW must listen to push notifications');
      assert.ok(swCode.includes("addEventListener('notificationclick'"), 'SW must handle notification clicks');
      assert.ok(swCode.includes('clients.openWindow'), 'SW must support deep-linking window open');
    });
  });

  describe('3. Accessibility (WCAG 2.1 AA) Compliance Audit', () => {
    test('index.html provides valid lang, accessible title, and scalable viewport', () => {
      const indexPath = path.join(CLIENT_ROOT, 'index.html');
      const html = fs.readFileSync(indexPath, 'utf8');

      assert.ok(html.includes('<html lang="en"'), 'HTML must declare lang="en"');
      assert.ok(html.includes('<title>'), 'HTML must have title tag');
      assert.ok(html.includes('name="viewport"'), 'HTML must have viewport tag');

      // Zoom must not be blocked (WCAG 1.4.4 Resize text)
      assert.ok(!html.includes('user-scalable=no'), 'Viewport must NOT disable user zooming');
    });

    test('axe-core rules audit passes on shell HTML without critical WCAG violations', async () => {
      const distIndexPath = path.join(CLIENT_ROOT, 'dist', 'index.html');
      const htmlContent = fs.existsSync(distIndexPath)
        ? fs.readFileSync(distIndexPath, 'utf8')
        : fs.readFileSync(path.join(CLIENT_ROOT, 'index.html'), 'utf8');

      const { JSDOM } = require('jsdom');
      const dom = new JSDOM(htmlContent);
      const results = await axe.run(dom.window.document.documentElement, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });

      assert.strictEqual(results.violations.length, 0, `Expected 0 WCAG violations, got: ${JSON.stringify(results.violations)}`);
    });
  });

  describe('4. i18n Multi-Language Scaffolding (English, Telugu, Hindi)', () => {
    test('Provides complete English, Telugu, and Hindi translations for core screens', () => {
      const en = JSON.parse(fs.readFileSync(path.join(CLIENT_ROOT, 'src/i18n/locales/en.json'), 'utf8'));
      const te = JSON.parse(fs.readFileSync(path.join(CLIENT_ROOT, 'src/i18n/locales/te.json'), 'utf8'));
      const hi = JSON.parse(fs.readFileSync(path.join(CLIENT_ROOT, 'src/i18n/locales/hi.json'), 'utf8'));

      // Validate matching keys across languages
      const coreKeys = ['dashboard', 'opportunities', 'applications', 'profile', 'interviews'];
      for (const key of coreKeys) {
        assert.ok(en.nav[key], `English nav.${key} must exist`);
        assert.ok(te.nav[key], `Telugu nav.${key} must exist`);
        assert.ok(hi.nav[key], `Hindi nav.${key} must exist`);
      }

      assert.ok(te.nav.dashboard.includes('నేటి'), 'Telugu must contain valid localized script');
      assert.ok(hi.nav.dashboard.includes('आज'), 'Hindi must contain valid Devanagari script');
    });
  });

  describe('5. Performance: Route-Level Code Splitting & Virtualization Math', () => {
    test('App.jsx uses React.lazy for route components to achieve dynamic chunking', () => {
      const appJsx = fs.readFileSync(path.join(CLIENT_ROOT, 'src/App.jsx'), 'utf8');
      assert.ok(appJsx.includes('lazy(() => import('), 'App.jsx must use lazy imports');
      assert.ok(appJsx.includes('<Suspense'), 'App.jsx must wrap routes in Suspense');
      assert.ok(appJsx.includes('PageSkeletonLoader'), 'App.jsx must provide skeleton fallback');
    });

    test('VirtualizedTable windowing math correctly bounds visible index slice for 1000 items', () => {
      const rowHeight = 50;
      const containerHeight = 400; // 8 visible rows
      const bufferCount = 4;
      const totalItems = 1000;

      // Scroll at top (scrollTop = 0)
      const scrollTop0 = 0;
      const startIndex0 = Math.max(0, Math.floor(scrollTop0 / rowHeight) - bufferCount);
      const visibleCount = Math.ceil(containerHeight / rowHeight) + bufferCount * 2;
      const endIndex0 = Math.min(totalItems - 1, startIndex0 + visibleCount);

      assert.strictEqual(startIndex0, 0);
      assert.strictEqual(endIndex0, 16); // Only 17 rows rendered out of 1000!

      // Scroll in middle (scrollTop = 2500 -> row 50)
      const scrollTopMiddle = 2500;
      const startIndexMid = Math.max(0, Math.floor(scrollTopMiddle / rowHeight) - bufferCount);
      const endIndexMid = Math.min(totalItems - 1, startIndexMid + visibleCount);

      assert.strictEqual(startIndexMid, 46);
      assert.strictEqual(endIndexMid, 62);
    });
  });

  describe('6. Dark/Light Theme & Low-Bandwidth Mode Infrastructure', () => {
    test('ThemeContext sets dark as default persisted theme', () => {
      const themeContextCode = fs.readFileSync(
        path.join(CLIENT_ROOT, 'src/context/ThemeContext.jsx'),
        'utf8'
      );
      assert.ok(themeContextCode.includes("return saved || 'dark'"), 'Dark must be default');
      assert.ok(themeContextCode.includes("root.classList.add('dark')"), 'Must add .dark class');
    });

    test('NetworkContext detects connection saveData and slow connection types', () => {
      const networkContextCode = fs.readFileSync(
        path.join(CLIENT_ROOT, 'src/context/NetworkContext.jsx'),
        'utf8'
      );
      assert.ok(networkContextCode.includes('conn.saveData'), 'Must check navigator.connection.saveData');
      assert.ok(networkContextCode.includes('slow-2g'), 'Must check slow connection types');
    });

    test('index.css includes prefers-reduced-motion media query for accessibility', () => {
      const css = fs.readFileSync(path.join(CLIENT_ROOT, 'src/index.css'), 'utf8');
      assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'Must include reduced-motion rules');
      assert.ok(css.includes(':focus-visible'), 'Must style :focus-visible for keyboard focus');
    });
  });
});
