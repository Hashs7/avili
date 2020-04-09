<template>
  <nav class="router">
    <router-link to="/" class="router__link">Home</router-link>
    <router-link to="/game" class="router__link">Game</router-link>
    <router-link to="/a-props" class="router__link">About</router-link>
  </nav>
</template>

<style scoped>
  .router {
    position: absolute;
    top: 16px;
    left: 32px;
  }
  .router__link {
    color: white;
    font-size: 20px;
    text-decoration: none;

    &:not(:last-child) {
      margin-right: 32px;
    }

    &.router-link-exact-active {
      text-decoration: underline;
    }
  }
</style>