import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const removeItemOnce = (arr, value) => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};

export default new Vuex.Store({
  state: {
    canvasRef: null,
    pseudo: null,
    playerTalking: [],
    loadEnable: true,
    isLoading: false,
    quality: null, // Set default quality
    isPlaying: true, // Skip settings intro
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
      state.isPlaying = value;
    },
    setCommunication(state, { name, time }) {
      state.playerTalking.push(name);
      setTimeout(() =>
        state.playerTalking = removeItemOnce(state.playerTalking, name), time)
    }
  },
  actions: {
  },
  modules: {
  }
})
