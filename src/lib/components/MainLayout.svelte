<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import { MetaTags, type MetaTagsProps } from "svelte-meta-tags";

  import Header from "$lib/components/Header.svelte";
  import { siteConfig, tabLinks } from "$lib/utilities/config";

  type Tab = "events" | "attendance" | "settings";
  interface $$Props extends MetaTagsProps {
    title: string;
    activeTab?: Tab;
  }

  export let title: $$Props["title"];
  export let description: $$Props["description"] = siteConfig.description;

  export let activeTab: Tab | undefined = undefined;
</script>

<MetaTags
  {title}
  {description}
  {...$$restProps}
  titleTemplate={`%s | ${siteConfig.title}`} />

<Header />

<div class="container py-3 space-y-4">
  <div class="mt-4">
    <h1 class="text-3xl font-bold tracking-tight">Event Management</h1>
  </div>
  <div
    class="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
    {#each tabLinks as tablink}
      {#if !tablink.disabled}
        <a
          href={tablink.href}
          class={twMerge(
            "rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all capitalize",
            activeTab === tablink.name && "bg-background text-foreground shadow"
          )}>
          {tablink.name}
        </a>
      {/if}
    {/each}
  </div>

  <main>
    <slot />
  </main>
</div>
