<template>
  <div class="modal">
    <div class="content"></div>
  </div>
</template>

<script>
  export default {
    name: "FinalScreen"
  }
</script>

<style scoped>
  .modal {
    z-index: 1000;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: black;
  }

  .content {}
</style>