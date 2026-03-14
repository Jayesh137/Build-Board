<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { Plus, Pin, Phone, Mail, Star, AlertTriangle, ChevronRight } from 'lucide-svelte';

  interface Contact {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    phone: string | null;
    email: string | null;
    insuranceExpiry: string | null;
    rating: number | null;
    isPinned: boolean;
  }

  let { data, form } = $props();

  const contacts: Contact[] = data.contacts ?? [];

  let showAddContact = $state(false);

  // Group contacts by role
  const pinnedContacts = $derived(contacts.filter((c: Contact) => c.isPinned));
  const unpinnedContacts = $derived(contacts.filter((c: Contact) => !c.isPinned));

  const contactsByRole = $derived(() => {
    const groups: Record<string, Contact[]> = {};
    for (const contact of unpinnedContacts) {
      const role = contact.role || 'Other';
      if (!groups[role]) groups[role] = [];
      groups[role].push(contact);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  });

  function isInsuranceExpiring(expiry: string | null): boolean {
    if (!expiry) return false;
    const [year, month, day] = expiry.split('-').map(Number);
    const expiryDate = new Date(year, month - 1, day);
    const now = new Date();
    const daysLeft = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft < 30;
  }

  function isInsuranceExpired(expiry: string | null): boolean {
    if (!expiry) return false;
    const [year, month, day] = expiry.split('-').map(Number);
    const expiryDate = new Date(year, month - 1, day);
    return expiryDate < new Date();
  }

  function renderStars(rating: number | null): string {
    if (!rating) return '';
    return '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
  }

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
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Contacts</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
      </p>
    </div>
    <Button onclick={() => (showAddContact = true)} size="sm">
      <Plus size={16} />
      Add Contact
    </Button>
  </div>

  {#if contacts.length === 0}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No contacts yet</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Add your builders, architects, and other contacts</p>
      </div>
    </Card>
  {:else}
    <!-- Pinned contacts -->
    {#if pinnedContacts.length > 0}
      <div>
        <div class="mb-2 flex items-center gap-1.5">
          <Pin size={14} class="text-indigo-500" />
          <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pinned</h2>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {#each pinnedContacts as contact}
            <a href="/contacts/{contact.id}">
              <Card interactive>
                <div class="space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{contact.name}</p>
                      {#if contact.role}
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">{contact.role}</p>
                      {/if}
                    </div>
                    <Pin size={14} class="flex-shrink-0 text-indigo-500" />
                  </div>
                  {#if contact.company}
                    <p class="text-xs text-zinc-500">{contact.company}</p>
                  {/if}
                  <div class="flex items-center gap-3">
                    {#if contact.phone}
                      <a
                        href="tel:{contact.phone}"
                        class="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        onclick={(e) => e.stopPropagation()}
                      >
                        <Phone size={12} />
                        {contact.phone}
                      </a>
                    {/if}
                    {#if contact.email}
                      <a
                        href="mailto:{contact.email}"
                        class="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        onclick={(e) => e.stopPropagation()}
                      >
                        <Mail size={12} />
                        Email
                      </a>
                    {/if}
                  </div>
                  <div class="flex items-center gap-2">
                    {#if contact.rating}
                      <span class="text-xs text-amber-500">{renderStars(contact.rating)}</span>
                    {/if}
                    {#if isInsuranceExpiring(contact.insuranceExpiry)}
                      <Badge variant="warning" size="sm">Insurance expiring</Badge>
                    {/if}
                    {#if isInsuranceExpired(contact.insuranceExpiry)}
                      <Badge variant="critical" size="sm">Insurance expired</Badge>
                    {/if}
                  </div>
                </div>
              </Card>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Contacts by role -->
    {#each contactsByRole() as [role, roleContacts]}
      <div>
        <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">{role}</h2>
        <Card padding="compact">
          {#each roleContacts as contact, i}
            <a
              href="/contacts/{contact.id}"
              class="flex min-h-[44px] items-center gap-3 border-b border-zinc-200 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{contact.name}</p>
                  {#if contact.rating}
                    <span class="flex-shrink-0 text-xs text-amber-500">{renderStars(contact.rating)}</span>
                  {/if}
                </div>
                {#if contact.company}
                  <p class="truncate text-xs text-zinc-500">{contact.company}</p>
                {/if}
              </div>
              <div class="flex flex-shrink-0 items-center gap-3">
                {#if contact.phone}
                  <a
                    href="tel:{contact.phone}"
                    class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                    onclick={(e) => e.stopPropagation()}
                    title="Call {contact.name}"
                  >
                    <Phone size={14} />
                  </a>
                {/if}
                {#if contact.email}
                  <a
                    href="mailto:{contact.email}"
                    class="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                    onclick={(e) => e.stopPropagation()}
                    title="Email {contact.name}"
                  >
                    <Mail size={14} />
                  </a>
                {/if}
                {#if isInsuranceExpiring(contact.insuranceExpiry)}
                  <Badge variant="warning" size="sm">Ins. expiring</Badge>
                {/if}
                {#if isInsuranceExpired(contact.insuranceExpiry)}
                  <Badge variant="critical" size="sm">Ins. expired</Badge>
                {/if}
                <ChevronRight size={16} class="text-zinc-300 dark:text-zinc-600" />
              </div>
            </a>
          {/each}
        </Card>
      </div>
    {/each}
  {/if}
</div>

<!-- Add Contact Modal -->
<Modal bind:open={showAddContact} title="Add Contact">
  <form method="POST" action="?/create" use:enhance class="space-y-4">
    <Input label="Name" name="name" required placeholder="e.g. John Smith" />

    <Select label="Role" name="role" options={roleOptions} />

    <Input label="Company" name="company" placeholder="Company name" />

    <div class="grid gap-4 sm:grid-cols-2">
      <Input label="Phone" name="phone" type="tel" placeholder="07xxx xxx xxx" />
      <Input label="Email" name="email" type="email" placeholder="john@example.com" />
    </div>

    <Input label="Address" name="address" placeholder="Business address" />

    <Input label="Website" name="website" type="url" placeholder="https://..." />

    <div class="grid gap-4 sm:grid-cols-2">
      <Input label="Insurance Expiry" name="insuranceExpiry" type="date" />
      <Input label="Qualifications" name="qualifications" placeholder="e.g. NICEIC, Gas Safe" />
    </div>

    <Textarea label="Notes" name="notes" placeholder="Any additional notes..." rows={3} />

    <div class="flex items-center gap-2">
      <input type="checkbox" id="isPinned" name="isPinned" value="true" class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
      <label for="isPinned" class="text-sm text-zinc-700 dark:text-zinc-300">Pin to top</label>
    </div>

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showAddContact = false)}>Cancel</Button>
      <Button type="submit">Add Contact</Button>
    </div>
  </form>
</Modal>
