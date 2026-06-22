<script lang="ts">
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { prefersReducedMotion } from '../../lib/reducedMotion';
  import {
    validateNome,
    validateTelefone,
    validateEmail,
    validatePlanoSaude,
    validateBeneficiarios,
    validateInvestimento,
    formatTelefone
  } from '../../lib/form-validation';
  import type { FieldValidation } from '../../lib/form-store';
  import { getStoredAttribution } from '../../lib/attribution';
  import ProgressBar from './ProgressBar.svelte';
  import StepTypeSelector from './StepTypeSelector.svelte';
  import StepName from './StepName.svelte';
  import StepContact from './StepContact.svelte';
  import StepCNPJ from './StepCNPJ.svelte';
  import StepQualification from './StepQualification.svelte';
  import StepBeneficiarios from './StepBeneficiarios.svelte';
  import StepB2bIdentificacao from './StepB2bIdentificacao.svelte';
  import StepB2bInformacoes from './StepB2bInformacoes.svelte';
  import StepB2bContrato from './StepB2bContrato.svelte';

  gsap.registerPlugin(ScrollTrigger);
  const reducedMotion = prefersReducedMotion();
  const JOTFORM_B2C_FORM_ID = import.meta.env.PUBLIC_JOTFORM_B2C_FORM_ID || '261337164438055';
  const JOTFORM_B2B_FORM_ID = import.meta.env.PUBLIC_JOTFORM_B2B_FORM_ID || '261337328053050';

  // ═══════════════════════════════════════════
  // FORM TYPE & STATE
  // ═══════════════════════════════════════════

  let formType = $state<'b2c' | 'b2b' | null>(null);
  let currentStep = $state(0);
  let isSubmitting = $state(false);

  // totalSteps = 1 (selector) + flow steps
  const b2cFlowSteps = 5;
  const b2bFlowSteps = 3;
  let totalSteps = $derived(formType === 'b2c' ? 1 + b2cFlowSteps : formType === 'b2b' ? 1 + b2bFlowSteps : 1);

  // ═══════════════════════════════════════════
  // B2C DATA
  // ═══════════════════════════════════════════

  let nomeData = $state({ nome: '' });
  let nomeValidation = $state({ nome: { touched: false, error: '' } as FieldValidation });

  let contactData = $state({ telefone: '', email: '' });
  let contactValidation = $state({
    telefone: { touched: false, error: '' } as FieldValidation,
    email: { touched: false, error: '' } as FieldValidation
  });

  let cnpjData = $state({ temCnpj: null as boolean | 'later' | null, cnpjNumero: '', cnpjCidade: '', cnpjUf: '' });
  let cnpjValidation = $state({
    cnpjNumero: { touched: false, error: '' } as FieldValidation,
    cnpjCidade: { touched: false, error: '' } as FieldValidation,
    cnpjUf: { touched: false, error: '' } as FieldValidation
  });

  let apoliceData = $state({ planoSaude: '', investimentoMensal: '' });
  let apoliceValidation = $state({
    planoSaude: { touched: false, error: '' } as FieldValidation,
    investimentoMensal: { touched: false, error: '' } as FieldValidation
  });

  let beneficiariosData = $state({ numBeneficiarios: '' as number | string, idadesBeneficiarios: [] as number[] });
  let beneficiariosValidation = $state({
    numBeneficiarios: { touched: false, error: '' } as FieldValidation,
    idadesBeneficiarios: { touched: false, error: '' } as FieldValidation
  });

  // ═══════════════════════════════════════════
  // B2B DATA
  // ═══════════════════════════════════════════

  let b2bIdentificacao = $state({ nomeInterlocutor: '', telefone: '', email: '', cargo: '' });
  let b2bIdentificacaoValidation = $state({
    nomeInterlocutor: { touched: false, error: '' } as FieldValidation,
    telefone: { touched: false, error: '' } as FieldValidation,
    email: { touched: false, error: '' } as FieldValidation,
    cargo: { touched: false, error: '' } as FieldValidation
  });

  let b2bInformacoes = $state({ cnpj: '', razaoSocial: '', site: '', cidade: '', uf: '' });
  let b2bInformacoesValidation = $state({
    cnpj: { touched: false, error: '' } as FieldValidation,
    razaoSocial: { touched: false, error: '' } as FieldValidation,
    site: { touched: false, error: '' } as FieldValidation,
    cidade: { touched: false, error: '' } as FieldValidation,
    uf: { touched: false, error: '' } as FieldValidation
  });

  let b2bContrato = $state({ temPlanoSaude: null as boolean | null, operadoraPlano: '', numVidas: '' as number | string });
  let b2bContratoValidation = $state({
    operadoraPlano: { touched: false, error: '' } as FieldValidation,
    numVidas: { touched: false, error: '' } as FieldValidation
  });

  // DOM refs
  let formContainer: HTMLElement | null = null;
  let stepsWrapper: HTMLElement | null = null;
  let logoLink: HTMLElement | null = null;
  let backButton: HTMLElement | null = null;

  // ═══════════════════════════════════════════
  // FORM TYPE SELECTION
  // ═══════════════════════════════════════════

  function handleTypeSelect(type: 'b2c' | 'b2b') {
    formType = type;
    currentStep = 1;
    setTimeout(() => {
      focusFirstInput(1);
      updateSpacerHeight();
    }, 150);
  }

  function updateSpacerHeight() {
    return;
  }

  $effect(() => {
    if (typeof window === 'undefined') return;

    const syncHeight = () => {
      requestAnimationFrame(() => updateSpacerHeight());
    };

    syncHeight();
    window.addEventListener('resize', syncHeight);
    return () => window.removeEventListener('resize', syncHeight);
  });

  // ═══════════════════════════════════════════
  // B2C HANDLERS
  // ═══════════════════════════════════════════

  function validateNomeCompleto(value: string): string {
    if (!value.trim()) return 'Por favor, informe seu nome completo';
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return 'Por favor, informe seu nome completo (nome e sobrenome).';
    if (words[0].length < 3) return 'Nome muito curto (mínimo 3 caracteres).';
    if (words[words.length - 1].length < 2) return 'Sobrenome muito curto (mínimo 2 caracteres).';
    return '';
  }

  function handleNomeInput(value: string) {
    nomeData.nome = value;
    if (nomeValidation.nome.touched) nomeValidation.nome.error = validateNomeCompleto(value);
  }

  function handleNomeBlur() {
    nomeValidation.nome.touched = true;
    nomeValidation.nome.error = validateNomeCompleto(nomeData.nome);
  }

  function handleContactInput(field: 'telefone' | 'email', value: string) {
    if (field === 'telefone') contactData[field] = formatTelefone(value);
    else contactData[field] = value;
    if (contactValidation[field].touched) {
      contactValidation[field].error = field === 'telefone' ? validateTelefone(value) : validateEmail(value);
    }
  }

  function handleContactBlur(field: 'telefone' | 'email') {
    contactValidation[field].touched = true;
    contactValidation[field].error = field === 'telefone' ? validateTelefone(contactData.telefone) : validateEmail(contactData.email);
  }

  function handleCnpjUpdate(field: string, value: any) {
    if (field.startsWith('validation_')) {
      cnpjValidation[field.replace('validation_', '') as keyof typeof cnpjValidation] = value;
    } else {
      (cnpjData as any)[field] = value;
    }
  }

  function handleApoliceUpdate(field: string, value: any) {
    if (field.startsWith('validation_')) {
      apoliceValidation[field.replace('validation_', '') as keyof typeof apoliceValidation] = value;
    } else {
      (apoliceData as any)[field] = value;
    }
  }

  function handleBeneficiariosUpdate(field: string, value: any) {
    if (field.startsWith('validation_')) {
      beneficiariosValidation[field.replace('validation_', '') as keyof typeof beneficiariosValidation] = value;
    } else {
      (beneficiariosData as any)[field] = value;
    }
  }

  // ═══════════════════════════════════════════
  // B2B HANDLERS
  // ═══════════════════════════════════════════

  function validateCargo(value: string): string {
    if (!value.trim()) return 'Informe seu cargo';
    if (value.trim().length < 3) return 'Cargo muito curto (mínimo 3 caracteres)';
    return '';
  }

  function handleB2bIdentificacaoInput(field: string, value: string) {
    (b2bIdentificacao as any)[field] = field === 'telefone' ? formatTelefone(value) : value;
    if (b2bIdentificacaoValidation[field as keyof typeof b2bIdentificacaoValidation]?.touched) {
      if (field === 'nomeInterlocutor') b2bIdentificacaoValidation[field].error = validateNome(value);
      else if (field === 'telefone') b2bIdentificacaoValidation[field].error = validateTelefone(value);
      else if (field === 'email') b2bIdentificacaoValidation[field].error = validateEmail(value);
      else if (field === 'cargo') b2bIdentificacaoValidation[field].error = validateCargo(value);
    }
  }

  function handleB2bIdentificacaoBlur(field: string) {
    b2bIdentificacaoValidation[field as keyof typeof b2bIdentificacaoValidation].touched = true;
    if (field === 'nomeInterlocutor') b2bIdentificacaoValidation[field].error = validateNome(b2bIdentificacao.nomeInterlocutor);
    else if (field === 'telefone') b2bIdentificacaoValidation[field].error = validateTelefone(b2bIdentificacao.telefone);
    else if (field === 'email') b2bIdentificacaoValidation[field].error = validateEmail(b2bIdentificacao.email);
    else if (field === 'cargo') b2bIdentificacaoValidation[field].error = validateCargo(b2bIdentificacao.cargo);
  }

  function handleB2bInformacoesUpdate(field: string, value: any) {
    if (field.startsWith('validation_')) {
      b2bInformacoesValidation[field.replace('validation_', '') as keyof typeof b2bInformacoesValidation] = value;
    } else {
      (b2bInformacoes as any)[field] = value;
    }
  }

  function handleB2bContratoUpdate(field: string, value: any) {
    if (field.startsWith('validation_')) {
      b2bContratoValidation[field.replace('validation_', '') as keyof typeof b2bContratoValidation] = value;
    } else {
      (b2bContrato as any)[field] = value;
    }
  }

  // ═══════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════

  async function goToNextStep() {
    // ── TYPE SELECTOR (step 0) ──
    if (currentStep === 0) return; // no validation, selection is instant

    if (formType === 'b2c') {
      const b2cStep = currentStep - 1; // 0-based within B2C flow

      if (b2cStep === 0) {
        nomeValidation.nome.touched = true;
        nomeValidation.nome.error = validateNomeCompleto(nomeData.nome);
        if (nomeValidation.nome.error) return;
      }
      if (b2cStep === 1) {
        contactValidation.telefone.touched = true;
        contactValidation.email.touched = true;
        contactValidation.telefone.error = validateTelefone(contactData.telefone);
        contactValidation.email.error = validateEmail(contactData.email);
        if (contactValidation.telefone.error || contactValidation.email.error) return;
      }
      if (b2cStep === 2) {
        if (cnpjData.temCnpj === true) {
          cnpjValidation.cnpjNumero.touched = true;
          cnpjValidation.cnpjCidade.touched = true;
          cnpjValidation.cnpjUf.touched = true;
          cnpjValidation.cnpjNumero.error = cnpjData.cnpjNumero.trim() && cnpjData.cnpjNumero.replace(/\D/g, '').length !== 14 ? 'CNPJ incompleto' : '';
          cnpjValidation.cnpjCidade.error = '';
          cnpjValidation.cnpjUf.error = '';
          if (cnpjValidation.cnpjNumero.error || cnpjValidation.cnpjCidade.error || cnpjValidation.cnpjUf.error) return;
        }
      }
      if (b2cStep === 3) {
        apoliceValidation.planoSaude.touched = true;
        apoliceValidation.investimentoMensal.touched = true;
        apoliceValidation.planoSaude.error = validatePlanoSaude(apoliceData.planoSaude);
        apoliceValidation.investimentoMensal.error = validateInvestimento(apoliceData.investimentoMensal);
        if (apoliceValidation.planoSaude.error || apoliceValidation.investimentoMensal.error) return;
      }
      if (b2cStep === 4) {
        beneficiariosValidation.numBeneficiarios.touched = true;
        beneficiariosValidation.numBeneficiarios.error = validateBeneficiarios(beneficiariosData.numBeneficiarios);
        beneficiariosValidation.idadesBeneficiarios.error = '';
        if (beneficiariosValidation.numBeneficiarios.error || beneficiariosValidation.idadesBeneficiarios.error) return;
        isSubmitting = true;
        await submitForm();
        isSubmitting = false;
      }

      if (b2cStep < b2cFlowSteps - 1) {
        await transitionToStep(currentStep + 1, 'forward');
      }

    } else if (formType === 'b2b') {
      const b2bStep = currentStep - 1; // 0-based within B2B flow

      if (b2bStep === 0) {
        b2bIdentificacaoValidation.nomeInterlocutor.touched = true;
        b2bIdentificacaoValidation.telefone.touched = true;
        b2bIdentificacaoValidation.email.touched = true;
        b2bIdentificacaoValidation.cargo.touched = true;
        b2bIdentificacaoValidation.nomeInterlocutor.error = validateNome(b2bIdentificacao.nomeInterlocutor);
        b2bIdentificacaoValidation.telefone.error = validateTelefone(b2bIdentificacao.telefone);
        b2bIdentificacaoValidation.email.error = validateEmail(b2bIdentificacao.email);
        b2bIdentificacaoValidation.cargo.error = validateCargo(b2bIdentificacao.cargo);
        if (Object.values(b2bIdentificacaoValidation).some(v => v.error)) return;
      }
      if (b2bStep === 1) {
        b2bInformacoesValidation.cnpj.touched = true;
        b2bInformacoesValidation.razaoSocial.touched = true;
        b2bInformacoesValidation.cidade.touched = true;
        b2bInformacoesValidation.uf.touched = true;
        b2bInformacoesValidation.cnpj.error = b2bInformacoes.cnpj.replace(/\D/g, '').length === 14 ? '' : 'CNPJ incompleto';
        b2bInformacoesValidation.razaoSocial.error = b2bInformacoes.razaoSocial.trim() ? '' : 'Informe a razão social';
        b2bInformacoesValidation.cidade.error = b2bInformacoes.cidade.trim() ? '' : 'Informe a cidade';
        b2bInformacoesValidation.uf.error = b2bInformacoes.uf ? '' : 'Selecione a UF';
        if (b2bInformacoes.site.trim()) {
          try { new URL(b2bInformacoes.site.trim().startsWith('http') ? b2bInformacoes.site.trim() : `https://${b2bInformacoes.site.trim()}`); }
          catch { b2bInformacoesValidation.site.error = 'Formato de URL inválido'; }
        }
        if (Object.values(b2bInformacoesValidation).some(v => v.error)) return;
      }
      if (b2bStep === 2) {
        if (b2bContrato.temPlanoSaude === true) {
          b2bContratoValidation.operadoraPlano.touched = true;
          b2bContratoValidation.operadoraPlano.error = b2bContrato.operadoraPlano.trim() ? '' : 'Informe a operadora';
          if (b2bContratoValidation.operadoraPlano.error) return;
        }
        b2bContratoValidation.numVidas.touched = true;
        const numVidas = typeof b2bContrato.numVidas === 'string' ? parseInt(b2bContrato.numVidas, 10) : b2bContrato.numVidas;
        b2bContratoValidation.numVidas.error = (numVidas && numVidas >= 1) ? '' : 'Informe o número de vidas';
        if (b2bContratoValidation.numVidas.error) return;

        isSubmitting = true;
        await submitForm();
        isSubmitting = false;
      }

      if (b2bStep < b2bFlowSteps - 1) {
        await transitionToStep(currentStep + 1, 'forward');
      }
    }
  }

  async function goToPrevStep() {
    if (currentStep > 1) {
      await transitionToStep(currentStep - 1, 'backward');
    } else if (currentStep === 1) {
      formType = null;
      currentStep = 0;
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
      setTimeout(() => updateSpacerHeight(), 50);
    }
  }

  async function transitionToStep(targetStep: number, direction: 'forward' | 'backward' = 'forward') {
    currentStep = targetStep;
    focusFirstInput(targetStep);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  function focusFirstInput(step: number) {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const steps = stepsWrapper?.querySelectorAll('.step-wrapper');
      if (!steps || !steps[step]) return;
      const firstInput = steps[step].querySelector('input:not([type="hidden"]), button[type="button"]') as HTMLElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  async function submitForm() {
    let allData: any;

    if (formType === 'b2c') {
      allData = {
        type: 'b2c',
        nome: nomeData.nome,
        email: contactData.email,
        telefone: contactData.telefone,
        temCnpj: cnpjData.temCnpj,
        cnpjNumero: cnpjData.cnpjNumero,
        cnpjCidade: cnpjData.cnpjCidade,
        cnpjUf: cnpjData.cnpjUf,
        planoSaude: apoliceData.planoSaude,
        numBeneficiarios: beneficiariosData.numBeneficiarios,
        idadesBeneficiarios: beneficiariosData.idadesBeneficiarios,
        investimentoMensal: apoliceData.investimentoMensal
      };
    } else {
      allData = {
        type: 'b2b',
        nomeInterlocutor: b2bIdentificacao.nomeInterlocutor,
        telefone: b2bIdentificacao.telefone,
        email: b2bIdentificacao.email,
        cargo: b2bIdentificacao.cargo,
        cnpj: b2bInformacoes.cnpj,
        razaoSocial: b2bInformacoes.razaoSocial,
        site: b2bInformacoes.site,
        cidade: b2bInformacoes.cidade,
        uf: b2bInformacoes.uf,
        temPlanoSaude: b2bContrato.temPlanoSaude,
        operadoraPlano: b2bContrato.operadoraPlano,
        numVidas: b2bContrato.numVidas
      };
    }

    console.log('Submitting lead data:', allData);
    await submitToJotform(allData);

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('lead_form_data', JSON.stringify(allData));
    }
    if (typeof window !== 'undefined') {
      const transitionNavigate = (window as Window & {
        __kloutNavigate?: (href: string, options?: { replace?: boolean }) => void;
      }).__kloutNavigate;

      if (typeof transitionNavigate === 'function') {
        transitionNavigate('/obrigado');
      } else {
        window.location.href = '/obrigado';
      }
    }
  }

  function splitFullName(value: string) {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { first: parts[0] || '', last: '' };
    return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
  }

  function booleanChoice(value: boolean | 'later' | null | undefined) {
    if (value === true) return 'Sim';
    if (value === false) return 'Não';
    if (value === 'later') return 'Prefiro informar depois.';
    return '';
  }

  function formatIdades(idades: number[]) {
    const filledAges = idades.filter((idade) => Number.isInteger(idade) && idade >= 0);
    if (!filledAges.length) return 'Prefiro informar depois.';
    return filledAges.map((idade, index) => `${index + 1}: ${idade} anos`).join('\n');
  }

  function addJotformField(form: HTMLFormElement, name: string, value: string | number | boolean | null | undefined) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
  }

  function addAttributionFields(form: HTMLFormElement, type: 'b2c' | 'b2b') {
    const attribution = getStoredAttribution();
    if (!attribution) return;

    if (type === 'b2c') {
      addJotformField(form, 'q19_visitor_id', attribution.visitorId);
      addJotformField(form, 'q20_insiraUma20', attribution.firstLanding);
      addJotformField(form, 'q21_insiraUma21', attribution.firstReferrer);
      addJotformField(form, 'q22_insiraUma22', attribution.utm_source);
      addJotformField(form, 'q23_insiraUma23', attribution.utm_medium);
      addJotformField(form, 'q24_insiraUma24', attribution.utm_campaign);
      addJotformField(form, 'q25_insiraUma25', attribution.utm_content);
      addJotformField(form, 'q26_insiraUma26', attribution.utm_term);
      addJotformField(form, 'q27_insiraUma27', attribution.gclid);
      return;
    }

    addJotformField(form, 'q17_visitor_id', attribution.visitorId);
    addJotformField(form, 'q18_first_landing', attribution.firstLanding);
    addJotformField(form, 'q19_first_referrer', attribution.firstReferrer);
    addJotformField(form, 'q20_utm_source', attribution.utm_source);
    addJotformField(form, 'q21_utm_medium', attribution.utm_medium);
    addJotformField(form, 'q22_utm_campaign', attribution.utm_campaign);
    addJotformField(form, 'q23_utm_content', attribution.utm_content);
    addJotformField(form, 'q24_utm_term', attribution.utm_term);
    addJotformField(form, 'q25_gclid', attribution.gclid);
  }

  function submitToJotform(data: any) {
    if (typeof document === 'undefined') return Promise.resolve();

    return new Promise<void>((resolve) => {
      const formId = data.type === 'b2b' ? JOTFORM_B2B_FORM_ID : JOTFORM_B2C_FORM_ID;
      const iframeName = `jotform-submit-${formId}-${Date.now()}`;
      const iframe = document.createElement('iframe');
      const form = document.createElement('form');

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        form.remove();
        setTimeout(() => iframe.remove(), 500);
        resolve();
      };

      iframe.name = iframeName;
      iframe.style.display = 'none';
      iframe.onload = finish;

      form.method = 'post';
      form.action = `https://submit.jotform.com/submit/${formId}`;
      form.target = iframeName;
      form.acceptCharset = 'utf-8';
      form.style.display = 'none';

      addJotformField(form, 'formID', formId);
      addJotformField(form, 'simple_spc', `${formId}-${formId}`);
      addJotformField(form, 'website', '');
      addJotformField(form, 'submitSource', 'site-klout');
      addAttributionFields(form, data.type);

      if (data.type === 'b2c') {
        const name = splitFullName(data.nome);
        addJotformField(form, 'q3_nome[first]', name.first);
        addJotformField(form, 'q3_nome[last]', name.last);
        addJotformField(form, 'q4_email', data.email);
        addJotformField(form, 'q5_telefone[full]', data.telefone);
        addJotformField(form, 'q8_temCnpj', booleanChoice(data.temCnpj));
        addJotformField(form, 'q9_cnpj', data.cnpjNumero);
        addJotformField(form, 'q10_cidadeCnpj', data.cnpjCidade);
        addJotformField(form, 'q12_ufCnpj', data.cnpjUf);
        addJotformField(form, 'q13_planoDe', data.planoSaude);
        addJotformField(form, 'q14_investimentoMensal', data.investimentoMensal);
        addJotformField(form, 'q15_numeroDe', data.numBeneficiarios);
        addJotformField(form, 'q16_idadesDos', formatIdades(data.idadesBeneficiarios));
        addJotformField(form, 'q17_tipo', 'b2c');
        addJotformField(form, 'q18_origem', '/analise');
      } else {
        const name = splitFullName(data.nomeInterlocutor);
        addJotformField(form, 'q3_nome[first]', name.first);
        addJotformField(form, 'q3_nome[last]', name.last);
        addJotformField(form, 'q4_telefone[full]', data.telefone);
        addJotformField(form, 'q5_email', data.email);
        addJotformField(form, 'q6_cargo', data.cargo);
        addJotformField(form, 'q7_cnpj', data.cnpj);
        addJotformField(form, 'q8_razaoSocial', data.razaoSocial);
        addJotformField(form, 'q9_site', data.site);
        addJotformField(form, 'q10_cidade', data.cidade);
        addJotformField(form, 'q11_uf', data.uf);
        addJotformField(form, 'q12_temPlano', booleanChoice(data.temPlanoSaude));
        addJotformField(form, 'q13_operadora', data.operadoraPlano);
        addJotformField(form, 'q14_numeroDe', data.numVidas);
        addJotformField(form, 'q15_tipo', 'b2b');
        addJotformField(form, 'q16_origem', '/analise');
      }

      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();

      setTimeout(finish, 2500);
    });
  }

  function goBack() {
    if (typeof window !== 'undefined') window.history.back();
  }

  // ═══════════════════════════════════════════
  // KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════

  $effect(() => {
    if (typeof window === 'undefined') return;

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter') { e.preventDefault(); goToNextStep(); return; }
      if (e.key === 'Escape') { e.preventDefault(); goBack(); return; }
      if (e.key === 'Backspace') {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        goToPrevStep();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  // ═══════════════════════════════════════════
  // ENTRANCE ANIMATIONS
  // ═══════════════════════════════════════════

  $effect(() => {
    if (!formContainer || reducedMotion) {
      if (formContainer) gsap.set([logoLink, backButton, stepsWrapper], { opacity: 1, y: 0, clearProps: 'transform' });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (logoLink) tl.fromTo(logoLink, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1 }, 0);
    if (backButton) tl.fromTo(backButton, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
    if (stepsWrapper) tl.fromTo(stepsWrapper, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2 }, 0.3);
  });
</script>

<div class="lead-form-page" bind:this={formContainer}>
  <div class="page-background" aria-hidden="true"></div>

  <header class="page-header">
    <a href="/" class="logo-link" bind:this={logoLink} aria-label="Voltar à página inicial">
      <img src="/images/logo_simple_light-126.webp" alt="Klout" class="logo-image" width="126" height="39" />
    </a>
    <div class="header-progress">
      {#if formType}
        <ProgressBar currentStep={currentStep} formType={formType} />
      {:else}
        <div class="progress-placeholder"></div>
      {/if}
    </div>
  </header>

  <button class="back-button" bind:this={backButton} onclick={goBack} aria-label="Voltar">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
    <span class="back-text">Voltar</span>
  </button>

  <div class="steps-viewport" bind:this={stepsWrapper}>
    <!-- Step 0: Type Selector -->
    <div class="step-wrapper" data-step="0" style="display: {currentStep === 0 ? 'block' : 'none'};">
      <StepTypeSelector onSelect={handleTypeSelect} />
    </div>

    <!-- B2C Steps -->
    <div class="step-wrapper" data-step="1" style="display: {formType === 'b2c' && currentStep === 1 ? 'block' : 'none'};">
      <StepName formData={nomeData} validation={nomeValidation} isSubmitting={isSubmitting}
        onInput={handleNomeInput} onBlur={handleNomeBlur} onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>
    <div class="step-wrapper" data-step="2" style="display: {formType === 'b2c' && currentStep === 2 ? 'block' : 'none'};">
      <StepContact formData={contactData} validation={contactValidation} userName={nomeData.nome}
        isSubmitting={isSubmitting} onInput={handleContactInput} onBlur={handleContactBlur}
        onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>
    <div class="step-wrapper" data-step="3" style="display: {formType === 'b2c' && currentStep === 3 ? 'block' : 'none'};">
      <StepCNPJ formData={cnpjData} validation={cnpjValidation} isSubmitting={isSubmitting}
        onUpdate={handleCnpjUpdate} onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>
    <div class="step-wrapper" data-step="4" style="display: {formType === 'b2c' && currentStep === 4 ? 'block' : 'none'};">
      <StepQualification formData={apoliceData} validation={apoliceValidation} isSubmitting={isSubmitting}
        onUpdate={handleApoliceUpdate} onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>
    <div class="step-wrapper" data-step="5" style="display: {formType === 'b2c' && currentStep === 5 ? 'block' : 'none'};">
      <StepBeneficiarios formData={beneficiariosData} validation={beneficiariosValidation} isSubmitting={isSubmitting}
        onUpdate={handleBeneficiariosUpdate} onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>

    <!-- B2B Steps -->
    <div class="step-wrapper" data-step="b2b-1" style="display: {formType === 'b2b' && currentStep === 1 ? 'block' : 'none'};">
      <StepB2bIdentificacao formData={b2bIdentificacao} validation={b2bIdentificacaoValidation}
        isSubmitting={isSubmitting} onInput={handleB2bIdentificacaoInput} onBlur={handleB2bIdentificacaoBlur}
        onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>
    <div class="step-wrapper" data-step="b2b-2" style="display: {formType === 'b2b' && currentStep === 2 ? 'block' : 'none'};">
      <StepB2bInformacoes formData={b2bInformacoes} validation={b2bInformacoesValidation}
        isSubmitting={isSubmitting} onUpdate={handleB2bInformacoesUpdate}
        onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>
    <div class="step-wrapper" data-step="b2b-3" style="display: {formType === 'b2b' && currentStep === 3 ? 'block' : 'none'};">
      <StepB2bContrato formData={b2bContrato} validation={b2bContratoValidation}
        isSubmitting={isSubmitting} onUpdate={handleB2bContratoUpdate}
        onclick={goToNextStep} onPrev={goToPrevStep} />
    </div>
  </div>
</div>

<style>
  .lead-form-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow: visible;
  }

  .page-background {
    position: fixed; inset: 0;
    background: linear-gradient(180deg, hsl(214, 61%, 6%) 0%, hsl(214, 61%, 8%) 25%, hsl(214, 61%, 10%) 50%, hsl(214, 61%, 12%) 75%, hsl(214, 61%, 14%) 100%);
    z-index: 0;
  }
  .page-background::after {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.7 0 0 0 0 0 0.6 0 0 0 0 0 0.5 0 0 0 0 0 0.02 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.3'/%3E%3C/svg%3E");
    opacity: 0.25; pointer-events: none; mix-blend-mode: soft-light;
  }

  .page-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 2.5rem;
    background: linear-gradient(180deg, hsla(214, 61%, 6%, 0.95) 0%, hsla(214, 61%, 6%, 0.7) 70%, transparent 100%);
    backdrop-filter: blur(8px);
  }
  .logo-link { display: inline-flex; align-items: center; opacity: 0; transform: translateX(-20px); transition: opacity 0.3s ease; }
  .logo-link:hover { opacity: 0.8; }
  .logo-image { height: 24px; width: auto; }
  .header-progress { display: flex; align-items: center; }
  .progress-placeholder { height: 1px; }

  .back-button {
    position: fixed; bottom: 2rem; left: 2.5rem; z-index: 100;
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 10px 20px; border-radius: 12px; border: 1px solid hsl(214, 15%, 30%);
    background: hsla(214, 20%, 12%, 0.6); backdrop-filter: blur(8px);
    color: hsl(214, 15%, 70%); font-family: 'Proxima Nova', sans-serif;
    font-size: 0.85rem; font-weight: 600; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: translateY(15px);
  }
  .back-button:hover {
    border-color: hsl(45, 40%, 55%); color: hsl(45, 30%, 75%);
    background: hsla(45, 30%, 50%, 0.08); box-shadow: 0 4px 16px hsla(45, 40%, 55%, 0.15);
    transform: translateY(-2px);
  }
  .back-button:active { transform: translateY(0) scale(0.98); }

  .steps-viewport {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 100%;
  }
  .step-wrapper {
    width: 100%;
  }

  :global(.progress-bar-container) {
    --marker-size: 0.34rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: clamp(12.5rem, 26vw, 18rem);
    max-width: 100%;
  }

  :global(.progress-shell) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.58rem;
    width: 100%;
    padding: 0;
  }

  :global(.progress-shell::before) {
    content: none;
  }

  :global(.progress-summary) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.38rem;
    padding-left: min(12rem, 66%);
    padding-right: 0;
  }

  :global(.progress-count) {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.6rem;
    font-weight: 600;
    color: hsl(45, 28%, 67%);
    letter-spacing: 0.02em;
    line-height: 1;
  }

  :global(.progress-separator) {
    width: 0.18rem;
    height: 0.18rem;
    border-radius: 999px;
    background: hsla(45, 32%, 62%, 0.62);
    box-shadow: 0 0 8px hsla(45, 38%, 58%, 0.18);
  }

  :global(.progress-current) {
    min-width: 0;
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.6rem;
    font-weight: 600;
    color: hsl(214, 14%, 72%);
    letter-spacing: 0.06em;
    line-height: 1;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.progress-map) {
    position: relative;
    width: 100%;
    min-height: var(--marker-size);
    padding-inline: 0;
    box-sizing: border-box;
  }

  :global(.progress-steps) {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(var(--step-count), minmax(0, 1fr));
    align-items: start;
    gap: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
  }

  :global(.progress-step) {
    position: relative;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  :global(.step-segment) {
    position: absolute;
    top: calc(var(--marker-size) / 2 - 0.5px);
    left: calc(50% + var(--marker-size) / 2);
    width: calc(100% - var(--marker-size));
    height: 1px;
    border-radius: 999px;
    overflow: hidden;
    background: hsla(214, 12%, 62%, 0.22);
    transition:
      background 0.36s ease,
      box-shadow 0.36s ease;
  }

  :global(.step-segment::after) {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, hsla(43, 24%, 38%, 0.82), hsl(47, 38%, 64%));
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.78s cubic-bezier(0.22, 1, 0.36, 1);
  }

  :global(.step-segment.completed::after),
  :global(.step-segment.active::after) {
    transform: scaleX(1);
  }

  :global(.step-marker) {
    width: var(--marker-size);
    height: var(--marker-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid hsla(214, 12%, 58%, 0.28);
    background: hsl(214, 34%, 8%);
    box-shadow: 0 0 0 2px hsla(214, 61%, 6%, 0.95);
    transition:
      transform 0.36s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.36s ease,
      background 0.36s ease,
      color 0.36s ease,
      box-shadow 0.36s ease;
  }

  :global(.step-marker-value) {
    line-height: 1;
  }

  :global(.progress-step.completed .step-marker) {
    border-color: hsl(43, 22%, 46%);
    background: hsl(43, 21%, 39%);
    box-shadow:
      0 0 0 2px hsla(214, 61%, 6%, 0.95),
      inset 0 1px 0 hsla(45, 34%, 72%, 0.16);
  }

  :global(.progress-step.active .step-marker) {
    transform: scale(1.32);
    border-color: hsl(45, 34%, 66%);
    background: hsl(45, 31%, 58%);
    box-shadow: 0 0 0 2px hsla(214, 61%, 6%, 0.96);
  }

  :global(.progress-step.upcoming .step-marker) {
    opacity: 0.56;
  }

  /* ═══════════════════════════════════════
     MOBILE — 768px
     ═══════════════════════════════════════ */
  @media (max-width: 768px) {
    .page-header {
      padding: 0 1rem;
      height: 3.5rem;
      align-items: center;
      background: hsla(214, 61%, 6%, 0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid hsla(214, 15%, 20%, 0.5);
    }
    .logo-link { opacity: 1; transform: none; }
    .logo-image { height: 18px; }

    .header-progress {
      padding-left: 0.5rem;
    }

    :global(.progress-bar-container) {
      --marker-size: 0.3rem;
      width: min(52vw, 10.8rem);
    }

    :global(.progress-shell) {
      gap: 0.42rem;
    }

    :global(.progress-count) {
      font-size: 0.48rem;
    }

    :global(.progress-summary) {
      padding-left: min(6rem, 42%);
    }

    :global(.progress-current) {
      max-width: 5.4rem;
      font-size: 0.45rem;
    }

    .back-button {
      position: fixed;
      bottom: 1rem;
      left: 0.75rem;
      top: auto;
      right: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      margin: 0;
      background: hsla(214, 20%, 12%, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 50%;
      border: 1px solid hsla(214, 15%, 25%, 0.6);
      z-index: 90;
      font-size: 0;
      box-shadow: 0 4px 16px hsla(0, 0%, 0%, 0.3);
    }
    .back-button svg {
      width: 18px;
      height: 18px;
    }
    .back-text { display: none; }

    .steps-viewport {
      padding: 0;
    }
    .step-wrapper {
      min-height: 100dvh;
    }
  }

  /* ═══════════════════════════════════════
     SMALL MOBILE — 480px
     ═══════════════════════════════════════ */
  @media (max-width: 480px) {
    .page-header {
      height: 3.25rem;
      padding: 0 0.875rem;
    }
    .logo-image { height: 16px; }

    :global(.progress-bar-container) {
      width: min(54vw, 9.3rem);
    }

    :global(.progress-current),
    :global(.progress-separator) {
      display: none;
    }

    :global(.progress-summary) {
      padding-left: 0;
    }

    .back-button {
      height: 2.75rem;
      font-size: 0.75rem;
    }
    .back-button svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 400px) {
    :global(.progress-bar-container) {
      width: min(56vw, 9rem);
    }
  }
</style>
