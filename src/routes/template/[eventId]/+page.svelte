<script lang="ts">
  export let data;
</script>

<div class="h-screen w-screen relative">
  <section class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <div class="h-full w-full relative">
      <img
        src={data.qr}
        alt=""
        class="h-14 w-14 absolute left-[45%] -translate-x-1/2 top-[30%]" />
      <h1 class="absolute left-[45%] -translate-x-1/2 top-[47.5%] text-background font-semibold text-sm ">ABC</h1>
    </div>
  </section>
</div>

<style lang="postcss">
  section {
    width: 55mm;
    height: 86mm;
    position: relative;
    background-image: url("/template.jpg");
    background-size: contain;
    background-repeat: no-repeat;
  }
</style>
