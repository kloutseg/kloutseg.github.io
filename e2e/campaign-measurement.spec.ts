import { expect, test, type Page } from '@playwright/test';

const CONSENT_STORAGE_KEY = 'klout:cookie-consent';
const CONSENT_VERSION = '2026-06-22';

type Preferences = {
  analytics: boolean;
  marketing: boolean;
};

async function storeConsent(page: Page, preferences: Preferences) {
  await page.addInitScript(
    ({ key, version, value }) => {
      localStorage.setItem(key, JSON.stringify({
        version,
        savedAt: new Date().toISOString(),
        preferences: { necessary: true, ...value },
      }));
    },
    { key: CONSENT_STORAGE_KEY, version: CONSENT_VERSION, value: preferences },
  );
}

async function blockExternalAnalytics(page: Page) {
  await page.route('https://www.googletagmanager.com/**', (route) => route.abort());
  await page.route('https://static.cloudflareinsights.com/**', (route) => route.abort());
}

async function captureCampaignForm(page: Page, lifeRange: string) {
  await page.waitForFunction(() => {
    const form = document.querySelector('input[name="nome"]')?.closest('form');
    const island = form?.closest('astro-island');
    return Boolean(form && (!island || !island.hasAttribute('ssr')));
  });

  await page.evaluate(() => {
    const target = window as typeof window & { __capturedCampaignPost?: string };
    target.__capturedCampaignPost = '';
    HTMLFormElement.prototype.submit = function captureSubmit() {
      const entries = Array.from(new FormData(this).entries(), ([key, value]) => [
        key,
        String(value),
      ]);
      target.__capturedCampaignPost = new URLSearchParams(entries).toString();
    };
  });

  await page.locator('input[name="nome"]').fill('Teste QA Klout');
  await page.locator('input[name="empresa"]').fill('Empresa QA');
  await page.locator('select[name="cargo"]').selectOption({ label: 'RH / People' });
  await page.locator('select[name="faixaVidas"]').selectOption(lifeRange);
  await page.locator('input[name="email"]').fill('qa@example.com');
  await page.locator('input[name="telefone"]').fill('11999999999');
  await page.locator('form button[type="submit"]').click();
  await page.waitForFunction(() => {
    return Boolean((window as typeof window & {
      __capturedCampaignPost?: string;
    }).__capturedCampaignPost);
  });

  const raw = await page.evaluate(() => {
    return (window as typeof window & {
      __capturedCampaignPost?: string;
    }).__capturedCampaignPost || '';
  });
  return Object.fromEntries(new URLSearchParams(raw));
}

async function measurementOrder(page: Page) {
  return page.evaluate(() => {
    const dataLayer = (window as typeof window & {
      dataLayer?: Array<Record<string, unknown> | IArguments>;
    }).dataLayer || [];

    return dataLayer
      .map((item) => {
        const args = Array.from(item as IArguments);
        if (args[0] === 'consent') return 'consent:' + String(args[1]);
        return (item as Record<string, unknown>).event || 'other';
      })
      .filter((event) => {
        return String(event).startsWith('consent:')
          || event === 'gtm.js'
          || event === 'landing_variant_view';
      });
  });
}

