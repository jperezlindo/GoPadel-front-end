<template>
    <li><router-link :to="{ name: 'OpenTournaments' }" class="hover:text-blue-600" @click="$emit('menu-action')">Torneos Abiertos</router-link></li>
    <li><router-link :to="''" class="hover:text-blue-600" @click="$emit('menu-action')">Mis Inscripciones</router-link></li>
    <li><router-link :to="{ name: 'InfoPlayer' }" class="hover:text-blue-600" @click="$emit('menu-action')">Jugador</router-link></li>
</template>

<script setup>
</script>