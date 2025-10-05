<script>
  import { onDestroy } from "svelte";
  import logo from "../assets/logo.webp";

  let time = new Date();
  const interval = setInterval(() => {
    time = new Date();
  }, 1000);

  // Cleanup interval on component destroy
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<nav
  class="border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-md fixed top-0 w-full z-50"
>
  <div
    class="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between"
  >
    <div class="flex items-center gap-3">
      <img
        src={logo}
        alt="SPACE GEN Z"
        class="w-12 h-12 md:w-14 md:h-14 object-contain"
      />
      <div class="hidden sm:block">
        <div class="font-bold text-lg md:text-xl text-white">SPACE GEN Z</div>
        <div class="text-xs text-gray-300">Monitoreo y Rastreo Espacial</div>
      </div>
    </div>
    <div class="hidden md:flex items-center gap-6 text-sm text-white">
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a
        href="#"
        rel="noreferrer"
        target="_top"
        class="hover:text-cyan-400 transition-colors">Inicio</a
      >
      <a href="#asteroids" class="hover:text-cyan-400 transition-colors"
        >Asteroides</a
      >
      <a href="#challenge" class="hover:text-cyan-400 transition-colors"
        >Desafío</a
      >
      <a href="#about" class="hover:text-cyan-400 transition-colors">Nosotros</a
      >
    </div>
    <div class="text-xs md:text-sm text-cyan-400 font-mono">
      <div class="hidden md:block">
        {time.toUTCString()}
      </div>
      <div class="md:hidden text-center leading-tight">
        <div class="text-xs">
          {time.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
          })}
        </div>
        <div class="text-xs">
          {time.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "UTC",
          })} UTC
        </div>
      </div>
    </div>
  </div>
</nav>
