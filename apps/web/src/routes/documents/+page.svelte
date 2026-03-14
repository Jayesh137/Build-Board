<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import {
    FolderOpen,
    Upload,
    FileText,
    FileImage,
    FileSpreadsheet,
    File as FileIcon,
    Check,
    ChevronDown,
    ChevronRight,
    AlertCircle,
  } from 'lucide-svelte';

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

  let showUploadModal = $state(false);
  let selectedFolder = $state('All');
  let requiredExpanded = $state(false);
  let uploadFolder = $state('Other');

  const folders = [
    'All',
    'Planning',
    'Contracts',
    'Insurance',
    'Building Control',
    'Warranty',
    'Financial',
    'Photos',
    'Other',
  ] as const;

  const folderSelectOptions = folders
    .filter((f) => f !== 'All')
    .map((f) => ({ value: f, label: f }));

  const uploadedRequired = $derived(requiredDocs.filter((d) => d.uploaded).length);
  const totalRequired = $derived(requiredDocs.length);

  const filteredDocuments = $derived(
    selectedFolder === 'All'
      ? documents
      : documents.filter((d) => d.folder === selectedFolder)
  );

  const documentsByFolder = $derived(() => {
    const groups: Record<string, Document[]> = {};
    for (const doc of filteredDocuments) {
      const folder = doc.folder || 'Other';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(doc);
    }
    return groups;
  });

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
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Documents</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
      </p>
    </div>
    <Button onclick={() => (showUploadModal = true)} size="sm">
      <Upload size={16} />
      Upload
    </Button>
  </div>

  <!-- Required documents banner -->
  {#if requiredDocs.length > 0}
    <Card class="{uploadedRequired < totalRequired ? 'border-amber-200 dark:border-amber-800' : 'border-green-200 dark:border-green-800'}">
      <button
        class="flex w-full items-center justify-between"
        onclick={() => (requiredExpanded = !requiredExpanded)}
      >
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-md {uploadedRequired === totalRequired ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}">
            {#if uploadedRequired === totalRequired}
              <Check size={18} class="text-green-600 dark:text-green-400" />
            {:else}
              <AlertCircle size={18} class="text-amber-600 dark:text-amber-400" />
            {/if}
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {uploadedRequired} of {totalRequired} required documents uploaded
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              {uploadedRequired === totalRequired ? 'All required documents are in order' : 'Some documents still needed'}
            </p>
          </div>
        </div>
        {#if requiredExpanded}
          <ChevronDown size={16} class="text-zinc-400" />
        {:else}
          <ChevronRight size={16} class="text-zinc-400" />
        {/if}
      </button>

      {#if requiredExpanded}
        <div class="mt-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          {#each requiredDocs as doc}
            <div class="flex items-center gap-3 rounded-md px-2 py-1.5">
              {#if doc.uploaded}
                <div class="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check size={12} class="text-green-600 dark:text-green-400" />
                </div>
              {:else}
                <div class="h-5 w-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
              {/if}
              <div>
                <p class="text-sm text-zinc-900 dark:text-zinc-100 {doc.uploaded ? 'line-through opacity-60' : ''}">{doc.name}</p>
                {#if doc.description}
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">{doc.description}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </Card>
  {/if}

  <!-- Main content: folder tree + document list -->
  <div class="flex gap-6">
    <!-- Folder tree (desktop) -->
    <nav class="hidden w-48 flex-shrink-0 lg:block">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Folders</p>
      <div class="space-y-0.5">
        {#each folders as folder}
          {@const count = folder === 'All' ? documents.length : documents.filter((d) => d.folder === folder).length}
          <button
            onclick={() => (selectedFolder = folder)}
            class="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors {selectedFolder === folder
              ? 'bg-accent-50 font-medium text-accent-700 dark:bg-accent-950 dark:text-accent-400'
              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}"
          >
            <span class="flex items-center gap-2">
              <FolderOpen size={14} />
              {folder}
            </span>
            {#if count > 0}
              <span class="text-xs text-zinc-400">{count}</span>
            {/if}
          </button>
        {/each}
      </div>
    </nav>

    <!-- Mobile folder select -->
    <div class="w-full lg:hidden">
      <Select
        label="Folder"
        options={[{ value: 'All', label: 'All Folders' }, ...folderSelectOptions]}
        bind:value={selectedFolder}
      />
    </div>
  </div>

  <!-- Document list -->
  <div class="lg:ml-54">
    {#if filteredDocuments.length === 0}
      <Card>
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {selectedFolder === 'All' ? 'No documents uploaded yet' : `No documents in ${selectedFolder}`}
          </p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Upload your build documents to keep everything organised
          </p>
          <div class="mt-4">
            <Button size="sm" onclick={() => { uploadFolder = selectedFolder === 'All' ? 'Other' : selectedFolder; showUploadModal = true; }}>
              <Upload size={14} />
              Upload Document
            </Button>
          </div>
        </div>
      </Card>
    {:else}
      <Card padding="compact">
        <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
          {#each filteredDocuments as doc}
            {@const Icon = getFileIcon(doc.fileType)}
            <div class="flex items-center gap-3 px-3 py-3">
              <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Icon size={18} class="text-zinc-500 dark:text-zinc-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{doc.name}</p>
                <div class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{formatDate(doc.uploadedAt)}</span>
                  {#if doc.fileSize}
                    <span>{formatFileSize(doc.fileSize)}</span>
                  {/if}
                  <Badge variant="info" size="sm">{doc.folder}</Badge>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-2">
                {#each doc.tags as tag}
                  <Badge variant="not_started" size="sm">{tag}</Badge>
                {/each}
                {#if doc.url}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                  >
                    <FileText size={14} />
                  </a>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {/if}
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
