import { test, expect } from '@playwright/test';

test.describe('Página Inicial', () => {
  test('deve carregar a página inicial com sucesso', async ({ page }) => {
    await page.goto('/');
    
    // Verificar título da página
    await expect(page).toHaveTitle(/Página Inicial/);
  });

  test('deve renderizar a navbar', async ({ page }) => {
    await page.goto('/');
    
    const navbar = page.locator('.floating-navbar');
    await expect(navbar).toBeVisible();
  });

  test('deve renderizar a Hero Section', async ({ page }) => {
    await page.goto('/');
    
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    
    // Verificar headline
    const headline = page.locator('.hero-headline');
    await expect(headline).toBeVisible();
    await expect(headline).toContainText('Inteligência');
  });

  test('deve ter smooth scroll com Lenis', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se Lenis está inicializado
    const lenisInitialized = await page.evaluate(() => {
      return typeof (window as any).lenisInstance !== 'undefined';
    });
    
    expect(lenisInitialized).toBe(true);
  });

  test('deve navegar para seção de consulting via smooth scroll', async ({ page }) => {
    await page.goto('/');
    
    // Clicar no link de consulting na navbar
    const consultingLink = page.locator('a[href="#consulting"]').first();
    await consultingLink.click();
    
    // Aguardar scroll e verificar se a seção está visível
    const consultingSection = page.locator('#consulting');
    await expect(consultingSection).toBeVisible();
  });

  test('deve mostrar botão de voltar ao topo após scroll', async ({ page }) => {
    await page.goto('/');
    
    // Scroll para baixo
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    
    // Verificar botão de back to top
    const backToTopButton = page.locator('.back-to-top.visible');
    await expect(backToTopButton).toBeVisible();
  });

  test('deve abrir e fechar menu mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.goto('/');
    
    // Abrir menu
    const menuToggle = page.locator('.menu-toggle-mobile');
    await menuToggle.click();
    
    // Verificar menu aberto
    const overlayMenu = page.locator('.overlay-menu.active');
    await expect(overlayMenu).toBeVisible();
    
    // Fechar menu
    const closeBtn = page.locator('.close-btn');
    await closeBtn.click();
    
    // Verificar menu fechado
    await expect(overlayMenu).not.toBeVisible();
  });

  test('deve navegar com teclado (Escape fecha menu)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Abrir menu
    const menuToggle = page.locator('.menu-toggle-mobile');
    await menuToggle.click();
    
    // Fechar com Escape
    await page.keyboard.press('Escape');
    
    // Verificar menu fechado
    const overlayMenu = page.locator('.overlay-menu');
    await expect(overlayMenu).not.toBeVisible();
  });

  test('deve ter acessibilidade básica', async ({ page }) => {
    await page.goto('/');
    
    // Verificar skip link
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeVisible();
    
    // Verificar aria-labels na navbar
    const navbar = page.locator('nav[aria-label="Menu principal"]');
    await expect(navbar).toBeVisible();
    
    // Verificar botões com aria-label
    const menuButton = page.locator('button[aria-label="Abrir menu de navegação"]');
    await expect(menuButton).toBeVisible();
  });
});
