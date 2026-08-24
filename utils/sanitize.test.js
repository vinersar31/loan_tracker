import { describe, it, expect } from 'vitest';
import { escapeHtml } from './sanitize';

describe('escapeHtml', () => {
  it('should return an empty string for null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  it('should return an empty string for undefined', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should handle basic strings with no HTML characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
    expect(escapeHtml('12345')).toBe('12345');
    expect(escapeHtml('No special chars here!')).toBe('No special chars here!');
  });

  it('should escape & (ampersand)', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('&&&')).toBe('&amp;&amp;&amp;');
  });

  it('should escape < (less than)', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
    expect(escapeHtml('<<<')).toBe('&lt;&lt;&lt;');
  });

  it('should escape > (greater than)', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
    expect(escapeHtml('>>>')).toBe('&gt;&gt;&gt;');
  });

  it('should escape " (double quote)', () => {
    expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('should escape \' (single quote)', () => {
    expect(escapeHtml("It's fine")).toBe("It&#039;s fine");
  });

  it('should escape multiple HTML characters mixed together', () => {
    expect(escapeHtml('<script>alert("XSS & \'hack\'")</script>'))
      .toBe('&lt;script&gt;alert(&quot;XSS &amp; &#039;hack&#039;&quot;)&lt;/script&gt;');
  });

  it('should handle non-string primitive types by converting them to strings', () => {
    expect(escapeHtml(123)).toBe('123');
    expect(escapeHtml(0)).toBe('0');
    expect(escapeHtml(true)).toBe('true');
    expect(escapeHtml(false)).toBe('false');
  });

  it('should handle objects and arrays by converting them to strings', () => {
    expect(escapeHtml({})).toBe('[object Object]');
    expect(escapeHtml([1, 2])).toBe('1,2');
  });
});
