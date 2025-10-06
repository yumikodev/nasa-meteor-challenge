<script lang="ts">
  // Puedes cambiar la ruta de la imagen por la que desees
  import teamPhoto from "$lib/assets/teamPhoto.jpeg";
  import { t } from "$lib/translations";
</script>

<section id="about" class="max-w-7xl mx-auto px-4 md:px-6 py-14 relative z-20">
  <h3 class="text-center text-4xl font-bold mb-8 text-white">
    {$t("about.title")}
  </h3>
  <div
    class="bg-gray-900/70 rounded-xl shadow-md p-6 max-w-5xl w-full mx-auto flex flex-col lg:flex-row items-center gap-8"
  >
    <div class="w-full lg:w-[55%] flex-shrink-0">
      <div
        class="aspect-video rounded-lg overflow-hidden border border-white/10 bg-gray-800"
      >
        <img
          src={teamPhoto}
          alt="Foto del equipo"
          class="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>
    </div>
    <div class="w-full lg:w-[45%] flex flex-col justify-center">
      <p class="text-lg text-gray-200 text-center lg:text-left">
        {$t("about.description")}
      </p>
    </div>
  </div>
</section>
