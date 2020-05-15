import Vue from 'vue'
import Vuex from 'vuex'
import { removeItemOnce } from "../utils";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    canvasRef: null,
    showAbout: false,
    pseudo: null,
    playerTalking: [],

    loadEnable: true,
    isLoading: false,
    loaderVisible: false,

    quality: null, // Set default quality
    isPlaying: false, // Skip settings intro
    isFinal: false,
  },
  mutations: {
    initScene(state, canvas) {
      state.canvasRef = canvas;
    },
    changeScene(state, { scene, camera }) {
      state.scene = scene;
      state.camera = camera;
    },
    toggleAbout(state, value) {
      state.showAbout = value;
    },
    setLoader(state, value) {
      state.loadEnable = value;
    },
    setLoaderVisible(state, value) {
      state.loaderVisible = value;
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
    },
    setFinal(state, value) {
      state.isFinal = value;
    }
  },
  actions: {
  },
  modules: {
  }
})
