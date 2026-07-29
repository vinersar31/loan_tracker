export const calculateAmortizationSchedule = (payments, defaultLoanAmount) => {
    // Sort payments by date ASCENDING for calculation
    const sortedPayments = [...payments].sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentBalance = defaultLoanAmount;
    let totalPaid = 0;
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalFees = 0;

    const calculatedSchedule = sortedPayments.map(payment => {
        const principal = parseFloat(payment.principal || 0);
        const amount = parseFloat(payment.amount || 0);
        const fees = parseFloat(payment.fees || 0);

        // Calculate interest based on domain rules (amount - principal - fees)
        const interest = amount - principal - fees;

        currentBalance -= principal;
        if (currentBalance < 0) currentBalance = 0;

        totalPaid += amount;
        totalPrincipal += principal;
        totalInterest += interest;
        totalFees += fees;

        return {
            ...payment,
            amount,
            principal,
            interest,
            fees,
            remainingBalance: currentBalance
        };
    });

    return {
        schedule: calculatedSchedule,
        stats: {
            totalLoan: defaultLoanAmount,
            totalPaid,
            totalPrincipal,
            totalInterest,
            totalFees,
            remaining: currentBalance,
            percentage: Math.min(100, ((defaultLoanAmount - currentBalance) / defaultLoanAmount) * 100)
        }
    };
};
