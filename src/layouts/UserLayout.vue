<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar persistente -->
    <UserNavbar />

    <!-- Contenido dinámico -->
    <main class="max-w-7xl mx-auto p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import UserNavbar from '@/components/UserNavbar.vue'
</script>