test('envia q20/q23 como par e preserva a origem das duas teses', async ({ page }) => {
  await storeConsent(page, { analytics: true, marketing: true });
  await blockExternalAnalytics(page);

  await page.goto(
    '/empresas/beneficios/bradesco-saude'
      + '?utm_source=google&utm_medium=cpc&utm_campaign=browser_contract&gclid=GCLID-BR',
  );
  await page.waitForFunction(() => {
    return (window as typeof window & {
      dataLayer?: Array<Record<string, unknown>>;
    }).dataLayer?.some((item) => item.event === 'landing_variant_view');
  });
  await page.locator('[data-cta-key="hero_primary"]').click();
  const bradescoMeasurement = await page.evaluate(() => {
    const events = (window as typeof window & {
      dataLayer?: Array<Record<string, unknown>>;
    }).dataLayer || [];
    return {
      variantViews: events.filter((item) => item.event === 'landing_variant_view').length,
      heroClicks: events.filter((item) => {
        return item.event === 'cta_click'
          && item.landing_id === 'b2b-beneficios-bradesco-saude'
          && item.variant_id === 'bradesco-saude'
          && item.cta_key === 'hero_primary';
      }).length,
    };
  });
  expect(bradescoMeasurement).toEqual({ variantViews: 1, heroClicks: 1 });

  const bradesco = await captureCampaignForm(page, '50–99');
  expect(bradesco.q5_q5_radio3).toBe('50–99 vidas');
  expect(bradesco.q11_q11_textbox9).toBe('/empresas/beneficios/bradesco-saude');
  expect(bradesco.q22_ad_user_data_consent).toBe('granted');
  expect(bradesco.q20_q20_textbox18).toBe('GCLID-BR');
  expect(Number.isFinite(Date.parse(bradesco.q23_gclid_captured_at ?? ''))).toBe(true);

  await page.goto(
    '/empresas/custos/reajuste'
      + '?variant=sensorial&utm_source=google&utm_medium=cpc'
      + '&utm_campaign=browser_contract&gclid=GCLID-RE',
  );
  const sensorial = await captureCampaignForm(page, '100–299');
  expect(sensorial.q5_q5_radio3).toBe('100–299 vidas');
  expect(sensorial.q11_q11_textbox9).toBe(
    '/empresas/custos/reajuste?variant=sensorial&experiment_forced=true',
  );
  expect(sensorial.q22_ad_user_data_consent).toBe('granted');
  expect(sensorial.q20_q20_textbox18).toBe('GCLID-RE');
  expect(Number.isFinite(Date.parse(sensorial.q23_gclid_captured_at ?? ''))).toBe(true);

  const order = await measurementOrder(page);
  expect(order.indexOf('consent:default')).toBeLessThan(order.indexOf('consent:update'));
  expect(order.indexOf('consent:update')).toBeLessThan(order.indexOf('landing_variant_view'));
  expect(order.indexOf('consent:update')).toBeLessThan(order.indexOf('gtm.js'));
  expect(order.indexOf('gtm.js')).toBeLessThan(order.indexOf('landing_variant_view'));
});

test('não envia identificador publicitário quando marketing foi recusado', async ({ page }) => {
  await storeConsent(page, { analytics: true, marketing: false });
  await blockExternalAnalytics(page);
  await page.goto(
    '/empresas/beneficios/bradesco-saude'
      + '?utm_source=google&utm_medium=cpc&gclid=SHOULD-NOT-PERSIST',
  );

  const fields = await captureCampaignForm(page, '30–49');
  await page.waitForTimeout(600);
  await expect(page.getByText('Solicitação recebida', { exact: true })).toHaveCount(0);
  await expect(page.locator('form button[type="submit"]')).toBeDisabled();

  expect(fields.q22_ad_user_data_consent).toBe('denied');
  expect(fields).not.toHaveProperty('q20_q20_textbox18');
  expect(fields).not.toHaveProperty('q23_gclid_captured_at');
});

test('só mede a variante depois do primeiro aceite analítico', async ({ page }) => {
  await blockExternalAnalytics(page);
  await page.goto('/empresas/custos/reajuste?variant=tecnica');
  expect(await measurementOrder(page)).toEqual(['consent:default']);
  await page.waitForFunction(() => {
    const form = document.querySelector('input[name="nome"]')?.closest('form');
    const island = form?.closest('astro-island');
    return Boolean(form && (!island || !island.hasAttribute('ssr')));
  });
  await page.locator('input[name="nome"]').fill('Teste sem consentimento');
  const earlyFormStarts = await page.evaluate(() => {
    return ((window as typeof window & {
      dataLayer?: Array<Record<string, unknown>>;
    }).dataLayer || []).filter((item) => item.event === 'form_start').length;
  });
  expect(earlyFormStarts).toBe(0);

  await page.locator('[data-consent-accept]').first().click();
  await page.locator('input[name="empresa"]').fill('Empresa após consentimento');
  await page.waitForFunction(() => {
    const events = (window as typeof window & {
      dataLayer?: Array<Record<string, unknown>>;
    }).dataLayer || [];
    return events.some((item) => item.event === 'landing_variant_view')
      && events.some((item) => item.event === 'form_start');
  });

  const order = await measurementOrder(page);
  expect(order[0]).toBe('consent:default');
  expect(order[1]).toBe('consent:update');
  expect(order.at(-1)).toBe('landing_variant_view');
  expect(order.indexOf('gtm.js')).toBeLessThan(order.indexOf('landing_variant_view'));
  const formStarts = await page.evaluate(() => {
    return ((window as typeof window & {
      dataLayer?: Array<Record<string, unknown>>;
    }).dataLayer || []).filter((item) => item.event === 'form_start').length;
  });
  expect(formStarts).toBe(1);
});
