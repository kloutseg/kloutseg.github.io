import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import type { Component } from 'svelte';
import Footer from './Footer.svelte';

describe('Componentes Sem Lógica', () => {
  describe('Footer', () => {
    it('deve renderizar um footer', () => {
      // Astro adds client-directive props to .svelte imports at type level;
      // at runtime this remains a standard Svelte component.
      const { container } = render(Footer as unknown as Component);

      const footer = container.querySelector('footer[data-dark-section]');
      expect(footer).toBeInTheDocument();
    });
  });
});
