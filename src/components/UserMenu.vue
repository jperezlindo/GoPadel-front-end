<template>
    <li><router-link :to="{ name: 'Home' }" class="nav-link">Inicio</router-link></li>
    <li><router-link :to="{ name: 'IndexTournament' }" class="nav-link">Torneos</router-link></li>
    <li><router-link :to="{ name: 'IndexPlayer' }" class="nav-link">Jugadores</router-link></li>
    <li><router-link :to="{ name: 'IndexCategory' }" class="nav-link">Categorías</router-link></li>
    <li><router-link :to="{ name: 'IndexUser' }" class="nav-link">Usuarios</router-link></li>
</template>

<script setup>
</script>