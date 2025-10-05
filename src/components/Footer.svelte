<script lang="ts">
  import logo from "../assets/logo.webp";
</script>

<footer class="border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
  <div class="max-w-7xl mx-auto px-4 md:px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <img src={logo} alt="SPACE GEN Z" class="w-8 h-8 object-contain" />
          <span class="font-bold text-white">SPACE GEN Z</span>
        </div>
        <p class="text-sm text-gray-200">
          Rastreando y monitoreando objetos cercanos a la Tierra para proteger
          nuestro planeta.
        </p>
      </div>

      <div>
        <h4 class="mb-4 text-white">Recursos</h4>
        <ul class="space-y-2 text-sm text-gray-200">
          <li>
            <a
              href="https://www.spaceappschallenge.org/2025/challenges/meteor-madness/?tab=resources"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">Recursos de NASA</a
            >
          </li>
          <li>
            <a
              href="https://nasa-meteor-challenge.koyeb.app/docs"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">Acceso a API</a
            >
          </li>
        </ul>
      </div>

      <div>
        <h4 class="mb-4 text-white">Acerca de</h4>
        <ul class="space-y-2 text-sm text-gray-200">
          <li>
            <a
              href="https://www.spaceappschallenge.org/2025/challenges/meteor-madness"
              class="hover:text-cyan-400 transition-colors">Misión</a
            >
          </li>
          <li>
            <a
              href="https://www.spaceappschallenge.org/2025/find-a-team/capibaras-espaciales/?tab=members"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">Equipo</a
            >
          </li>
          <li>
            <a
              href="mailto:ejibajazuniga@gmail.com"
              class="hover:text-cyan-400 transition-colors">Contacto</a
            >
          </li>
        </ul>
      </div>

      <!-- <div>
        <h4 class="mb-4 text-white">Conectar</h4>
        <ul class="space-y-2 text-sm text-gray-200">
          <li>
            <a href="#" class="hover:text-cyan-400 transition-colors">Twitter</a
            >
          </li>
          <li>
            <a href="#" class="hover:text-cyan-400 transition-colors">GitHub</a>
          </li>
          <li>
            <a href="#" class="hover:text-cyan-400 transition-colors">Boletín</a
            >
          </li>
        </ul>
      </div> -->
    </div>

    <div
      class="pt-8 border-t border-white/10 text-center text-sm text-gray-200"
    >
      <p>© 2025 SPACE GEN Z. Todos los datos son de acceso público.</p>
    </div>
  </div>
</footer>
