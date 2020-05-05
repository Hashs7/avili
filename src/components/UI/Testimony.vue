<template>
  <div class="testimony-container">
    <p v-if="subtitle" class="testimony">{{ subtitle }}</p>
  </div>
</template>

<script>
  export default {
    name: 'Testimony',
    data() {
      return {
        subtitle: null,
      }
    },
  }
</script>

<style lang="scss" scoped>
  .testimony-container {
    z-index: 500;
    position: fixed;
    bottom: 50px;
    left: 0;
    right: 0;
    margin: auto;
    max-width: 500px;
    text-align: center;
    font-size: 20px;
  }

  .testimony {

  }
</style>