import test from 'node:test';
import assert from 'node:assert';
import { calculateAmortizationSchedule } from './calculations.js';

test('calculateAmortizationSchedule: Empty state', () => {
    const result = calculateAmortizationSchedule([], 1000);
    assert.deepStrictEqual(result.stats, {
        totalLoan: 1000,
        totalPaid: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        totalFees: 0,
        remaining: 1000,
        percentage: 0
    });
    assert.deepStrictEqual(result.schedule, []);
});

test('calculateAmortizationSchedule: Happy Path', () => {
    const payments = [
        { date: '2023-01-01', amount: 500, principal: 400, fees: 50 },
        { date: '2023-02-01', amount: 500, principal: 450, fees: 10 }
    ];
    const defaultLoanAmount = 1000;

    const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

    // First payment:
    // amount = 500, principal = 400, fees = 50, interest = 500 - 400 - 50 = 50
    // remainingBalance = 1000 - 400 = 600
    assert.strictEqual(result.schedule[0].interest, 50);
    assert.strictEqual(result.schedule[0].remainingBalance, 600);

    // Second payment:
    // amount = 500, principal = 450, fees = 10, interest = 500 - 450 - 10 = 40
    // remainingBalance = 600 - 450 = 150
    assert.strictEqual(result.schedule[1].interest, 40);
    assert.strictEqual(result.schedule[1].remainingBalance, 150);

    // Stats:
    assert.deepStrictEqual(result.stats, {
        totalLoan: 1000,
        totalPaid: 1000,
        totalPrincipal: 850,
        totalInterest: 90,
        totalFees: 60,
        remaining: 150,
        percentage: 85 // ((1000 - 150) / 1000) * 100
    });
});

test('calculateAmortizationSchedule: Sorting by date', () => {
    const payments = [
        { date: '2023-02-01', amount: 500, principal: 450, fees: 10 },
        { date: '2023-01-01', amount: 500, principal: 400, fees: 50 }
    ];
    const defaultLoanAmount = 1000;

    const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

    // The payment from '2023-01-01' should be first
    assert.strictEqual(result.schedule[0].date, '2023-01-01');
    assert.strictEqual(result.schedule[0].principal, 400);
    assert.strictEqual(result.schedule[1].date, '2023-02-01');
    assert.strictEqual(result.schedule[1].principal, 450);
});

test('calculateAmortizationSchedule: Edge Case (Zero balance flooring)', () => {
    const payments = [
        { date: '2023-01-01', amount: 1500, principal: 1200, fees: 100 }
    ];
    const defaultLoanAmount = 1000;

    const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

    // Remaining balance shouldn't go below 0
    assert.strictEqual(result.schedule[0].remainingBalance, 0);
    assert.strictEqual(result.stats.remaining, 0);

    // But other stats should be calculated exactly as input
    assert.strictEqual(result.stats.totalPrincipal, 1200);
    assert.strictEqual(result.stats.percentage, 100);
});

test('calculateAmortizationSchedule: Falsy/NaN inputs handling', () => {
    const payments = [
        { date: '2023-01-01' } // missing amount, principal, fees
    ];
    const defaultLoanAmount = 1000;

    const result = calculateAmortizationSchedule(payments, defaultLoanAmount);

    // They should default to 0
    assert.strictEqual(result.schedule[0].amount, 0);
    assert.strictEqual(result.schedule[0].principal, 0);
    assert.strictEqual(result.schedule[0].fees, 0);
    assert.strictEqual(result.schedule[0].interest, 0);
    assert.strictEqual(result.schedule[0].remainingBalance, 1000);

    assert.deepStrictEqual(result.stats, {
        totalLoan: 1000,
        totalPaid: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        totalFees: 0,
        remaining: 1000,
        percentage: 0
    });
});
