<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar persistente -->
    <UserNavbar />

    <!-- Título del panel -->
    <div class="text-center py-4">
      <h1 class="text-2xl font-bold text-blue-600">Panel de Usuario</h1>
    </div>

    <!-- Contenido dinámico -->
    <main class="max-w-7xl mx-auto p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import UserNavbar from '@/components/UserNavbar.vue'
</script>
