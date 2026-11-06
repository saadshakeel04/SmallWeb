import { execFileSync } from 'node:child_process';

// sanitize-html depends on an ESM parser; the backend runtime can load it, while
// Jest's Node 22 VM cannot require that dependency directly. Run the assertions
// in a regular Node process so the test exercises the same module path as Nest.
const securityChecks = String.raw`
const assert = require('node:assert/strict');
const { htmlToPlainText, internalAddressFromHref, sanitizeHtmlContent } = require('./src/common/html-sanitizer');

const hostile = sanitizeHtmlContent('<main onclick="run()"><script>window.compromised = true</script><h1>Safe</h1><img src="https://outside.example/pixel" onerror="run()"><iframe src="https://outside.example"></iframe><svg><script>run()</script></svg><link rel="stylesheet" href="https://outside.example/site.css"></main>');
assert.match(hostile, /<h1>Safe<\/h1>/);
assert.doesNotMatch(hostile, /<script|<img|<iframe|<svg|<link|on(?:click|error)=|window\.compromised/i);

const links = sanitizeHtmlContent('<p><a href="PAPERBOATS.ZZ">bare address</a><a href="https://quietforest.zz">https link</a><a href="javascript:alert(1)">script link</a><a href="data:text/html,hello">data link</a><a href="https://outside.example/path">external link</a></p>');
assert.match(links, /href="https:\/\/paperboats\.zz"/);
assert.match(links, /href="https:\/\/quietforest\.zz"/);
assert.doesNotMatch(links, /javascript:|data:|outside\.example/i);
assert.equal((links.match(/href=/g) ?? []).length, 2);

assert.equal(internalAddressFromHref('https://tidepool.zz'), 'tidepool.zz');
assert.equal(internalAddressFromHref('javascript:alert(1)'), null);
assert.equal(internalAddressFromHref('https://outside.example'), null);
assert.equal(internalAddressFromHref('https://tidepool.zz/path'), null);

const sanitized = sanitizeHtmlContent('<h1>Quiet &amp; safe</h1><script>secret payload</script><p>Fresh air<br>and rain.</p>');
assert.equal(htmlToPlainText(sanitized), 'Quiet & safe\nFresh air\nand rain.');

const mongoose = require('mongoose');
const { SiteSchema } = require('./src/modules/sites/schemas/site.schema');
const SiteModel = mongoose.model('HtmlSanitizerSecurityCheck', SiteSchema);
const document = new SiteModel({
  address: 'test.zz',
  title: 'Test site',
  html: '<script>secret payload</script><p>Safe &amp; sound.</p>',
  plainText: 'untrusted supplied text',
  authorId: new mongoose.Types.ObjectId(),
});
document.validate().then(() => {
  assert.doesNotMatch(document.html, /script|secret payload/i);
  assert.equal(document.plainText, 'Safe & sound.');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

describe('HTML sanitizer security boundaries', () => {
  it('removes executable markup and unsafe resources while preserving safe prose', () => {
    expect(() =>
      execFileSync(
        process.execPath,
        ['-r', 'ts-node/register', '-e', securityChecks],
        { cwd: process.cwd(), stdio: 'pipe' },
      ),
    ).not.toThrow();
  });
});
