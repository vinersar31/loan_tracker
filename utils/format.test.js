import { formatCurrency } from './format';

describe('formatCurrency', () => {
    // Helper function to normalize non-breaking spaces for testing
    const normalizeSpace = (str) => str.replace(/\u00A0/g, ' ');

    it('formats a positive number correctly', () => {
        expect(normalizeSpace(formatCurrency(1000))).toBe('1.000,00 RON');
    });

    it('formats zero correctly', () => {
        expect(normalizeSpace(formatCurrency(0))).toBe('0,00 RON');
    });

    it('formats a negative number correctly', () => {
        expect(normalizeSpace(formatCurrency(-50.5))).toBe('-50,50 RON');
    });

    it('handles decimal values', () => {
        expect(normalizeSpace(formatCurrency(1234.56))).toBe('1.234,56 RON');
    });

    it('defaults to 0 when input is null', () => {
        expect(normalizeSpace(formatCurrency(null))).toBe('0,00 RON');
    });

    it('defaults to 0 when input is undefined', () => {
        expect(normalizeSpace(formatCurrency(undefined))).toBe('0,00 RON');
    });
});
