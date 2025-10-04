<div class="absolute inset-0 overflow-hidden">
  <!-- Capa de estrellas -->
  <div class="absolute inset-0 bg-[#000000]">
    <div
      class="absolute inset-0"
      style="
        background-image: radial-gradient(2px 2px at 20% 30%, white, transparent),
                         radial-gradient(2px 2px at 60% 70%, white, transparent),
                         radial-gradient(1px 1px at 50% 50%, white, transparent),
                         radial-gradient(1px 1px at 80% 10%, white, transparent),
                         radial-gradient(2px 2px at 90% 60%, white, transparent),
                         radial-gradient(1px 1px at 33% 80%, white, transparent),
                         radial-gradient(1px 1px at 15% 90%, white, transparent);
        background-size: 200% 200%;
        animation: twinkle 8s ease-in-out infinite;
      "
    ></div>
  </div>

  <!-- Planeta Tierra -->
  <div class="absolute inset-0 flex items-center justify-center">
    <div
      class="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] rounded-full"
      style="animation: floatPlanet 20s ease-in-out infinite;"
    >
      <img
        src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlYXJ0aCUyMGZyb20lMjBzcGFjZXxlbnwxfHx8fDE3NTk0MDgzODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Planeta Tierra"
        class="w-full h-full object-cover rounded-full"
        style="animation: rotatePlanet 60s linear infinite; filter: brightness(1.1) contrast(1.2);"
      />
      <div
        class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20"
      ></div>
    </div>
  </div>

  <!-- Meteoritos -->
  <div class="absolute inset-0">
    <div
      class="absolute w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"
      style="top:20%; left:10%; animation: floatMeteorite1 15s ease-in-out infinite; box-shadow:0 0 15px rgba(255,255,255,0.3);"
    ></div>
    <div
      class="absolute w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600"
      style="top:60%; right:15%; animation: floatMeteorite2 12s ease-in-out infinite; box-shadow:0 0 20px rgba(255,100,0,0.4);"
    ></div>
    <div
      class="absolute w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-700"
      style="top:40%; left:80%; animation: floatMeteorite3 18s ease-in-out infinite; box-shadow:0 0 12px rgba(255,255,255,0.2);"
    ></div>
    <div
      class="absolute w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
      style="top:80%; left:25%; animation: floatMeteorite4 14s ease-in-out infinite; box-shadow:0 0 15px rgba(255,200,0,0.3);"
    ></div>
    <div
      class="absolute w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-red-400 to-red-700"
      style="top:15%; right:20%; animation: floatMeteorite5 16s ease-in-out infinite; box-shadow:0 0 25px rgba(255,50,50,0.4);"
    ></div>
    <div
      class="absolute w-7 h-7 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-600"
      style="bottom:10%; right:40%; animation: floatMeteorite6 13s ease-in-out infinite; box-shadow:0 0 15px rgba(255,255,255,0.25);"
    ></div>
    <div
      class="absolute w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600"
      style="top:35%; left:5%; animation: floatMeteorite1 10s ease-in-out infinite reverse; box-shadow:0 0 10px rgba(0,255,255,0.4);"
    ></div>
    <div
      class="absolute w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-600"
      style="top:70%; right:5%; animation: floatMeteorite2 11s ease-in-out infinite reverse; box-shadow:0 0 12px rgba(255,0,255,0.3);"
    ></div>
  </div>

  <!-- Gradiente overlay -->
  <div
    class="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-[#0a0e1a]/60 to-[#0a0e1a]"
  ></div>
</div>

<style>
  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes rotatePlanet {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes floatPlanet {
    0%,
    100% {
      transform: translateY(0px) scale(1);
    }
    50% {
      transform: translateY(-20px) scale(1.02);
    }
  }

  @keyframes floatMeteorite1 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(30px, -20px) rotate(90deg);
    }
    50% {
      transform: translate(50px, 10px) rotate(180deg);
    }
    75% {
      transform: translate(20px, 30px) rotate(270deg);
    }
  }

  @keyframes floatMeteorite2 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    33% {
      transform: translate(-40px, 25px) rotate(120deg);
    }
    66% {
      transform: translate(-20px, -15px) rotate(240deg);
    }
  }

  @keyframes floatMeteorite3 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(-60px, -40px) rotate(180deg);
    }
  }

  @keyframes floatMeteorite4 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(45px, 20px) rotate(90deg);
    }
    50% {
      transform: translate(30px, -25px) rotate(180deg);
    }
    75% {
      transform: translate(-15px, 15px) rotate(270deg);
    }
  }

  @keyframes floatMeteorite5 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    33% {
      transform: translate(25px, -35px) rotate(120deg);
    }
    66% {
      transform: translate(-30px, -20px) rotate(240deg);
    }
  }

  @keyframes floatMeteorite6 {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(40px, 35px) rotate(180deg);
    }
  }
</style>
