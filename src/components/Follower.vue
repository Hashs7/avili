<template>
    <div class="follower" ref="follower" @mousedown="pressIn"></div>
</template>

<script>
  import gsap from 'gsap';

  export default {
    name: 'Follower',
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
            follower.style.mixBlendMode = "difference";
            gsap.to(follower, 0.3, { scale: 2 });
            break;
          case "none":
            gsap.to(follower, 0.5, { scale: 0 });
            break;
          default:
            follower.style.mixBlendMode = "initial";
            // gsap.to(follower, 0.2, { scale: 1 });
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
  /*border: 1px solid antiquewhite;*/
  background-color: #f6f6f6;
  pointer-events: none;
}
</style>
