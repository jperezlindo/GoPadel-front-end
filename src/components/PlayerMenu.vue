<template>
    <!-- Player Menu -->
    <li>
        <router-link :to="{ name: 'Home' }" class="hover:text-blue-600" @click="onMenuAction">
            Inicio
        </router-link>
    </li>
    <li>
        <router-link :to="{ name: 'OpenTournaments' }" class="hover:text-blue-600" @click="onMenuAction">
            Torneos Abiertos
        </router-link>
    </li>
    <li>
        <router-link :to="''" class="hover:text-blue-600" @click="onMenuAction">
            Mis Inscripciones
        </router-link>
    </li>
    <li>
        <router-link :to="{ name: 'InfoPlayer' }" class="hover:text-blue-600" @click="onMenuAction">
            Jugador
        </router-link>
    </li>
</template>

<script setup lang="ts">
// Emite 'menu-action' cuando se hace click en cualquier item del menú.
const emit = defineEmits < { (e: 'menu-action'): void }> ()

const onMenuAction = () => emit('menu-action')
</script>
