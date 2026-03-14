<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import FolderOpen from 'lucide-svelte/icons/folder-open';
  import Upload from 'lucide-svelte/icons/upload';
  import FileText from 'lucide-svelte/icons/file-text';
  import FileImage from 'lucide-svelte/icons/file-image';
  import FileSpreadsheet from 'lucide-svelte/icons/file-spreadsheet';
  import FileIcon from 'lucide-svelte/icons/file';
  import Check from 'lucide-svelte/icons/check';
  import X from 'lucide-svelte/icons/x';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import CircleAlert from 'lucide-svelte/icons/circle-alert';
  import Folder from 'lucide-svelte/icons/folder';
  import Compass from 'lucide-svelte/icons/compass';
  import XIcon from 'lucide-svelte/icons/x';
  import FileCheck from 'lucide-svelte/icons/file-check';
  import Circle from 'lucide-svelte/icons/circle';

  interface Document {
    id: string;
    name: string;
    folder: string;
    fileType: string | null;
    fileSize: number | null;
    tags: string[];
    uploadedAt: string;
    url: string | null;
  }

  interface RequiredDoc {
    name: string;
    description: string | null;
    uploaded: boolean;
    documentId: string | null;
  }

  let { data, form } = $props();

  const documents: Document[] = data.documents ?? [];
  const requiredDocs: RequiredDoc[] = data.requiredDocs ?? [];
  const currentBuildPhase: string | null = data.currentBuildPhase ?? null;

  let showUploadModal = $state(false);
  let selectedFolder = $state('All');
  let requiredExpanded = $state(false);
  let uploadFolder = $state('Other');

  // Feature A: "What's Next" dismissable
  let whatsNextDismissed = $state(false);

  // Feature G: Phase document prompts
  let phaseDocsExpanded = $state(true);

  const phaseDocuments: Record<string, string[]> = {
    'Pre-Construction': ['Planning permission decision notice', 'Building regulations approval', 'Structural engineer calculations', 'Site insurance certificate', 'Structural warranty confirmation', 'Party wall agreement (if applicable)', 'Soil survey report'],
    'Groundworks': ['Foundation design drawings', 'Drainage layout plan', 'Site setup plan'],
    'Foundations': ['Foundation inspection records', 'Concrete delivery tickets'],
    'Superstructure': ['Window order confirmation', 'Steelwork design calculations'],
    'First Fix': ['Kitchen layout plan', 'Bathroom layout plans', 'Electrical layout plan', 'Heating system design'],
    'Completion': ['Electrical installation certificate (Part P)', 'Gas safety certificate', 'Boiler commissioning certificate', 'EPC certificate', 'Air tightness test result', 'Building control completion certificate', 'Structural warranty final certificate'],
  };

  const currentPhaseDocList = $derived(
    currentBuildPhase ? (phaseDocuments[currentBuildPhase] ?? null) : null
  );

  const folders = [
    'All',
    'Planning',
    'Contracts',
    'Insurance',
    'Building Control',
    'Warranty',
    'Financial',
    'Other',
  ] as const;

  const folderSelectOptions = folders
    .filter((f) => f !== 'All')
    .map((f) => ({ value: f, label: f }));

  const uploadedRequired = $derived(requiredDocs.filter((d) => d.uploaded).length);
  const totalRequired = $derived(requiredDocs.length);
  const progressPct = $derived(totalRequired > 0 ? Math.round((uploadedRequired / totalRequired) * 100) : 0);

  const filteredDocuments = $derived(
    selectedFolder === 'All'
      ? documents
      : documents.filter((d) => d.folder === selectedFolder)
  );

  function folderCount(folder: string): number {
    if (folder === 'All') return documents.length;
    return documents.filter((d) => d.folder === folder).length;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(fileType: string | null) {
    if (!fileType) return FileIcon;
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return FileSpreadsheet;
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return FileText;
    return FileIcon;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Documents</h1>
    <Button onclick={() => (showUploadModal = true)} size="sm">
      <Upload size={16} />
      Upload
    </Button>
  </div>

  <!-- Feature A: What's Next prompt -->
  {#if !whatsNextDismissed}
    <div class="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 py-3 px-4">
      <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-700/60">
        <Compass size={14} class="text-zinc-500 dark:text-zinc-400" />
      </div>
      <p class="flex-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Upload key documents as you get them &mdash; planning approval, insurance certificates, contracts. Everything in one place.
      </p>
      <button
        onclick={() => (whatsNextDismissed = true)}
        class="flex-shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
      >
        <XIcon size={14} />
      </button>
    </div>
  {/if}

  <!-- Feature G: Phase document prompts -->
  {#if currentPhaseDocList && currentPhaseDocList.length > 0}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <button
        class="flex w-full items-center justify-between px-5 py-4"
        onclick={() => (phaseDocsExpanded = !phaseDocsExpanded)}
      >
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <FileCheck size={18} class="text-indigo-500 dark:text-indigo-400" />
          </div>
          <div class="text-left">
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Documents you should have
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Based on your current phase: {currentBuildPhase}
            </p>
          </div>
        </div>
        <div class="text-zinc-400">
          {#if phaseDocsExpanded}
            <ChevronDown size={18} />
          {:else}
            <ChevronRight size={18} />
          {/if}
        </div>
      </button>

      {#if phaseDocsExpanded}
        <div class="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div class="space-y-1">
            {#each currentPhaseDocList as docName}
              <div class="flex items-center gap-3 rounded-lg px-3 py-2">
                <Circle size={14} class="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                <p class="text-sm text-zinc-700 dark:text-zinc-300">{docName}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Required documents banner -->
  {#if requiredDocs.length > 0}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <button
        class="flex w-full items-center justify-between px-5 py-4"
        onclick={() => (requiredExpanded = !requiredExpanded)}
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg {uploadedRequired === totalRequired ? 'bg-green-50 dark:bg-green-950/40' : 'bg-amber-50 dark:bg-amber-950/40'}">
            {#if uploadedRequired === totalRequired}
              <Check size={20} class="text-green-500 dark:text-green-400" />
            {:else}
              <CircleAlert size={20} class="text-amber-500 dark:text-amber-400" />
            {/if}
          </div>
          <div class="text-left">
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {uploadedRequired} of {totalRequired} required documents uploaded
            </p>
            <!-- Progress bar -->
            <div class="mt-2 flex items-center gap-3">
              <div class="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  class="h-full rounded-full transition-all duration-500 {uploadedRequired === totalRequired ? 'bg-green-500' : 'bg-amber-500'}"
                  style="width: {progressPct}%"
                ></div>
              </div>
              <span class="text-xs font-medium text-zinc-400">{progressPct}%</span>
            </div>
          </div>
        </div>
        <div class="text-zinc-400">
          {#if requiredExpanded}
            <ChevronDown size={18} />
          {:else}
            <ChevronRight size={18} />
          {/if}
        </div>
      </button>

      {#if requiredExpanded}
        <div class="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div class="space-y-1">
            {#each requiredDocs as doc}
              <div class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                {#if doc.uploaded}
                  <div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                    <Check size={13} class="text-green-600 dark:text-green-400" />
                  </div>
                {:else}
                  <div class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700">
                    <X size={11} class="text-zinc-300 dark:text-zinc-600" />
                  </div>
                {/if}
                <div>
                  <p class="text-sm text-zinc-800 dark:text-zinc-200 {doc.uploaded ? 'line-through opacity-50' : 'font-medium'}">
                    {doc.name}
                  </p>
                  {#if doc.description}
                    <p class="text-xs text-zinc-400 dark:text-zinc-500">{doc.description}</p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Main layout: sidebar + content -->
  <div class="flex gap-6">
    <!-- Folder sidebar (desktop) -->
    <nav class="hidden w-52 flex-shrink-0 lg:block">
      <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Folders</p>
      <div class="space-y-0.5">
        {#each folders as folder}
          {@const count = folderCount(folder)}
          <button
            onclick={() => (selectedFolder = folder)}
            class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors {selectedFolder === folder
              ? 'bg-accent-50 font-semibold text-accent-700 dark:bg-accent-950/50 dark:text-accent-400'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'}"
          >
            <span class="flex items-center gap-2.5">
              {#if folder === 'All'}
                <FolderOpen size={15} class="{selectedFolder === folder ? 'text-accent-500' : 'text-zinc-400'}" />
              {:else}
                <Folder size={15} class="{selectedFolder === folder ? 'text-accent-500' : 'text-zinc-400'}" />
              {/if}
              {folder}
            </span>
            {#if count > 0}
              <span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {count}
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </nav>

    <!-- Content area -->
    <div class="min-w-0 flex-1">
      <!-- Mobile folder tabs -->
      <div class="mb-4 lg:hidden">
        <select
          bind:value={selectedFolder}
          class="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {#each folders as folder}
            <option value={folder}>{folder} ({folderCount(folder)})</option>
          {/each}
        </select>
      </div>

      <!-- Document list -->
      {#if filteredDocuments.length === 0}
        <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <FolderOpen size={28} class="text-zinc-300 dark:text-zinc-600" />
            </div>
            <p class="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {selectedFolder === 'All' ? 'No documents uploaded yet' : `No documents in ${selectedFolder} yet`}
            </p>
            <p class="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Upload your build documents to keep everything organised
            </p>
            <div class="mt-5">
              <Button size="sm" onclick={() => { uploadFolder = selectedFolder === 'All' ? 'Other' : selectedFolder; showUploadModal = true; }}>
                <Upload size={14} />
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      {:else}
        <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
          <div class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {#each filteredDocuments as doc}
              {@const Icon = getFileIcon(doc.fileType)}
              <div class="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <Icon size={20} class="text-zinc-500 dark:text-zinc-400" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{doc.name}</p>
                  <div class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>{formatDate(doc.uploadedAt)}</span>
                    {#if doc.fileSize}
                      <span>{formatFileSize(doc.fileSize)}</span>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-shrink-0 items-center gap-2">
                  {#each doc.tags as tag}
                    <Badge variant="not_started" size="sm">{tag}</Badge>
                  {/each}
                  <Badge variant="info" size="sm">{doc.folder}</Badge>
                  {#if doc.url}
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      <FileText size={15} />
                    </a>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Drag & drop upload area -->
      <div class="mt-6">
        <div
          class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 px-6 py-10 transition-colors hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50"
          onclick={() => (showUploadModal = true)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showUploadModal = true; }}
          role="button"
          tabindex="0"
        >
          <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Upload size={20} class="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">
            <span class="font-semibold text-accent-600 dark:text-accent-400">Drop files here</span> or click to browse
          </p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            PDF, DOC, XLS, JPG, PNG up to 25MB
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Upload Modal -->
<Modal bind:open={showUploadModal} title="Upload Document">
  <form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance class="space-y-4">
    <Input label="Document Name" name="name" placeholder="Optional - defaults to file name" />

    <Select label="Folder" name="folder" options={folderSelectOptions} bind:value={uploadFolder} />

    <FileUpload name="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.txt" />

    <Input label="Tags" name="tags" placeholder="e.g. planning, approved (comma-separated)" />

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showUploadModal = false)}>Cancel</Button>
      <Button type="submit">Upload</Button>
    </div>
  </form>
</Modal>
