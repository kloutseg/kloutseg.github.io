export const ATTRIBUTION_STORAGE_KEY = 'klout:attribution:first-touch';

const MAX_VALUE_LENGTH = 500;
const ATTRIBUTION_PARAMETERS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

type AttributionParameter = (typeof ATTRIBUTION_PARAMETERS)[number];

export type AttributionData = {
  version: 1;
  visitorId: string;
  firstLanding: string;
  firstReferrer: string;
  capturedAt: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  gclid: string;
};

type ConsentPreferences = {
  analytics?: boolean;
  marketing?: boolean;
};

type KloutConsentApi = {
  read?: () => ConsentPreferences | null;
};

function truncate(value: string): string {
  return value.trim().slice(0, MAX_VALUE_LENGTH);
}

function sanitizeReferrer(referrer: string): string {
  if (!referrer) return '';

  try {
    const url = new URL(referrer);
    return truncate(`${url.origin}${url.pathname}`);
  } catch {
    return '';
  }
}

function createVisitorId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getStoredAttribution(): AttributionData | null {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AttributionData>;
    if (parsed.version !== 1 || typeof parsed.visitorId !== 'string') return null;
    return parsed as AttributionData;
  } catch {
    return null;
  }
}

function captureAttribution(includeGclid: boolean): AttributionData {
  const params = new URLSearchParams(window.location.search);
  const campaign = Object.fromEntries(
    ATTRIBUTION_PARAMETERS.map((parameter) => [parameter, truncate(params.get(parameter) || '')]),
  ) as Record<AttributionParameter, string>;

  return {
    version: 1,
    visitorId: createVisitorId(),
    firstLanding: truncate(window.location.pathname),
    firstReferrer: sanitizeReferrer(document.referrer),
    capturedAt: new Date().toISOString(),
    ...campaign,
    gclid: includeGclid ? truncate(params.get('gclid') || '') : '',
  };
}

export function syncAttributionWithConsent(): void {
  const consent = (window as Window & { KloutConsent?: KloutConsentApi }).KloutConsent?.read?.();

  if (!consent?.analytics) {
    localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    return;
  }

  const stored = getStoredAttribution();
  if (!stored) {
    localStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(captureAttribution(Boolean(consent.marketing))),
    );
    return;
  }

  if (!consent.marketing && stored.gclid) {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify({ ...stored, gclid: '' }));
  }
}
