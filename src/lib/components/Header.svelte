<script>
  import { toggleMode, mode } from "mode-watcher";
</script>

<header
  class="sticky top-0 z-50 border-b py-3 bg-background/90 backdrop-blur-sm shadow-sm shadow-foreground/20">
  <div class="container flex items-center">
    <div>
      <a href="/" class="">
        <svg
          class="size-10"
          viewBox="0 0 28 41"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          ><mask
            id="mask0_15_3"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="28"
            height="41"
            ><path d="M27.3132 0H0V40.489H27.3132V0Z" fill="white"></path></mask
          ><g mask="url(#mask0_15_3)"
            ><path
              d="M19.3835 25.3852C19.3835 25.1269 19.5259 24.8891 19.7546 24.7653L26.1673 21.2949C26.6421 21.038 27.2212 21.3786 27.2212 21.9149V36.3114C27.2212 36.5698 27.0789 36.8075 26.8501 36.9313L20.4375 40.4016C19.9627 40.6586 19.3835 40.318 19.3835 39.7818V25.3852Z"
              fill="#357D8A"></path
            ><path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M27.3133 8.59434C27.3133 8.02965 26.6778 7.6933 26.2044 8.00733L19.7855 12.2654C19.5429 12.4263 19.2258 12.4242 18.9853 12.2602L12.7908 8.03363C12.318 7.71108 11.6743 8.04655 11.6743 8.61543V16.2695C11.6743 16.5021 11.7897 16.7196 11.9828 16.8514L18.9853 21.6293C19.2258 21.7933 19.5429 21.7954 19.7855 21.6344L26.997 16.8506C27.1947 16.7196 27.3133 16.4994 27.3133 16.2636V8.59434Z"
              fill="#357D8A"></path
            ><path
              d="M4.16694e-05 4.9988C4.16694e-05 4.76409 0.117668 4.54472 0.3139 4.41341L6.72648 0.122106C7.19975 -0.194571 7.83768 0.141521 7.83768 0.707498V14.0056C7.83768 14.2403 7.72005 14.4597 7.52378 14.5911L1.11119 18.8823C0.637968 19.199 0 18.8629 0 18.297L4.16694e-05 4.9988Z"
              fill="#357D8A"></path
            ><path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 31.7632C0 32.3279 0.63536 32.6642 1.10879 32.3502L7.52766 28.0921C7.77041 27.9312 8.0875 27.9333 8.32802 28.0973L14.5225 32.3239C14.9952 32.6465 15.639 32.311 15.639 31.7422V24.0879C15.639 23.8556 15.5236 23.6379 15.3305 23.5062L8.32802 18.7283C8.0875 18.5642 7.77041 18.5621 7.52766 18.7231L0.316258 23.5069C0.118625 23.6379 0 23.8582 0 24.0939V31.7632Z"
              fill="#357D8A"></path
            ></g
          ></svg>
      </a>
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
