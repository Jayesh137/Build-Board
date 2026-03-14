<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let { variant = 'primary', size = 'md', children, class: className = '', ...rest }: Props = $props();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary: 'bg-accent-600 text-white hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600',
    secondary: 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
    ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-sm gap-2'
  };
</script>

<button class="{baseStyles} {variants[variant]} {sizes[size]} {className}" {...rest}>
  {@render children()}
</button>
