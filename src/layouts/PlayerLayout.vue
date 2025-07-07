<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar persistente -->
    <PlayerNavbar />

    <!-- Contenido dinámico -->
    <main class="max-w-7xl mx-auto p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import PlayerNavbar from '@/components/PlayerNavbar.vue'
</script>
