import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    canvasRef: null,
    pseudo: null,
    loadEnable: true,
    isLoading: false,
    quality: null, // Set default quality
    isPlaying: false, // Skip settings intro
  },
  mutations: {
    initScene(state, canvas) {
      state.canvasRef = canvas;
    },
    changeScene(state, { scene, camera }) {
      state.scene = scene;
      state.camera = camera;
    },
    setLoader(state, value) {
      state.loadEnable = value;
    },
    setLoading(state, value) {
      state.isLoading = value;
    },
    setQuality(state, value) {
      state.quality = value;
    },
    setPseudo(state, value) {
      state.pseudo = value;
    },
    setPlaying(state, value) {
      console.log('isPlaying', value);
      state.isPlaying = value;
    }
  },
  actions: {
  },
  modules: {
  }
})
