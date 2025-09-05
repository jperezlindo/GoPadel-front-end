<template>
    <li>
        <router-link :to="{ name: 'Home' }" class="nav-link" aria-current="page" @click="$emit('menu-action')">Inicio</router-link>
    </li>
    <li>
        <router-link :to="{ name: 'IndexTournament' }" class="nav-link" @click="$emit('menu-action')">Torneos</router-link>
    </li>
    <li>
        <router-link :to="{ name: 'IndexPlayer' }" class="nav-link" @click="$emit('menu-action')">Jugadores</router-link>
    </li>
    <li>
        <router-link :to="{ name: 'IndexUser' }" class="nav-link" @click="$emit('menu-action')">Usuarios</router-link>
    </li>
</template>

<script setup>
// No logic needed, emits menu-action on click
</script>