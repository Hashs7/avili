<template>
  <div class="modal end-screen">
    <IntroLayout :show="true" :white="true">
      <div class="quality-selection__box">
        <div class="quality-selection__header">
          <h1 class="quality-selection__title">{{ $t('ui.end') }}</h1>
          <Chevron class="quality-selection__chevron" />
        </div>
        <ul class="quality-selection__container">
          <li data-hover="big">
            <Button @click="copy" :contrast="true">Partager</Button>
          </li>
          <li data-hover="big">
            <Button @click="openDiscord" :contrast="true">Discord</Button>
          </li>
        </ul>
      </div>
    </IntroLayout>
  </div>
</template>

<script>
  import IntroLayout from '@/components/UI/IntroLayout';
  import Button from '@/components/UI/Quality/QualityButton';
  import Chevron from '@/assets/icons/chevron.svg';

  export default {
    name: "FinalScreen",
    components: {
      Chevron,
      Button,
      IntroLayout,
    },
    methods: {
      copy() {
        console.log('copy to clipboard');
      },
      openDiscord() {
        console.log('Open discord');
      }
    },
  }
</script>

<style lang="scss" scoped>
  .modal {
    z-index: 1000;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: black;
  }

  .end-screen {
    .quality-selection__box {
      max-width: 500px;
    }
    .quality-selection__header {
      max-width: 360px;
    }
  }
</style>