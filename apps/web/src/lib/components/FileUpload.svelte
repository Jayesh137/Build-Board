<script lang="ts">
  import Upload from 'lucide-svelte/icons/upload';
  import FileText from 'lucide-svelte/icons/file-text';
  import X from 'lucide-svelte/icons/x';

  interface Props {
    name?: string;
    accept?: string;
    maxSizeMb?: number;
  }

  let { name = 'file', accept = '*', maxSizeMb = 25 }: Props = $props();

  let file = $state<File | null>(null);
  let dragOver = $state(false);
  let error = $state('');
  let fileInput = $state<HTMLInputElement | null>(null);

  function handleFile(f: File) {
    error = '';
    if (f.size > maxSizeMb * 1024 * 1024) {
      error = `File too large. Maximum size is ${maxSizeMb}MB.`;
      return;
    }
    file = f;
    // Update the actual file input for form submission
    if (fileInput) {
      const dt = new DataTransfer();
      dt.items.add(f);
      fileInput.files = dt.files;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const selectedFile = target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  }

  function removeFile() {
    file = null;
    error = '';
    if (fileInput) fileInput.value = '';
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<div class="space-y-1">
  <p class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">File</p>

  {#if file}
    <!-- Selected file display -->
    <div class="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-accent-100 dark:bg-accent-900/30">
        <FileText size={20} class="text-accent-600 dark:text-accent-400" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">{formatSize(file.size)}</p>
      </div>
      <button
        type="button"
        onclick={removeFile}
        class="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
      >
        <X size={16} />
      </button>
    </div>
  {:else}
    <!-- Drop zone -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-colors {dragOver
        ? 'border-accent-400 bg-accent-50 dark:border-accent-600 dark:bg-accent-950'
        : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'}"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={() => fileInput?.click()}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInput?.click(); }}
      role="button"
      tabindex="0"
    >
      <Upload size={24} class="mb-2 text-zinc-400 dark:text-zinc-500" />
      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        <span class="font-medium text-accent-600 dark:text-accent-400">Click to upload</span> or drag and drop
      </p>
      <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        {accept === '*' ? 'Any file type' : accept.split(',').map((s) => s.trim().replace('.', '').toUpperCase()).join(', ')} up to {maxSizeMb}MB
      </p>
    </div>
  {/if}

  <input
    bind:this={fileInput}
    type="file"
    {name}
    {accept}
    class="hidden"
    onchange={handleInputChange}
  />

  {#if error}
    <p class="text-xs text-red-600 dark:text-red-400">{error}</p>
  {/if}
</div>
