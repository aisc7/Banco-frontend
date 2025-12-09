export function formatCurrencyCOP(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';

  // Normalizar posibles formatos ISO (YYYY-MM-DD o con tiempo)
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!isoMatch) return value || '-';

  const [, y, m, d] = isoMatch;
  return `${d}/${m}/${y}`;
}

