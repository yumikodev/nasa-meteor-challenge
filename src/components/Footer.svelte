<script lang="ts">
  import logo from "$lib/assets/logo.webp";
  import { t } from "$lib/translations";
</script>

<footer class="border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
  <div class="max-w-7xl mx-auto px-4 md:px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <img src={logo} alt="SPACE GEN Z" class="w-8 h-8 object-contain" />
          <span class="font-bold text-white">SPACE GEN Z</span>
        </div>
        <p class="text-sm text-gray-200">
          {$t("footer.slogan")}
        </p>
      </div>

      <div>
        <h4 class="mb-4 text-white">{$t("footer.resources.title")}</h4>
        <ul class="space-y-2 text-sm text-gray-200">
          <li>
            <a
              href="https://www.spaceappschallenge.org/2025/challenges/meteor-madness/?tab=resources"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">{$t("footer.resources.nasa")}</a
            >
          </li>
          <li>
            <a
              href="https://nasa-meteor-challenge.koyeb.app/docs"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">{$t("footer.resources.api")}</a
            >
          </li>
        </ul>
      </div>

      <div>
        <h4 class="mb-4 text-white">{$t("footer.about.title")}</h4>
        <ul class="space-y-2 text-sm text-gray-200">
          <li>
            <a
              href="https://www.spaceappschallenge.org/2025/challenges/meteor-madness"
              class="hover:text-cyan-400 transition-colors">{$t("footer.about.mission")}</a
            >
          </li>
          <li>
            <a
              href="https://www.spaceappschallenge.org/2025/find-a-team/capibaras-espaciales/?tab=members"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">{$t("footer.about.team")}</a
            >
          </li>
          <li>
            <a
              href="mailto:ejibajazuniga@gmail.com"
              class="hover:text-cyan-400 transition-colors">{$t("footer.about.contact")}</a
            >
          </li>
        </ul>
      </div>

      <div>
        <h4 class="mb-4 text-white">{$t("footer.opensource.title")}</h4>
        <ul class="space-y-2 text-sm text-gray-200">
          <li>
            <a
              href="https://github.com/yumikodev/nasa-meteor-challenge"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">{$t("footer.opensource.frontend")}</a
            >
          </li>
          <li>
            <a
              href="https://github.com/yumikodev/nasa-meteor-challenge-api"
              target="_blank"
              class="hover:text-cyan-400 transition-colors">{$t("footer.opensource.backend")}</a
            >
          </li>
        </ul>
      </div>
    </div>

    <div
      class="pt-8 border-t border-white/10 text-center text-sm text-gray-200"
    >
      <p>{$t("footer.copyright")}</p>
    </div>
  </div>
</footer>
