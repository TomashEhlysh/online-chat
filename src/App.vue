<template>
  <div class="head-wrapper">
    <myHeader/>
    <router-view/>
    <mFooter/>
    <Message v-for="msg in this.messages" :sticky="true" :key="msg.id" :severity="msg.severity" class="main-message">
      {{ msg.content }}
    </Message>
  </div>
</template>

<script>
import myHeader from '@/components/Header.vue'
import mFooter from '@/components/Footer.vue'
import Message from 'primevue/message';
export default {
  components: { 
    myHeader, mFooter, Message
  },
  computed:{
    messages(){
      return this.$store.getters.messages
    },
  },
  mounted(){
    this.$store.dispatch('setMessages', [])
  }
}
</script>

<style scoped>
  .main-message{
    position: fixed;
    top: 25px;
    right: 25px;
    z-index: 9999;
    padding: 20px;
    border-radius: 16px;
  }
</style>