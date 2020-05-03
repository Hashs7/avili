<template>
  <div class="quality-selection">
    <div class="quality-selection__box">
      <h1 class="quality-selection__title">Sélectionnez le niveau de qualité de l'expérience</h1>
      <ul class="quality-selection__container">
        <li
            v-for="(q, i) in QUALITY_SETTING"
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
  import { QUALITY_SETTING } from "../../constantes";

  export default {
    name: 'QualitySelection',
    data() {
      return {
        QUALITY_SETTING,
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
    z-index: 500;
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

  .quality-selection__box {
    text-align: center;
    max-width: 500px;
  }

  .quality-selection__title {
    font-size: 2rem;
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