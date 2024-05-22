<template>
  <div class="wrapper">
    <section class="chat">
        <div class="container">
            <h2 class="chat-title title">
                {{ $t("Chat.title") + this.$route.params.roomName }} 
            </h2>
            <p class="chat-description">
                {{ $t("Chat.description") }}
            </p>
            <chat :roomID="this.$route.params.roomID" />
        </div>
    </section>
  </div>
</template>

<script>
import chat from '@/components/Chat.vue'
export default {
    components: {chat},
    unmounted(){
        
    },
    mounted(){
        
    }
}
</script>

<style>

</style>