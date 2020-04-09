<template>
  <div class="quality-selection">
    <div>
      <h1>Sélectionnez la qualitée</h1>
      <ul class="quality-selection__container">
        <li
            v-for="(q, i) in qualities"
            :key="i"
            :class="{recommended: q.recommended}"
            class="quality-selection__el"
            data-hover="big"
            @click="selectQuality(q)"
        >
          {{ q.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'QualitySelection',
    data() {
      return {
        qualities: [{
          name: 'Basse',
          recommended: false,
        },{
          name: 'Moyenne',
          recommended: false,
        },{
          name: 'Haute',
          recommended: true,
        }]
      }
    },
    mounted() {
      // TODO set recommended quality base on user
    },
    methods: {
      selectQuality(quality) {
        this.$store.commit('setQuality', quality.name)
      }
    },
  }
</script>

<style lang="scss" scoped>
  .quality-selection {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $white;
    background-color: #2A2A2A;
  }

  .quality-selection__container {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
  }

  .quality-selection__el {
    padding: 8px 16px;
    font-size: 1.5rem;

    &.recommended {
      text-decoration: underline;
    }
  }
</style>