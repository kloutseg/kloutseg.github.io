<script lang="ts">
  import { gsap } from 'gsap';
  import { onMount } from 'svelte';

  type QaItem = {
    eyebrow: string;
    question: string;
    answer: string;
    cta: string;
    href: string;
  };

  export let items: QaItem[] = [];
  export let tone: 'consumer' | 'business' = 'consumer';

  let activeIndex = 0;
  let typedAnswer = '';
  let measuredMinHeight = 0;
  let measuredQuestionHeight = 0;
  let measuredAnswerHeight = 0;
  let currentHref = items[0]?.href ?? '/analise';
  let currentCta = items[0]?.cta ?? '';

  let moduleEl: HTMLElement | null = null;
  let questionWrap: HTMLDivElement | null = null;
  let questionEl: HTMLHeadingElement | null = null;
  let answerWrap: HTMLDivElement | null = null;
  let buttonEl: HTMLAnchorElement | null = null;
  let dotEls: HTMLSpanElement[] = [];
  let probeQuestionEl: HTMLDivElement | null = null;
  let probeAnswerEl: HTMLParagraphElement | null = null;
  let probeButtonLabelEl: HTMLSpanElement | null = null;
  let probeQuestionWrapEl: HTMLDivElement | null = null;
  let probeAnswerWrapEl: HTMLDivElement | null = null;

  let typeTimeout: number | null = null;
  let cycleTimeout: number | null = null;
  let isPaused = false;
  const typeChunkSize = 2;
  const typeTickMs = 24;
  const cycleDelayMs = 7600;

  const clearTimers = () => {
    if (typeTimeout !== null) {
      window.clearTimeout(typeTimeout);
      typeTimeout = null;
    }

    if (cycleTimeout !== null) {
      window.clearTimeout(cycleTimeout);
      cycleTimeout = null;
    }
  };

  const syncMeta = (index: number) => {
    dotEls.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const typeAnswer = (text: string, done: () => void) => {
    let charIndex = 0;
    typedAnswer = '';

    const tick = () => {
      charIndex += Math.min(typeChunkSize, text.length - charIndex);
      typedAnswer = text.slice(0, charIndex);

      if (charIndex < text.length) {
        typeTimeout = window.setTimeout(tick, typeTickMs);
        return;
      }

      done();
    };

    tick();
  };

  const scheduleNext = () => {
    if (isPaused || items.length <= 1) return;

    cycleTimeout = window.setTimeout(() => {
      playCase((activeIndex + 1) % items.length);
    }, cycleDelayMs);
  };

  const playCase = (index: number) => {
    const item = items[index];
    if (!item || !questionEl || !questionWrap || !answerWrap || !buttonEl) return;

    clearTimers();

    const tl = gsap.timeline({ defaults: { ease: 'sine.out' } });

    tl.to([answerWrap, buttonEl], {
      autoAlpha: 0,
      y: 10,
      duration: 0.42,
      stagger: 0.08,
    });

    tl.to(questionWrap, {
      y: 8,
      autoAlpha: 0,
      duration: 0.4,
      onComplete: () => {
        activeIndex = index;
        syncMeta(index);
        if (questionEl) questionEl.textContent = item.question;
        typedAnswer = '';
        currentHref = item.href;
        currentCta = item.cta;
      },
    });

    tl.fromTo(
      questionWrap,
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9 },
    );

    tl.to(questionWrap, {
      y: -6,
      duration: 0.86,
      ease: 'sine.out',
    });

    tl.set(answerWrap, { autoAlpha: 1, y: 0 });
    tl.call(() => {
      typeAnswer(item.answer, () => {
        gsap.to(buttonEl, {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: 'sine.out',
          onComplete: scheduleNext,
        });
      });
    }, undefined, '+=0.18');
  };

  const pause = () => {
    isPaused = true;
    clearTimers();
  };

  const resume = () => {
    isPaused = false;
    scheduleNext();
  };

  const togglePause = () => {
    if (isPaused) {
      resume();
      return;
    }

    pause();
  };

  const nextCase = () => {
    if (items.length <= 1) return;
    playCase((activeIndex + 1) % items.length);
  };

  const measureMinHeight = () => {
    if (
      !moduleEl ||
      !probeQuestionEl ||
      !probeAnswerEl ||
      !probeButtonLabelEl ||
      !probeQuestionWrapEl ||
      !probeAnswerWrapEl ||
      !items.length
    ) return;

    const previousQuestion = probeQuestionEl.textContent;
    const previousAnswer = probeAnswerEl.textContent;
    const previousButton = probeButtonLabelEl.textContent;

    measuredMinHeight = 0;
    measuredQuestionHeight = 0;
    measuredAnswerHeight = 0;

    for (const item of items) {
      probeQuestionEl.textContent = item.question;
      probeAnswerEl.textContent = item.answer;
      probeButtonLabelEl.textContent = item.cta;
      measuredQuestionHeight = Math.max(measuredQuestionHeight, probeQuestionWrapEl.getBoundingClientRect().height);
      measuredAnswerHeight = Math.max(measuredAnswerHeight, probeAnswerWrapEl.getBoundingClientRect().height);
    }

    measuredMinHeight = measuredQuestionHeight + measuredAnswerHeight + 120;

    probeQuestionEl.textContent = previousQuestion;
    probeAnswerEl.textContent = previousAnswer;
    probeButtonLabelEl.textContent = previousButton;
  };

  onMount(() => {
    if (!items.length) return;

    gsap.set(questionWrap, { autoAlpha: 1, y: 0 });
    gsap.set(answerWrap, { autoAlpha: 0, y: 0 });
    gsap.set(buttonEl, { autoAlpha: 0, y: 10 });
    syncMeta(0);
    measureMinHeight();
    playCase(0);

    const handleResize = () => {
      measureMinHeight();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimers();
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<article
  class:qa-business={tone === 'business'}
  class="qa-module"
  style={`--qa-measured-min-height: ${measuredMinHeight}px; --qa-question-min-height: ${measuredQuestionHeight}px; --qa-answer-min-height: ${measuredAnswerHeight}px;`}
  bind:this={moduleEl}
  on:mouseenter={pause}
  on:mouseleave={resume}
  on:focusin={pause}
  on:focusout={resume}
>
  <div class="qa-topbar">
    <button
      type="button"
      class="qa-pause"
      aria-pressed={isPaused}
      aria-label={isPaused ? 'Retomar animação' : 'Pausar animação'}
      data-tooltip={isPaused ? 'Retomar animação' : 'Pausar animação'}
      on:click={togglePause}
    >
      {#if isPaused}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.3-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z"></path>
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1"></rect>
          <rect x="14" y="5" width="4" height="14" rx="1"></rect>
        </svg>
      {/if}
    </button>

    <div class="qa-dots" aria-hidden="true">
      {#each items as _, index}
        <span bind:this={dotEls[index]} class:is-active={index === 0} class="qa-dot"></span>
      {/each}
    </div>
  </div>

  <div class="qa-stage">
    <div class="qa-question-wrap" bind:this={questionWrap}>
      <h3 class="qa-question" bind:this={questionEl}>{items[0]?.question}</h3>
    </div>

    <div class="qa-answer-wrap" bind:this={answerWrap}>
      <p class="qa-label answer-label">Resposta Klout</p>
      <p class="qa-answer">{typedAnswer}</p>
      <div class="qa-actions">
        <a href={currentHref} class="qa-button" bind:this={buttonEl}>
          <span class="qa-button-label">{currentCta}</span>
          <svg class="qa-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  </div>

  <div class="qa-footer">
  <button
    type="button"
    class="qa-next"
    aria-label="Próximo caso"
    data-tooltip="Próximo caso"
    on:click={nextCase}
  >
      <svg class="qa-next-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  </div>

  <div class="qa-sizing-probe" aria-hidden="true">
    <div class="qa-topbar">
      <div class="qa-dots">
        {#each items as _}
          <span class="qa-dot"></span>
        {/each}
      </div>
    </div>
    <div class="qa-stage">
      <div class="qa-question-wrap" bind:this={probeQuestionWrapEl}>
        <div class="qa-question" bind:this={probeQuestionEl}></div>
      </div>
      <div class="qa-answer-wrap" bind:this={probeAnswerWrapEl}>
        <p class="qa-label answer-label">Resposta Klout</p>
        <p class="qa-answer" bind:this={probeAnswerEl}></p>
        <div class="qa-actions">
          <span class="qa-button">
            <span class="qa-button-label" bind:this={probeButtonLabelEl}></span>
            <svg class="qa-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </div>
      </div>
    </div>
    <div class="qa-footer">
      <span class="qa-next" aria-hidden="true">
        <svg class="qa-next-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </span>
    </div>
  </div>
</article>

<style>
  .qa-module {
    width: 100%;
    min-height: 390px;
    padding: 1.45rem 1.55rem 1.15rem;
    border-radius: 24px;
    background:
      linear-gradient(180deg, hsla(0, 0%, 100%, 0.92) 0%, hsla(0, 0%, 100%, 0.78) 100%);
    border: 1px solid hsla(214, 24%, 32%, 0.08);
    box-shadow:
      0 22px 44px hsla(214, 24%, 18%, 0.07),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.75);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .qa-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .qa-dots {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }

  .qa-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: hsla(214, 18%, 38%, 0.18);
    transition:
      width 0.28s ease,
      background 0.28s ease;
  }

  .qa-dot.is-active {
    width: 28px;
    background: linear-gradient(135deg, hsl(45, 60%, 48%) 0%, hsl(42, 54%, 40%) 100%);
  }

  .qa-label {
    font-family: 'IBM Plex Mono', monospace;
    text-transform: uppercase;
  }

  .qa-label {
    font-size: 0.74rem;
    letter-spacing: 0.12em;
    color: hsl(45, 52%, 46%);
  }

  .qa-stage {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.8rem;
    padding-top: 0.7rem;
  }

  .qa-footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 34px;
    margin-top: 0.75rem;
  }

  .qa-question-wrap,
  .qa-answer-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
  }

  .qa-question-wrap {
    align-items: flex-start;
    min-height: var(--qa-question-min-height, auto);
    max-width: 100%;
  }

  .qa-answer-wrap {
    align-items: flex-end;
    min-height: var(--qa-answer-min-height, auto);
    justify-content: flex-start;
  }

  .qa-question {
    margin: 0;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.88rem;
    font-weight: 400;
    line-height: 1.85;
    letter-spacing: 0.01em;
    display: block;
    width: fit-content;
    color: hsl(0, 0%, 98%);
    max-width: min(36ch, calc(100% - 3.2rem));
    padding: 0.78rem 0.92rem;
    border-radius: 1rem 1rem 1rem 0.35rem;
    background: linear-gradient(180deg, hsl(214, 28%, 18%) 0%, hsl(214, 24%, 14%) 100%);
    box-shadow:
      0 12px 24px hsla(214, 30%, 10%, 0.18),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.06);
    text-shadow: 0 1px 0 hsla(0, 0%, 100%, 0.04);
    text-wrap: balance;
  }

  .answer-label {
    color: hsl(214, 18%, 42%);
  }

  .qa-pause {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: hsla(214, 18%, 38%, 0.08);
    color: hsl(214, 18%, 42%);
    cursor: pointer;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      transform 0.2s ease;
  }

  .qa-pause::after {
    content: attr(data-tooltip);
    position: absolute;
    left: calc(100% + 0.55rem);
    top: 50%;
    transform: translateY(-50%) translateX(-4px);
    padding: 0.42rem 0.55rem;
    border-radius: 999px;
    background: hsl(214, 24%, 16%);
    color: hsl(0, 0%, 98%);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 10px 24px hsla(214, 30%, 8%, 0.18);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .qa-pause:hover {
    color: hsl(214, 38%, 14%);
    background: hsla(214, 18%, 38%, 0.14);
  }

  .qa-pause:hover::after {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }

  .qa-answer {
    display: block;
    width: fit-content;
    min-height: 0;
    margin: 0.55rem 0 0;
    margin-left: auto;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.88rem;
    line-height: 1.85;
    letter-spacing: 0.01em;
    color: hsl(214, 20%, 28%);
    max-width: min(40ch, calc(100% - 3.2rem));
    padding: 0.76rem 0.9rem;
    border-radius: 1rem 1rem 0.35rem 1rem;
    background: linear-gradient(180deg, hsla(42, 38%, 96%, 0.95) 0%, hsla(42, 30%, 92%, 0.92) 100%);
    box-shadow:
      0 10px 20px hsla(214, 18%, 20%, 0.08),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.65);
  }

  .qa-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
    width: 100%;
    margin-top: 0.95rem;
  }

  .qa-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 9px 18px;
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      hsl(42, 34%, 42%) 0%,
      hsl(42, 30%, 36%) 52%,
      hsl(40, 28%, 30%) 100%
    );
    color: hsl(0, 0%, 100%);
    text-decoration: none;
    font-family: 'Proxima Nova', sans-serif;
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 10px 22px hsla(42, 28%, 14%, 0.2),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.15);
  }

  .qa-button::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 -100%;
    width: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsla(0, 0%, 100%, 0.15) 50%,
      transparent 100%
    );
    transition: left 0.6s ease;
  }

  .qa-button:hover::before {
    left: 100%;
  }

  .qa-button:hover {
    transform: translateY(-2px);
    box-shadow:
      0 16px 28px hsla(42, 28%, 14%, 0.24),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.15);
  }

  .qa-button:active {
    transform: translateY(0) scale(0.985);
  }

  .qa-button-label,
  .qa-arrow {
    position: relative;
    z-index: 1;
  }

  .qa-next {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    transform: translateY(-2rem);
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: hsla(214, 18%, 38%, 0.08);
    color: hsl(214, 18%, 42%);
    cursor: pointer;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      transform 0.2s ease;
  }

  .qa-next::after {
    content: attr(data-tooltip);
    position: absolute;
    left: calc(100% + 0.55rem);
    top: 50%;
    transform: translateY(-50%) translateX(-4px);
    padding: 0.42rem 0.55rem;
    border-radius: 999px;
    background: hsl(214, 24%, 16%);
    color: hsl(0, 0%, 98%);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 10px 24px hsla(214, 30%, 8%, 0.18);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .qa-next:hover::after {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }

  .qa-next:hover {
    color: hsl(214, 38%, 14%);
    background: hsla(214, 18%, 38%, 0.14);
    transform: translate(1px, -2rem);
  }

  .qa-next-arrow {
    width: 15px;
    height: 15px;
  }

  .qa-sizing-probe {
    position: absolute;
    inset: 0;
    visibility: hidden;
    pointer-events: none;
    z-index: -1;
    padding: inherit;
    display: flex;
    flex-direction: column;
  }

  .qa-module.qa-business {
    background:
      linear-gradient(180deg, hsla(217, 24%, 16%, 0.96) 0%, hsla(220, 26%, 12%, 0.94) 100%);
    border: 1px solid hsla(214, 20%, 74%, 0.08);
    box-shadow:
      0 24px 48px hsla(224, 28%, 8%, 0.28),
      inset 0 1px 0 hsla(42, 24%, 92%, 0.06);
  }

  .qa-business .qa-dot {
    background: hsla(214, 18%, 72%, 0.18);
  }

  .qa-business .qa-dot.is-active {
    background: linear-gradient(135deg, hsl(44, 44%, 58%) 0%, hsl(42, 34%, 46%) 100%);
  }

  .qa-business .qa-label {
    color: hsl(42, 40%, 64%);
  }

  .qa-business .qa-question {
    color: hsl(210, 22%, 96%);
    background: linear-gradient(180deg, hsla(214, 20%, 20%, 0.98) 0%, hsla(218, 24%, 16%, 0.98) 100%);
    box-shadow:
      0 14px 28px hsla(224, 26%, 8%, 0.28),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.05);
    text-shadow: none;
  }

  .qa-business .answer-label {
    color: hsla(210, 24%, 84%, 0.72);
  }

  .qa-business .qa-answer {
    color: hsl(216, 20%, 20%);
    background: linear-gradient(180deg, hsla(210, 24%, 94%, 0.96) 0%, hsla(212, 18%, 88%, 0.94) 100%);
    box-shadow:
      0 12px 24px hsla(224, 24%, 6%, 0.12),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.7);
  }

  .qa-business .qa-pause,
  .qa-business .qa-next {
    background: hsla(213, 20%, 78%, 0.1);
    color: hsla(210, 30%, 90%, 0.84);
  }

  .qa-business .qa-pause:hover,
  .qa-business .qa-next:hover {
    color: hsl(0, 0%, 100%);
    background: hsla(42, 28%, 72%, 0.18);
  }

  .qa-business .qa-button {
    background: linear-gradient(
      135deg,
      hsl(43, 34%, 48%) 0%,
      hsl(41, 28%, 40%) 52%,
      hsl(38, 24%, 34%) 100%
    );
    box-shadow:
      0 12px 24px hsla(36, 28%, 10%, 0.28),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.14);
  }

  .qa-business .qa-button:hover {
    box-shadow:
      0 16px 28px hsla(36, 28%, 10%, 0.32),
      inset 0 1px 0 hsla(0, 0%, 100%, 0.14);
  }

  @media (max-width: 1024px) {
    .qa-module {
      min-height: 410px;
    }

    .qa-question {
      max-width: 100%;
    }
  }

  @media (max-width: 768px) {
    .qa-module {
      min-height: max(22.5rem, var(--qa-measured-min-height, 0px));
      width: 100%;
      box-sizing: border-box;
      padding: 1.25rem 1.1rem 1rem;
      border-radius: 16px;
      box-shadow:
        0 12px 24px hsla(214, 24%, 18%, 0.055),
        inset 0 1px 0 hsla(0, 0%, 100%, 0.75);
    }

    .qa-topbar {
      position: absolute;
      top: 0.9rem;
      left: 0.9rem;
      right: 0.9rem;
      margin-bottom: 0;
      gap: 0;
      justify-content: space-between;
      align-items: flex-start;
    }

    .qa-dots {
      flex-direction: column;
      gap: 0.3rem;
    }

    .qa-dot {
      width: 6px;
      height: 6px;
    }

    .qa-dot.is-active {
      width: 6px;
      height: 20px;
    }

    .qa-question {
      font-size: 0.77rem;
      line-height: 1.62;
      letter-spacing: 0.01em;
      max-width: 38ch;
    }

    .qa-stage {
      justify-content: flex-end;
      gap: 0.7rem;
      padding-top: 2.35rem;
    }

    .qa-question-wrap,
    .qa-answer-wrap {
      text-align: left;
    }

    .qa-question-wrap {
      align-items: flex-start;
      min-height: var(--qa-question-min-height, auto);
      max-width: 100%;
    }

    .qa-answer-wrap {
      align-items: flex-end;
      text-align: left;
      min-height: var(--qa-answer-min-height, auto);
      justify-content: flex-start;
    }

    .qa-label {
      font-size: 0.65rem;
      letter-spacing: 0.09em;
    }

    .qa-answer {
      display: block;
      width: fit-content;
      min-height: 0;
      margin-top: 0.45rem;
      margin-left: auto;
      font-size: 0.77rem;
      line-height: 1.62;
      max-width: min(38ch, calc(100% - 2.4rem));
      padding: 0.75rem 0.9rem;
      border-radius: 1rem 1rem 0.35rem 1rem;
      background: linear-gradient(180deg, hsla(42, 38%, 96%, 0.95) 0%, hsla(42, 30%, 92%, 0.92) 100%);
      box-shadow:
        0 8px 18px hsla(214, 18%, 20%, 0.08),
        inset 0 1px 0 hsla(0, 0%, 100%, 0.65);
    }

    .answer-label {
      align-self: flex-end;
    }

    .qa-question {
      display: block;
      width: fit-content;
      color: hsl(0, 0%, 98%);
      max-width: min(38ch, calc(100% - 2.4rem));
      padding: 0.85rem 0.95rem;
      border-radius: 1.1rem 1.1rem 1.1rem 0.35rem;
      background: linear-gradient(180deg, hsl(214, 28%, 18%) 0%, hsl(214, 24%, 14%) 100%);
      box-shadow:
        0 10px 20px hsla(214, 30%, 10%, 0.18),
        inset 0 1px 0 hsla(0, 0%, 100%, 0.06);
      text-shadow: 0 1px 0 hsla(0, 0%, 100%, 0.04);
    }

    .qa-button {
      width: auto;
      flex: 0 1 auto;
      min-height: 34px;
      padding: 7px 14px;
      font-size: 0.71rem;
      gap: 0.32rem;
      border-radius: 12px;
    }

    .qa-actions {
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin-top: 1.1rem;
    }

    .qa-arrow {
      width: 12px;
      height: 12px;
    }

    .qa-pause {
      width: 28px;
      height: 28px;
      order: -1;
    }

    .qa-next {
      --control-size: 2rem;
      --control-arrow-width: 0.95rem;
      --control-arrow-height: 0.55rem;
      --control-base-y: 0px;
    }

  }

  @media (max-width: 480px) {
    .qa-module {
      min-height: max(20.5rem, var(--qa-measured-min-height, 0px));
      padding: 0.95rem 0.85rem 0.95rem;
    }

    .qa-topbar {
      top: 0.75rem;
      left: 0.75rem;
      right: 0.75rem;
    }

    .qa-stage {
      gap: 0.55rem;
      padding-top: 2rem;
    }

    .qa-label {
      font-size: 0.61rem;
    }

    .qa-question {
      font-size: 0.71rem;
      line-height: 1.52;
      letter-spacing: 0.01em;
      max-width: 38ch;
    }

    .qa-answer {
      font-size: 0.71rem;
      line-height: 1.52;
    }

    .qa-actions {
      margin-top: 0.85rem;
    }

    .qa-pause {
      width: 26px;
      height: 26px;
    }

    .qa-next {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: hsla(214, 18%, 38%, 0.08);
      color: hsl(214, 26%, 34%);
      cursor: pointer;
      transition:
        color 0.2s ease,
        background 0.2s ease,
        transform 0.2s ease;
    }

    .qa-next:hover {
      color: hsl(214, 38%, 14%);
      background: hsla(214, 18%, 38%, 0.14);
      transform: translateX(1px);
    }

    .qa-next-arrow {
      width: 14px;
      height: 14px;
    }
  }
</style>
