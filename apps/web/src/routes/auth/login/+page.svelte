<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
  <div class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">BuildTracker</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Sign in to manage your build project</p>
    </div>

    <Card>
      {#if form?.error}
        <div class="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {form.error}
        </div>
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
        class="space-y-4"
      >
        <Input label="Email" name="email" type="email" required autocomplete="email" placeholder="you@example.com" />
        <Input label="Password" name="password" type="password" required autocomplete="current-password" placeholder="Enter your password" />
        <Button type="submit" class="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p class="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don't have an account? <a href="/auth/signup" class="font-medium text-accent-600 hover:text-accent-500 dark:text-accent-400">Sign up</a>
      </p>
    </Card>
  </div>
</div>
