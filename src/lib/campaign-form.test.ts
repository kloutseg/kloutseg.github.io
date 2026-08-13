import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_LIFE_RANGE_OPTIONS,
  getCampaignLeadSizeSegment,
  getCampaignSubmissionOrigin,
} from './campaign-form';

describe('campaign form', () => {
  it('separa as faixas em torno do corte de 50 vidas', () => {
    expect(CAMPAIGN_LIFE_RANGE_OPTIONS).toEqual([
      '1–9',
      '10–29',
      '30–49',
      '50–99',
      '100–299',
      '300+',
    ]);

    expect(getCampaignLeadSizeSegment('30–49')).toBe('sb2b');
    expect(getCampaignLeadSizeSegment('50–99')).toBe('b2b50');
    expect(getCampaignLeadSizeSegment('100–299')).toBe('b2b50');
    expect(getCampaignLeadSizeSegment('300+')).toBe('b2b50');
    expect(getCampaignLeadSizeSegment('30–99')).toBe('unclassified');
    expect(getCampaignLeadSizeSegment('')).toBe('unclassified');
  });

  it('mantém a variante de reajuste na origem enviada ao Jotform', () => {
    expect(getCampaignSubmissionOrigin(
      '/empresas/custos/reajuste/',
      'b2b-custos-reajuste',
      'reajuste-sensorial',
      false,
    )).toBe('/empresas/custos/reajuste?variant=sensorial&experiment_forced=false');

    expect(getCampaignSubmissionOrigin(
      '/empresas/custos/reajuste',
      'b2b-custos-reajuste',
      'reajuste-tecnica',
      true,
    )).toBe('/empresas/custos/reajuste?variant=tecnica&experiment_forced=true');
  });
});
