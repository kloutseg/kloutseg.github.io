<script lang="ts">
  export let size: 'small' | 'medium' | 'large' | 'compact' = 'medium';

  const sizes = {
    compact: { width: '56px', paddingX: '6px', paddingY: '4px' },
    small: { width: '72px', paddingX: '10px', paddingY: '16px' },
    medium: { width: '128px', paddingX: '16px', paddingY: '32px' },
    large: { width: '176px', paddingX: '24px', paddingY: '48px' }
  };

  const fontSizes = {
    compact: '28px',
    small: '32px',
    medium: '64px',
    large: '96px'
  };

  const textSizes = {
    compact: '5px',
    small: '5px',
    medium: '7px',
    large: '9px'
  };

  const dividerWidths = {
    compact: '24px',
    small: '40px',
    medium: '80px',
    large: '100px'
  };

  const cornerPositions = {
    compact: { top: '4px', right: '4px', bottom: '4px', left: '4px' },
    small: { top: '6px', right: '6px', bottom: '6px', left: '6px' },
    medium: { top: '12px', right: '12px', bottom: '12px', left: '12px' },
    large: { top: '12px', right: '12px', bottom: '12px', left: '12px' }
  };

  const cornerSizes = {
    compact: { width: '6px', height: '6px' },
    small: { width: '8px', height: '8px' },
    medium: { width: '16px', height: '16px' },
    large: { width: '16px', height: '16px' }
  };

  $: currentSize = sizes[size];
  $: currentFontSize = fontSizes[size];
  $: currentTextSize = textSizes[size];
  $: currentDividerWidth = dividerWidths[size];
  $: currentCornerPos = cornerPositions[size];
  $: currentCornerSize = cornerSizes[size];
</script>

<div
  class="hs-badge"
  style="--width: {currentSize.width}; --px: {currentSize.paddingX}; --py: {currentSize.paddingY}; --font-size: {currentFontSize}; --text-size: {currentTextSize};"
>
  <!-- Outer glow effect -->
  <div class="outer-glow"></div>

  <!-- Decorative M in background -->
  <div class="decorative-m">
    <span class="m-text">M</span>
  </div>

  <!-- Subtle grid pattern overlay -->
  <div class="grid-pattern"></div>

  <!-- Top corner accents -->
  <div class="corner-accent top-left" style="top: {currentCornerPos.top}; left: {currentCornerPos.left}; width: {currentCornerSize.width}; height: {currentCornerSize.height};"></div>
  <div class="corner-accent top-right" style="top: {currentCornerPos.top}; right: {currentCornerPos.right}; width: {currentCornerSize.width}; height: {currentCornerSize.height};"></div>

  <!-- Bottom corner accents -->
  <div class="corner-accent bottom-left" style="bottom: {currentCornerPos.bottom}; left: {currentCornerPos.left}; width: {currentCornerSize.width}; height: {currentCornerSize.height};"></div>
  <div class="corner-accent bottom-right" style="bottom: {currentCornerPos.bottom}; right: {currentCornerPos.right}; width: {currentCornerSize.width}; height: {currentCornerSize.height};"></div>

  <!-- Content -->
  <div class="content">
    <div class="hs-content">
      <!-- HS Typography -->
      <div class="hs-text">HS</div>
      <div class="divider" style="width: {currentDividerWidth};"></div>
    </div>
    <p class="high-standards">
      High<br/>Standards
    </p>
  </div>

  <!-- Top metallic bar -->
  <div class="metallic-bar top"></div>

  <!-- Bottom metallic bar -->
  <div class="metallic-bar bottom"></div>

  <!-- Side accent lines -->
  <div class="side-accent left"></div>
  <div class="side-accent right"></div>
</div>

<style>
  .hs-badge {
    position: relative;
    width: var(--width);
    padding: var(--py) var(--px);
    background: linear-gradient(to bottom, #0a0a0a, #000, #0a0a0a);
    color: #fff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    border: 1px solid #27272a;
    border-radius: 6px;
    transition: all 0.4s ease;
    cursor: pointer;
  }

  .hs-badge:hover {
    border-color: rgba(220, 38, 38, 0.4);
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 20px rgba(220, 38, 38, 0.1);
  }

  .outer-glow {
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 60px rgba(255, 255, 255, 0.03);
    transition: box-shadow 0.4s ease;
  }

  .hs-badge:hover .outer-glow {
    box-shadow: inset 0 0 60px rgba(220, 38, 38, 0.15);
  }

  .decorative-m {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .m-text {
    font-size: 280px;
    font-weight: 700;
    line-height: 1;
    user-select: none;
    filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.05));
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(0, 0, 0, 0.1) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: all 0.4s ease;
  }

  .hs-badge:hover .m-text {
    filter: drop-shadow(0 0 40px rgba(220, 38, 38, 0.4));
    background: linear-gradient(180deg, rgba(220, 38, 38, 0.25) 0%, rgba(139, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.3) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .grid-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.02;
    background-image: repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 2px);
    background-size: 2px 2px;
  }

  .corner-accent {
    position: absolute;
    border-color: rgba(255, 255, 255, 0.1);
    border-style: solid;
    transition: border-color 0.4s ease;
  }

  .hs-badge:hover .corner-accent {
    border-color: rgba(220, 38, 38, 0.5);
  }

  .corner-accent.top-left {
    border-width: 2px 0 0 2px;
  }

  .corner-accent.top-right {
    border-width: 2px 2px 0 0;
  }

  .corner-accent.bottom-left {
    border-width: 0 0 2px 2px;
  }

  .corner-accent.bottom-right {
    border-width: 0 2px 2px 0;
  }

  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .hs-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .hs-text {
    font-size: var(--font-size);
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 40px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 255, 255, 0.5), 0 4px 8px rgba(0, 0, 0, 0.8);
    letter-spacing: -0.05em;
    font-family: 'Outfit', 'Proxima Nova', sans-serif;
  }

  .divider {
    height: 2px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
    box-shadow: none;
    transition: all 0.4s ease;
  }

  .hs-badge:hover .divider {
    background: linear-gradient(to right, transparent, #dc2626, transparent);
    box-shadow: 0 0 8px rgba(220, 38, 38, 0.6);
  }

  .high-standards {
    font-size: var(--text-size);
    letter-spacing: 0.35em;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.25;
    color: #e4e4e7;
    margin: 0;
  }

  .metallic-bar {
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
    box-shadow: none;
    transition: all 0.4s ease;
  }

  .hs-badge:hover .metallic-bar {
    background: linear-gradient(to right, transparent, #dc2626, transparent);
    box-shadow: 0 0 10px rgba(220, 38, 38, 0.8);
  }

  .metallic-bar.top {
    top: 0;
  }

  .metallic-bar.bottom {
    bottom: 0;
  }

  .side-accent {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 80px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.05), transparent);
    transition: background 0.4s ease;
  }

  .hs-badge:hover .side-accent {
    background: linear-gradient(to bottom, transparent, rgba(220, 38, 38, 0.3), transparent);
  }

  .side-accent.left {
    left: 0;
  }

  .side-accent.right {
    right: 0;
  }
</style>
