<template>
    <div class="quality-selection__box">
      <div class="quality-selection__header">
        <h1 class="quality-selection__title">Sélectionnez le niveau de qualité de l'expérience</h1>
        <Chevron class="quality-selection__chevron" />
      </div>
      <ul class="quality-selection__container">
        <li
            v-for="(q, i) in QUALITY_SETTING"
            :key="i"
            :class="{recommended: q.recommended}"
            data-hover="big"
        >
          <Button @click="selectQuality(q)">{{ q.name }}</Button>
        </li>
      </ul>
    </div>
</template>

<script>
  import Button from '@/components/UI/Quality/QualityButton';
  import { QUALITY_SETTING } from "../../../constantes";
  import Chevron from '@/assets/icons/chevron.svg';

  export default {
    name: 'QualitySelection',
    components: {
      Chevron,
      Button,
    },
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

<style lang="scss">
  .quality-selection__box {
    text-align: center;
    max-width: 580px;
    width: 100%;
  }

  .circle-background {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 540px;
  }

  .quality-selection__header {
    max-width: 280px;
    margin: 0 auto;
  }

  .quality-selection__title {
    font-size: 22px;
    line-height: 1.5;
  }

  .quality-selection__chevron {
    width: 130px;
    margin: 12px auto 0 auto;
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