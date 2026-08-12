const REAJUSTE_LANDING_ID = 'b2b-custos-reajuste';

export function getCampaignSubmissionOrigin(
  pathname: string,
  landingId: string,
  variantId: string,
): string {
  if (landingId !== REAJUSTE_LANDING_ID) return pathname;

  const variant = variantId === 'reajuste-sensorial' ? 'sensorial' : 'tecnica';
  return `${pathname}?variant=${variant}`;
}
