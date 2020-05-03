<template>
    <div class="follower" ref="follower"></div>
</template>

<script>
  import gsap from 'gsap';

  export default {
    name: 'Follower',
    data() {
      return {
        enable: true,
        state: 'normal'
      }
    },
    mounted() {
      if (!this.enable) return;
      document.body.style.cursor = 'none';
      this.boundMouseMove = (e) => this.mouseMove(e);
      this.boundPressIn = (e) => this.pressIn(e);
      this.boundPressOut = (e) => this.pressOut(e);
      this.boundEnterFollower = () => this.enterFollower();
      this.boundLeaveFollower = () => this.leaveFollower();

      window.addEventListener('mousemove',  (e) => this.boundMouseMove(e));
      window.addEventListener('mousedown',  () => this.boundPressIn());
      window.addEventListener('mouseup',  () => this.boundPressOut());
      document.addEventListener('mouseenter',  () => this.boundEnterFollower());
      document.addEventListener('mouseleave',  () => this.boundLeaveFollower ());
    },
    beforeDestroy() {
      //console.log('destroy');
      document.removeEventListener('keydown', this.boundOnKeyDown);
      window.addEventListener('mousemove', this.boundMouseMove);
      window.removeEventListener('mousedown', this.boundPressIn);
      window.removeEventListener('mouseup', this.boundPressOut);
      document.removeEventListener('mouseenter', this.boundEnterFollower);
      document.removeEventListener('mouseleave', this.boundLeaveFollower);
    },
    methods: {
      enterFollower() {
        this.state = 'initial';
        gsap.to(this.$refs.follower, 0.3, { scale: 1, opacity: 1 });
      },
      leaveFollower() {
        this.state = 'leave';
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
      mouseMove(e) {
        if (this.state === 'none') this.enterFollower();
        const { follower } = this.$refs;
        if (!follower) return;
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
            // à debug si on utilise
            follower.style.mixBlendMode = "normal";
            this.state = 'none';
            gsap.to(follower, { scale: 0, duration: 0.5 });
            break;
          default:
            if (this.state === 'normal') return;
            this.state = 'normal';
            follower.style.mixBlendMode = "normal";
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
  /*mix-blend-mode: difference;*/
  position: absolute;
  top: 0;
  z-index: 1500;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  /*border: 1px solid antiquewhite;*/
  background-color: antiquewhite;
  opacity: 0.8;
  /*background-color: #f6f6f6;*/
  pointer-events: none;
}
</style>
