<template>
    <div class="follower" ref="follower"></div>
</template>

<script>
  import gsap from 'gsap';

  export default {
    name: 'Follower',
    data() {
      return {
        state: 'initial'
      }
    },
    mounted() {
      document.body.style.cursor = 'none';
      window.addEventListener('mousemove',  (e) => this.mouseFollower(e));
      window.addEventListener('mousedown',  () => this.pressIn());
      window.addEventListener('mouseup',  () => this.pressOut());
      document.addEventListener('mouseenter',  () => this.enterFollower());
      document.addEventListener('mouseleave',  () => this.leaveFollower());
    },
    beforeDestroy() {
      // TODO remove all listener
    },
    methods: {
      enterFollower() {
        gsap.to(this.$refs.follower, 0.3, { scale: 1, opacity: 1 });
      },
      leaveFollower() {
        gsap.to(this.$refs.follower, 0.5, { scale: 0, opacity: 0 });
      },
      pressIn(){
        gsap.killTweensOf(this.$refs.follower, 'scale');
        gsap.to(this.$refs.follower, 0.5, { scale: .5 });
      },
      pressOut(){
        gsap.to(this.$refs.follower, 1.2, {
          scale: 1,
          ease: 'elastic.out(1.8, 0.5)',
        });
      },
      mouseFollower(e) {
        const follower = this.$refs.follower;
        const relX = e.pageX  - (follower.offsetWidth / 2) ;
        const relY = e.pageY - (follower.offsetHeight / 2);

        gsap.to(follower, 0.3, { x: relX, y: relY });

        switch(e.target.dataset.hover) {
          case "big":
            this.state = 'big';
            follower.style.mixBlendMode = "difference";
            gsap.to(follower, { scale: 2, duration: 0.5 });
            break;
          case "none":
            this.state = 'none';
            gsap.to(follower, { scale: 0, duration: 0.5 });
            break;
          default:
            if (this.state === 'initial') return;
            this.state = 'initial';
            follower.style.mixBlendMode = "initial";
            console.log('change state');
            gsap.killTweensOf(this.$refs.follower, 'scale');
            gsap.to(follower, { scale: 1, duration: 0.3 });
            break;
        }
      }
    }
  }
</script>

<style scoped>
.follower {
  mix-blend-mode: difference;
  position: absolute;
  top: 0;
  z-index: 1000;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  border: 1px solid antiquewhite;
  /*background-color: #f6f6f6;*/
  pointer-events: none;
}
</style>
