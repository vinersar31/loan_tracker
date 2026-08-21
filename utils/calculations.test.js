import { describe, it, expect } from 'vitest';
import { calculateAmortizationSchedule } from './calculations';

describe('calculateAmortizationSchedule', () => {
    it('should handle an empty payments list', () => {
        const defaultLoanAmount = 100000;
        const result = calculateAmortizationSchedule([], defaultLoanAmount);

        expect(result.schedule).toEqual([]);
        expect(result.stats).toEqual({
            totalLoan: 100000,
            totalPaid: 0,
            totalPrincipal: 0,
            totalInterest: 0,
            totalFees: 0,
            remaining: 100000,
            percentage: 0
        });
    });

    it('should correctly calculate domain rules for a single payment', () => {
        const defaultLoanAmount = 100000;
        const payments = [
            {
                id: '1',
                date: '2024-01-01',
                amount: 1500,
                principal: 1000,
                fees: 50
            }
        ];

        const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

        expect(result.schedule).toHaveLength(1);
        expect(result.schedule[0].interest).toBe(450); // 1500 - 1000 - 50 = 450
        expect(result.schedule[0].remainingBalance).toBe(99000); // 100000 - 1000

        expect(result.stats).toEqual({
            totalLoan: 100000,
            totalPaid: 1500,
            totalPrincipal: 1000,
            totalInterest: 450,
            totalFees: 50,
            remaining: 99000,
            percentage: 1
        });
    });

    it('should correctly handle multiple payments and sort by date', () => {
        const defaultLoanAmount = 100000;
        const payments = [
            { id: '2', date: '2024-02-01', amount: 1500, principal: 1100, fees: 0 },
            { id: '1', date: '2024-01-01', amount: 1500, principal: 1000, fees: 50 }
        ];

        const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

        // Ensure sorting happened (1st should be Jan)
        expect(result.schedule[0].id).toBe('1');
        expect(result.schedule[0].remainingBalance).toBe(99000);

        expect(result.schedule[1].id).toBe('2');
        expect(result.schedule[1].interest).toBe(400); // 1500 - 1100 - 0 = 400
        expect(result.schedule[1].remainingBalance).toBe(97900); // 99000 - 1100

        expect(result.stats).toEqual({
            totalLoan: 100000,
            totalPaid: 3000,
            totalPrincipal: 2100, // 1000 + 1100
            totalInterest: 850,   // 450 + 400
            totalFees: 50,
            remaining: 97900,
            percentage: 2.1
        });
    });

    it('should default missing properties to 0', () => {
        const defaultLoanAmount = 100000;
        const payments = [
            { id: '1', date: '2024-01-01' } // Missing amount, principal, fees
        ];

        const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

        expect(result.schedule[0]).toEqual({
            id: '1',
            date: '2024-01-01',
            amount: 0,
            principal: 0,
            fees: 0,
            interest: 0,
            remainingBalance: 100000
        });

        expect(result.stats.remaining).toBe(100000);
        expect(result.stats.totalPaid).toBe(0);
    });

    it('should not allow remaining balance to drop below 0', () => {
        const defaultLoanAmount = 1000;
        const payments = [
            { id: '1', date: '2024-01-01', amount: 1500, principal: 1500, fees: 0 }
        ];

        const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

        expect(result.schedule[0].remainingBalance).toBe(0);
        expect(result.stats.remaining).toBe(0);
        expect(result.stats.percentage).toBe(100);
    });
});
