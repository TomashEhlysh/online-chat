import { createStore } from 'vuex'
const store = createStore({
    state: {
        messages: [],
    },
    getters: {
        messages(state){
          return state.messages;
        },
    },
    mutations: {
        updateMessages(state, messagesVal){
            state.messages = messagesVal
        },
    },
    actions: {
        setMessages({ commit }, messagesVal){
            commit('updateMessages', messagesVal)
            setTimeout(() => commit('updateMessages', []), 3000);
        },
    }
})
export default store;