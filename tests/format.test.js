import { formatCurrency } from '@/utils/format';

describe('formatCurrency', () => {
  it('formats positive numbers as RON currency', () => {
    // Note: The non-breaking space (char code 160) is used by Intl.NumberFormat in many locales
    const result = formatCurrency(1234.56);
    expect(result.replace(/\s/g, ' ')).toMatch(/1\.234,56\sRON/);
  });

  it('formats negative numbers as RON currency', () => {
    const result = formatCurrency(-1234.56);
    expect(result.replace(/\s/g, ' ')).toMatch(/-1\.234,56\sRON/);
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result.replace(/\s/g, ' ')).toMatch(/0,00\sRON/);
  });
});
