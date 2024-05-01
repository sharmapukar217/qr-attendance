<script>
  import { toggleMode, mode } from "mode-watcher";
</script>

<header
  class="sticky top-0 z-[100] border-b py-3 bg-background/90 backdrop-blur-sm shadow-sm shadow-foreground/20">
  <div class="container flex items-center">
    <div>
      <a href="/" class="size-10"> Logo </a>
    </div>

    <div class="ml-auto inline-flex items-center space-x-4">
      <button
        title="Toggle theme"
        on:click={() => toggleMode()}
        class="size-8 rounded-full text-muted-foreground inline-flex items-center justify-center text-center
          hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background">
        <div
          class="w-5 h-5"
          class:icon-[heroicons--sun]={$mode == "light"}
          class:icon-[heroicons--moon]={$mode == "dark"}>
        </div>
      </button>
    </div>
  </div>
</header>
