<template>
    <!-- User Menu Component -->
    <li>
        <router-link :to="{ name: 'Home' }" class="nav-link" aria-current="page" @click="onMenuAction">
            Inicio
        </router-link>
    </li>
    <li>
        <router-link :to="{ name: 'IndexTournament' }" class="nav-link" @click="onMenuAction">
            Torneos
        </router-link>
    </li>
    <li>
        <router-link :to="{ name: 'IndexPlayer' }" class="nav-link" @click="onMenuAction">
            Jugadores
        </router-link>
    </li>
    <li>
        <router-link :to="{ name: 'IndexUser' }" class="nav-link" @click="onMenuAction">
            Usuarios
        </router-link>
    </li>
</template>

<script setup lang="ts">
// Emite 'menu-action' al clickear cualquier link del menú
const emit = defineEmits < { (e: 'menu-action'): void }> ()

const onMenuAction = () => emit('menu-action')
</script>
