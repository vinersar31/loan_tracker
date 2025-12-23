export const formatCurrency = (num) => {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(num);
};
