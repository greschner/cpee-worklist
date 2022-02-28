import { createStore } from 'vuex';
import BaseDataApi from '../api/basedata';

export default createStore({
  state: {
    baseData: [],
  },
  mutations: {
    UPDATE_BASEDATA(state, payload) {
      state.baseData = payload;
    },
  },
  actions: {
    async setBaseData({ commit }) {
      try {
        const { data } = await BaseDataApi.getBD();
        commit('UPDATE_BASEDATA', data);
      } catch (error) {
        console.error(error);
      }
    },
  },
  modules: {
  },
});
