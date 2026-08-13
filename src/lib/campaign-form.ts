const REAJUSTE_LANDING_ID = 'b2b-custos-reajuste';

export const CAMPAIGN_LIFE_RANGE_OPTIONS = [
  '1–9',
  '10–29',
  '30–49',
  '50–99',
  '100–299',
  '300+',
] as const;

export type CampaignLifeRange = (typeof CAMPAIGN_LIFE_RANGE_OPTIONS)[number];
export type CampaignLeadSizeSegment = 'sb2b' | 'b2b50' | 'unclassified';

export function getCampaignLeadSizeSegment(
  lifeRange: string,
): CampaignLeadSizeSegment {
  if (lifeRange === '1–9' || lifeRange === '10–29' || lifeRange === '30–49') {
    return 'sb2b';
  }

  if (lifeRange === '50–99' || lifeRange === '100–299' || lifeRange === '300+') {
    return 'b2b50';
  }

  return 'unclassified';
}

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
