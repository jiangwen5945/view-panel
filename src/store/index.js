import { createStore } from 'vuex'

export default createStore({
  state: {
    theme: 'dark'
  },
  getters: {
  },
  mutations: {
    changeTheme (state) {
      state.theme = state.theme === 'shine' ? 'dark' : 'shine'
    }
  },
  actions: {
  },
  modules: {
  }
})
