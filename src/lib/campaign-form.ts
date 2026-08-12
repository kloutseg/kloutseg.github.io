const REAJUSTE_LANDING_ID = 'b2b-custos-reajuste';

export function getCampaignSubmissionOrigin(
  pathname: string,
  landingId: string,
  variantId: string,
): string {
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (landingId !== REAJUSTE_LANDING_ID) return normalizedPathname;

  const variant = variantId === 'reajuste-sensorial' ? 'sensorial' : 'tecnica';
  return `${normalizedPathname}?variant=${variant}`;
}
