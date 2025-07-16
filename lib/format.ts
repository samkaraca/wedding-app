export const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('tr-TR')} ₺`;
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
};