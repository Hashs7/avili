<template>
  <div class="follower" ref="follower" >
    <CursorIcon />
  </div>
</template>

<script>
  import gsap from 'gsap';
  import CursorIcon from '@/assets/icons/cursor.svg';

  export default {
    name: 'Follower',
    components: {
      CursorIcon,
    },
    data() {
      return {
        enable: true,
        state: 'normal',
        isAnimating: false,
        pressed: false,
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
      window.addEventListener('mouseup',  (e) => this.boundPressOut(e));
      document.addEventListener('mouseenter',  () => this.boundEnterFollower());
      document.addEventListener('mouseleave',  () => this.boundLeaveFollower ());
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.boundOnKeyDown);
      window.addEventListener('mousemove', this.boundMouseMove);
      window.removeEventListener('mousedown', this.boundPressIn);
      window.removeEventListener('mouseup', this.boundPressOut);
      document.removeEventListener('mouseenter', this.boundEnterFollower);
      document.removeEventListener('mouseleave', this.boundLeaveFollower);
    },
    methods: {
      setState(newState) {
        if (this.state === newState) return;
        this.applyAnimation(newState)
      },
      enterFollower() {
        this.state = 'initial';
        gsap.killTweensOf(this.$refs.follower, 'scale');
        gsap.to(this.$refs.follower, 0.2, { scale: 1, opacity: 1 });
      },
      leaveFollower() {
        this.state = 'leave';
        gsap.to(this.$refs.follower, 0.2, { scale: 0, opacity: 0 });
      },
      pressIn(){
        this.pressed = true;
        this.isAnimating = true;
        gsap.killTweensOf(this.$refs.follower, 'scale');
        gsap.to(this.$refs.follower, 0.5, {
          scale: .5,
          onComplete: () => {
            this.isAnimating = false;
          },
        });
      },
      pressOut(e) {
        this.pressed = false;
        this.isAnimating = true;
        if (e.target.dataset.click === 'disapear') {
          // this.scale = 1;
        }
        gsap.killTweensOf(this.$refs.follower, 'scale');
        gsap.to(this.$refs.follower, 1, {
          scale: this.scale,
          ease: 'elastic.out(1.8, 0.5)',
          onComplete: () => {
            // this.isAnimating = false;
          },
        });
        //Fake complete
        gsap.delayedCall(.3, () => this.isAnimating = false)
      },
      mouseMove(e) {
        if (this.state === 'none') this.enterFollower();
        const { follower } = this.$refs;
        if (!follower) return;
        const relX = e.pageX  - (follower.offsetWidth / 2) ;
        const relY = e.pageY - (follower.offsetHeight / 2);

        gsap.to(follower, { x: relX, y: relY, duration: 0.3 });
        this.applyAnimation(e.target.dataset.hover)
      },
      applyAnimation(name) {
        const { follower } = this.$refs;
        switch(name) {
          case "big":
            follower.style.mixBlendMode = "difference";
            this.scale = 2;
            if (this.pressed || this.isAnimating) return;
            this.state = 'big';
            gsap.to(follower, { scale: 2, duration: 0.5 });
            break;
          case "none":
            // à debug si on utilise
            follower.style.mixBlendMode = "normal";
            this.state = 'none';
            this.scale = 0;
            // if (this.pressed) return;
            gsap.to(follower, { scale: 0, duration: 0.5 });
            break;
          default:
            if (this.state === 'normal') return;
            follower.style.mixBlendMode = "normal";
            this.scale = 1;
            if (this.pressed || this.isAnimating) return;
            this.state = 'normal';
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
  /*border-radius: 50%;*/
  width: 50px;
  height: 50px;
  /*border: 1px solid antiquewhite;*/
  /*background-color: antiquewhite;*/
  /*opacity: 0.8;*/
  /*background-color: #f6f6f6;*/
  pointer-events: none;
}
</style>
