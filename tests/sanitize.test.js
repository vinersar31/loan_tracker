import { escapeHtml } from '@/utils/sanitize';

describe('escapeHtml', () => {
  it('escapes standard html characters', () => {
    expect(escapeHtml('<script>alert("test")</script>')).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
  });

  it('handles strings without html characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('handles empty strings', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('escapes single quotes and ampersands', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#039;s');
  });
});
