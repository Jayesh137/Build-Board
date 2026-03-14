<script lang="ts">
  interface Props {
    show: boolean;
    milestoneName: string;
  }

  let { show = $bindable(), milestoneName }: Props = $props();

  let visible = $state(false);
  let fadingOut = $state(false);
  let dismissTimer: ReturnType<typeof setTimeout> | undefined;

  const contextualMessages: Record<string, string> = {
    'Planning Approved': 'The hardest paperwork is done. Time to build.',
    'Weathertight': 'Your home is protected from the elements. Everything accelerates from here.',
    'Completion Certificate': 'Officially built to standard. Nearly there.',
    'Move In': 'You built a house. Less than 10% of people ever do this.',
  };

  const message = $derived(contextualMessages[milestoneName] ?? 'Another milestone reached. Keep going.');

  // Confetti configuration: 20 small squares in muted tones
  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2 + Math.random() * 1.5,
    color: ['#d4d4d8', '#93c5fd', '#fcd34d'][i % 3], // zinc-300, blue-300-ish, amber-300
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 60,
  }));

  $effect(() => {
    if (show) {
      visible = true;
      fadingOut = false;
      dismissTimer = setTimeout(() => dismiss(), 3000);
    }
  });

  function dismiss() {
    if (dismissTimer) clearTimeout(dismissTimer);
    fadingOut = true;
    setTimeout(() => {
      visible = false;
      fadingOut = false;
      show = false;
    }, 200);
  }

  function handleClick() {
    dismiss();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      dismiss();
    }
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="celebration-overlay {fadingOut ? 'fade-out' : 'fade-in'}"
    onclick={handleClick}
    onkeydown={handleKeydown}
    role="status"
    aria-live="polite"
    aria-label="Milestone completed: {milestoneName}"
  >
    <!-- Confetti layer -->
    <div class="confetti-container" aria-hidden="true">
      {#each confettiPieces as piece}
        <div
          class="confetti-piece"
          style="
            left: {piece.left}%;
            animation-delay: {piece.delay}s;
            animation-duration: {piece.duration}s;
            --drift: {piece.drift}px;
            --rotation: {piece.rotation}deg;
          "
        >
          <div
            class="confetti-square"
            style="background-color: {piece.color};"
          ></div>
        </div>
      {/each}
    </div>

    <!-- Centre content -->
    <div class="celebration-content">
      <!-- Animated checkmark -->
      <div class="checkmark-container">
        <svg
          viewBox="0 0 52 52"
          class="checkmark-svg"
          aria-hidden="true"
        >
          <circle
            class="checkmark-circle"
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke-width="2"
          />
          <path
            class="checkmark-path"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 26l7 7 15-15"
          />
        </svg>
      </div>

      <!-- Milestone name -->
      <h2 class="milestone-name">{milestoneName}</h2>

      <!-- Contextual message -->
      <p class="milestone-message">{message}</p>
    </div>
  </div>
{/if}

<style>
  .celebration-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    cursor: pointer;
    user-select: none;
  }

  :global(.dark) .celebration-overlay {
    background: rgba(9, 9, 11, 0.85);
  }

  .fade-in {
    animation: overlayFadeIn 300ms ease-out forwards;
  }

  .fade-out {
    animation: overlayFadeOut 200ms ease-in forwards;
  }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes overlayFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* Confetti */
  .confetti-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .confetti-piece {
    position: absolute;
    top: -10px;
    animation: confettiFall linear forwards;
    opacity: 0;
  }

  .confetti-square {
    width: 6px;
    height: 6px;
    border-radius: 1px;
  }

  @keyframes confettiFall {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0) rotate(0deg);
    }
    10% {
      opacity: 0.7;
    }
    60% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
      transform: translateY(calc(100vh + 20px)) translateX(var(--drift)) rotate(var(--rotation));
    }
  }

  /* Centre content */
  .celebration-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    padding: 0 24px;
    animation: contentSlideUp 400ms ease-out 100ms both;
  }

  @keyframes contentSlideUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Checkmark */
  .checkmark-container {
    width: 72px;
    height: 72px;
  }

  .checkmark-svg {
    width: 100%;
    height: 100%;
  }

  .checkmark-circle {
    stroke: #16a34a;
    stroke-dasharray: 151;
    stroke-dashoffset: 151;
    animation: circleStroke 600ms ease-out 200ms forwards;
  }

  :global(.dark) .checkmark-circle {
    stroke: #4ade80;
  }

  .checkmark-path {
    stroke: #16a34a;
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    animation: checkStroke 400ms ease-out 600ms forwards;
  }

  :global(.dark) .checkmark-path {
    stroke: #4ade80;
  }

  @keyframes circleStroke {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes checkStroke {
    to {
      stroke-dashoffset: 0;
    }
  }

  /* Text */
  .milestone-name {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 600;
    color: #18181b;
    letter-spacing: -0.01em;
  }

  :global(.dark) .milestone-name {
    color: #f4f4f5;
  }

  .milestone-message {
    font-size: 0.875rem;
    line-height: 1.5;
    color: #71717a;
    max-width: 320px;
  }

  :global(.dark) .milestone-message {
    color: #a1a1aa;
  }
</style>
