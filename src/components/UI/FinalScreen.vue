<template>
  <div class="modal">
    <div class="content">
      <p>La phrase de fin</p>
      <p>Abonne toi poto</p>
    </div>
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