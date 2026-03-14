<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { ArrowLeft, Phone, Mail, Globe, MapPin, Pin } from 'lucide-svelte';

  interface Contact {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    notes: string | null;
    insuranceExpiry: string | null;
    qualifications: string | null;
    contractValue: number | null;
    rating: number | null;
    isPinned: boolean;
    createdAt: string;
  }

  let { data, form } = $props();

  const contact: Contact | null = data.contact;

  const roleOptions = [
    { value: '', label: 'Select role...' },
    { value: 'Architect', label: 'Architect' },
    { value: 'Structural Engineer', label: 'Structural Engineer' },
    { value: 'Builder / Main Contractor', label: 'Builder / Main Contractor' },
    { value: 'Electrician', label: 'Electrician' },
    { value: 'Plumber', label: 'Plumber' },
    { value: 'Groundworker', label: 'Groundworker' },
    { value: 'Roofer', label: 'Roofer' },
    { value: 'Plasterer', label: 'Plasterer' },
    { value: 'Kitchen Supplier', label: 'Kitchen Supplier' },
    { value: 'Building Control', label: 'Building Control' },
    { value: 'Warranty Inspector', label: 'Warranty Inspector' },
    { value: 'Solicitor', label: 'Solicitor' },
    { value: 'Planning Consultant', label: 'Planning Consultant' },
    { value: 'Other', label: 'Other' },
  ];

  const ratingOptions = [
    { value: '', label: 'No rating' },
    { value: '1', label: '1 star' },
    { value: '2', label: '2 stars' },
    { value: '3', label: '3 stars' },
    { value: '4', label: '4 stars' },
    { value: '5', label: '5 stars' },
  ];

  function formatCurrency(pence: number): string {
    const pounds = pence / 100;
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pounds);
  }
</script>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/contacts" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
    <ArrowLeft size={16} />
    Back to Contacts
  </a>

  {#if !contact}
    <Card>
      <div class="py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Contact not found</p>
      </div>
    </Card>
  {:else}
    <!-- Contact header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{contact.name}</h1>
          {#if contact.isPinned}
            <Pin size={16} class="text-indigo-500" />
          {/if}
        </div>
        {#if contact.role}
          <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{contact.role}</p>
        {/if}
        {#if contact.company}
          <p class="text-sm text-zinc-500 dark:text-zinc-400">{contact.company}</p>
        {/if}
      </div>
      <div class="flex gap-2">
        {#if contact.phone}
          <a href="tel:{contact.phone}" class="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <Phone size={14} />
            Call
          </a>
        {/if}
        {#if contact.email}
          <a href="mailto:{contact.email}" class="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <Mail size={14} />
            Email
          </a>
        {/if}
      </div>
    </div>

    <!-- Quick info cards -->
    {#if contact.phone || contact.email || contact.address || contact.website}
      <div class="grid gap-3 sm:grid-cols-2">
        {#if contact.phone}
          <Card padding="compact">
            <div class="flex items-center gap-2">
              <Phone size={14} class="text-zinc-400" />
              <a href="tel:{contact.phone}" class="text-sm text-indigo-600 dark:text-indigo-400">{contact.phone}</a>
            </div>
          </Card>
        {/if}
        {#if contact.email}
          <Card padding="compact">
            <div class="flex items-center gap-2">
              <Mail size={14} class="text-zinc-400" />
              <a href="mailto:{contact.email}" class="truncate text-sm text-indigo-600 dark:text-indigo-400">{contact.email}</a>
            </div>
          </Card>
        {/if}
        {#if contact.address}
          <Card padding="compact">
            <div class="flex items-center gap-2">
              <MapPin size={14} class="flex-shrink-0 text-zinc-400" />
              <span class="text-sm text-zinc-700 dark:text-zinc-300">{contact.address}</span>
            </div>
          </Card>
        {/if}
        {#if contact.website}
          <Card padding="compact">
            <div class="flex items-center gap-2">
              <Globe size={14} class="text-zinc-400" />
              <a href={contact.website} target="_blank" rel="noopener noreferrer" class="truncate text-sm text-indigo-600 dark:text-indigo-400">{contact.website}</a>
            </div>
          </Card>
        {/if}
      </div>
    {/if}

    <!-- Edit form -->
    <Card>
      <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit Contact</h2>

      <form method="POST" action="?/update" use:enhance class="space-y-4">
        <Input label="Name" name="name" value={contact.name} required />

        <Select label="Role" name="role" options={roleOptions} value={contact.role ?? ''} />

        <Input label="Company" name="company" value={contact.company ?? ''} />

        <div class="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" name="phone" type="tel" value={contact.phone ?? ''} />
          <Input label="Email" name="email" type="email" value={contact.email ?? ''} />
        </div>

        <Input label="Address" name="address" value={contact.address ?? ''} />

        <Input label="Website" name="website" type="url" value={contact.website ?? ''} />

        <div class="grid gap-4 sm:grid-cols-2">
          <Input label="Insurance Expiry" name="insuranceExpiry" type="date" value={contact.insuranceExpiry ?? ''} />
          <Input label="Qualifications" name="qualifications" value={contact.qualifications ?? ''} />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contract Value"
            name="contractValue"
            type="number"
            step="0.01"
            value={contact.contractValue ? (contact.contractValue / 100).toString() : ''}
            placeholder="0.00"
          />
          <Select label="Rating" name="rating" options={ratingOptions} value={contact.rating?.toString() ?? ''} />
        </div>

        <Textarea label="Notes" name="notes" value={contact.notes ?? ''} rows={4} />

        <div class="flex items-center gap-2">
          <input type="checkbox" id="isPinned" name="isPinned" value="true" checked={contact.isPinned} class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
          <label for="isPinned" class="text-sm text-zinc-700 dark:text-zinc-300">Pin to top of contacts</label>
        </div>

        {#if form?.error}
          <p class="text-sm text-red-600">{form.error}</p>
        {/if}
        {#if form?.success}
          <p class="text-sm text-green-600">Contact updated successfully</p>
        {/if}

        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Button variant="secondary" type="button" onclick={() => history.back()}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Card>
  {/if}
</div>
