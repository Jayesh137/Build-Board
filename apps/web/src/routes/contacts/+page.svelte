<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import Pin from 'lucide-svelte/icons/pin';
  import Phone from 'lucide-svelte/icons/phone';
  import Mail from 'lucide-svelte/icons/mail';
  import Star from 'lucide-svelte/icons/star';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import Users from 'lucide-svelte/icons/users';
  import ShieldAlert from 'lucide-svelte/icons/shield-alert';
  import Shield from 'lucide-svelte/icons/shield';
  import Building2 from 'lucide-svelte/icons/building-2';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import Circle from 'lucide-svelte/icons/circle';

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
  let redFlagsExpanded = $state(false);
  let hiringChecklistExpanded = $state(false);
  let selectedRole = $state('');

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

  function daysUntilInsuranceExpiry(expiry: string | null): number | null {
    if (!expiry) return null;
    const [year, month, day] = expiry.split('-').map(Number);
    const expiryDate = new Date(year, month - 1, day);
    const now = new Date();
    return Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function isInsuranceExpiring(expiry: string | null): boolean {
    const days = daysUntilInsuranceExpiry(expiry);
    return days !== null && days >= 0 && days < 30;
  }

  function isInsuranceExpired(expiry: string | null): boolean {
    const days = daysUntilInsuranceExpiry(expiry);
    return days !== null && days < 0;
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

  // Roles that should show the hiring checklist
  const tradeRoles = new Set([
    'Builder / Main Contractor',
    'Electrician',
    'Plumber',
    'Groundworker',
    'Roofer',
    'Plasterer',
  ]);

  const isTradeRole = $derived(tradeRoles.has(selectedRole));

  // Hiring checklist items
  const hiringChecklist = [
    { label: 'Public liability insurance (minimum \u00A32M) \u2014 check it\'s current, not expired', checked: false },
    { label: 'Employer\'s liability insurance (if they have employees)', checked: false },
    { label: 'Ask for 3 recent references and actually call them', checked: false },
    { label: 'Get at least 3 written quotes with detailed scope of work', checked: false },
    { label: 'Check for trade body membership (FMB, NAPIT, Gas Safe, etc.)', checked: false },
  ];

  let checklistState = $state(hiringChecklist.map(() => false));

  function toggleChecklistItem(index: number) {
    checklistState = checklistState.map((v, i) => i === index ? !v : v);
  }

  // Red flags data
  const redFlags = [
    'Demands 50%+ payment upfront',
    'No written contract or scope of work',
    'Pressures you to sign immediately',
    'Can\'t provide insurance certificates',
    'Quote is significantly cheaper than others',
    'No physical business address',
  ];

  function roleBadgeClasses(role: string | null): string {
    if (!role) return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    const map: Record<string, string> = {
      'Architect': 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
      'Structural Engineer': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      'Builder / Main Contractor': 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
      'Electrician': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Plumber': 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
      'Groundworker': 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      'Roofer': 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
      'Plasterer': 'bg-lime-50 text-lime-700 dark:bg-lime-900/20 dark:text-lime-400',
      'Kitchen Supplier': 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
      'Warranty Inspector': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      'Solicitor': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      'Planning Consultant': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Building Control': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    };
    return map[role] ?? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  }

  // Reset checklist when modal opens/closes
  function openAddContactModal() {
    selectedRole = '';
    hiringChecklistExpanded = false;
    checklistState = hiringChecklist.map(() => false);
    showAddContact = true;
  }
</script>

<div class="space-y-8">
  <!-- Header -->
  <div class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Contacts</h1>
      {#if contacts.length > 0}
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''} in your project
        </p>
      {/if}
    </div>
    <Button onclick={openAddContactModal} size="sm">
      <Plus size={16} />
      Add Contact
    </Button>
  </div>

  <!-- Red Flags Banner -->
  <div class="rounded-xl border border-zinc-200/50 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-sm dark:border-zinc-800/50 overflow-hidden">
    <button
      onclick={() => (redFlagsExpanded = !redFlagsExpanded)}
      class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30"
    >
      <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <Shield size={15} class="text-zinc-500 dark:text-zinc-400" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Red flags when hiring trades</p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500">Things to watch out for before you commit</p>
      </div>
      <span
        class="transition-transform duration-200 text-zinc-300 dark:text-zinc-600 flex-shrink-0"
        class:rotate-180={redFlagsExpanded}
      >
        <ChevronDown size={16} />
      </span>
    </button>

    {#if redFlagsExpanded}
      <div class="border-t border-zinc-200/50 dark:border-zinc-800/50 px-4 py-3.5">
        <div class="grid gap-2 sm:grid-cols-2">
          {#each redFlags as flag}
            <div class="flex items-center gap-2.5 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/40">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
              <span class="text-sm text-zinc-600 dark:text-zinc-400">{flag}</span>
            </div>
          {/each}
        </div>
        <p class="mt-3 text-xs text-zinc-400 dark:text-zinc-500 italic">
          A good tradesperson will happily provide references, insurance, and a detailed written quote. If they push back on these basics, move on.
        </p>
      </div>
    {/if}
  </div>

  {#if contacts.length === 0}
    <!-- Empty state -->
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Users size={24} class="text-zinc-400" />
        </div>
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">No contacts yet</p>
        <p class="mt-1 max-w-xs text-sm text-zinc-400 dark:text-zinc-500">
          Add your architect, builder, and key trades to keep everything in one place.
        </p>
        <Button onclick={openAddContactModal} size="sm" class="mt-5">
          <Plus size={16} />
          Add Contact
        </Button>
      </div>
    </div>
  {:else}
    <!-- Pinned contacts -->
    {#if pinnedContacts.length > 0}
      <section>
        <div class="mb-3 flex items-center gap-2">
          <Pin size={13} class="text-indigo-500" />
          <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Pinned</span>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each pinnedContacts as contact}
            <a href="/contacts/{contact.id}" class="group block">
              <div class="relative rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300/60 dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:border-zinc-700/60 dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <!-- Pin indicator -->
                <div class="absolute right-4 top-4">
                  <Pin size={13} class="text-indigo-400/60" />
                </div>

                <!-- Name + role -->
                <div class="pr-6">
                  <h3 class="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{contact.name}</h3>
                  <div class="mt-1.5 flex flex-wrap items-center gap-2">
                    {#if contact.role}
                      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium {roleBadgeClasses(contact.role)}">
                        {contact.role}
                      </span>
                    {/if}
                    {#if contact.company}
                      <span class="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <Building2 size={11} />
                        {contact.company}
                      </span>
                    {/if}
                  </div>
                </div>

                <!-- Contact details -->
                <div class="mt-4 flex flex-col gap-2">
                  {#if contact.phone}
                    <a
                      href="tel:{contact.phone}"
                      class="inline-flex items-center gap-2 text-[13px] text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                      onclick={(e) => e.stopPropagation()}
                    >
                      <Phone size={13} class="text-zinc-400" />
                      {contact.phone}
                    </a>
                  {/if}
                  {#if contact.email}
                    <a
                      href="mailto:{contact.email}"
                      class="inline-flex items-center gap-2 text-[13px] text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                      onclick={(e) => e.stopPropagation()}
                    >
                      <Mail size={13} class="text-zinc-400" />
                      {contact.email}
                    </a>
                  {/if}
                </div>

                <!-- Footer: stars + insurance -->
                <div class="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
                  <!-- Stars -->
                  <div class="flex items-center gap-0.5">
                    {#each Array(5) as _, i}
                      <Star
                        size={14}
                        class={i < (contact.rating ?? 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-200 dark:text-zinc-700'}
                      />
                    {/each}
                  </div>

                  <!-- Insurance warnings -->
                  {#if isInsuranceExpiring(contact.insuranceExpiry)}
                    {@const days = daysUntilInsuranceExpiry(contact.insuranceExpiry)}
                    <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      <ShieldAlert size={11} />
                      Expires in {days}d
                    </span>
                  {/if}
                  {#if isInsuranceExpired(contact.insuranceExpiry)}
                    <span class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      <ShieldAlert size={11} />
                      Insurance expired
                    </span>
                  {/if}
                </div>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Contacts by role -->
    {#each contactsByRole() as [role, roleContacts]}
      <section>
        <span class="mb-3 block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">{role}</span>
        <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
          {#each roleContacts as contact, i}
            <a
              href="/contacts/{contact.id}"
              class="group flex min-h-[52px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40
                {i < roleContacts.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : ''}"
            >
              <!-- Avatar placeholder -->
              <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {contact.name.charAt(0).toUpperCase()}
              </div>

              <!-- Name + company -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{contact.name}</p>
                  {#if contact.role}
                    <span class="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium {roleBadgeClasses(contact.role)}">
                      {contact.role}
                    </span>
                  {/if}
                </div>
                {#if contact.company}
                  <p class="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">{contact.company}</p>
                {/if}
              </div>

              <!-- Quick actions + warnings -->
              <div class="flex flex-shrink-0 items-center gap-2">
                <!-- Stars (compact) -->
                {#if contact.rating}
                  <div class="hidden sm:flex items-center gap-0.5">
                    {#each Array(5) as _, i}
                      <Star
                        size={11}
                        class={i < contact.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-200 dark:text-zinc-700'}
                      />
                    {/each}
                  </div>
                {/if}

                {#if isInsuranceExpiring(contact.insuranceExpiry)}
                  <span class="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    <AlertTriangle size={10} />
                    Ins. expiring
                  </span>
                {/if}
                {#if isInsuranceExpired(contact.insuranceExpiry)}
                  <span class="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    <AlertTriangle size={10} />
                    Ins. expired
                  </span>
                {/if}

                {#if contact.phone}
                  <a
                    href="tel:{contact.phone}"
                    class="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                    onclick={(e) => e.stopPropagation()}
                    title="Call {contact.name}"
                  >
                    <Phone size={15} />
                  </a>
                {/if}
                {#if contact.email}
                  <a
                    href="mailto:{contact.email}"
                    class="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                    onclick={(e) => e.stopPropagation()}
                    title="Email {contact.name}"
                  >
                    <Mail size={15} />
                  </a>
                {/if}

                <ChevronRight size={16} class="text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div>

<!-- Add Contact Modal -->
<Modal bind:open={showAddContact} title="Add Contact">
  <form method="POST" action="?/create" use:enhance class="space-y-4">
    <Input label="Name" name="name" required placeholder="e.g. John Smith" />

    <Select label="Role" name="role" options={roleOptions} bind:value={selectedRole} />

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

    <div class="flex items-center gap-2.5">
      <input type="checkbox" id="isPinned" name="isPinned" value="true" class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800" />
      <label for="isPinned" class="text-sm text-zinc-700 dark:text-zinc-300">Pin to top of contacts</label>
    </div>

    <!-- Hiring Checklist (for trade roles only) -->
    {#if isTradeRole}
      <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20 overflow-hidden">
        <button
          type="button"
          onclick={() => (hiringChecklistExpanded = !hiringChecklistExpanded)}
          class="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30"
        >
          <Shield size={15} class="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <span class="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">Hiring Checklist</span>
          <span class="text-[11px] text-zinc-400 mr-1">Before hiring, verify</span>
          <span
            class="transition-transform duration-200 text-zinc-300 dark:text-zinc-600"
            class:rotate-180={hiringChecklistExpanded}
          >
            <ChevronDown size={14} />
          </span>
        </button>

        {#if hiringChecklistExpanded}
          <div class="border-t border-zinc-200/50 dark:border-zinc-800/50 px-4 py-3 space-y-2">
            {#each hiringChecklist as item, index}
              <button
                type="button"
                onclick={() => toggleChecklistItem(index)}
                class="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white dark:hover:bg-zinc-800/40 {checklistState[index] ? 'bg-white dark:bg-zinc-800/30' : ''}"
              >
                {#if checklistState[index]}
                  <CircleCheck size={16} class="mt-0.5 text-green-500 flex-shrink-0" />
                {:else}
                  <Circle size={16} class="mt-0.5 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                {/if}
                <span class="text-sm {checklistState[index] ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-700 dark:text-zinc-300'}">
                  {item.label}
                </span>
              </button>
            {/each}
            <p class="mt-2 text-xs text-zinc-400 dark:text-zinc-500 italic px-3">
              This checklist is for your reference only and is not saved with the contact.
            </p>
          </div>
        {/if}
      </div>
    {/if}

    {#if form?.error}
      <div class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {form.error}
      </div>
    {/if}

    <div class="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <Button variant="secondary" type="button" onclick={() => (showAddContact = false)}>Cancel</Button>
      <Button type="submit">Add Contact</Button>
    </div>
  </form>
</Modal>
