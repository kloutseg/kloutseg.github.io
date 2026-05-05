import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import TestSection from './home/TestSection.svelte';
import Footer from './Footer.svelte';

describe('Componentes Sem Lógica', () => {
  describe('TestSection', () => {
    it('deve renderizar uma section com data-stack-section', () => {
      const { container } = render(TestSection);

      const section = container.querySelector('section[data-stack-section]');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('deve renderizar um footer', () => {
      const { container } = render(Footer);

      const footer = container.querySelector('footer[data-stack-section]');
      expect(footer).toBeInTheDocument();
    });
  });
});
