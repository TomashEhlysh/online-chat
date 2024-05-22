<template>
  <div class="wrapper">
    <section class="info">
        <div class="container">
            <h2 class="info-title title">
                {{ $t("Global-chat.title") }}
            </h2>
            <p class="info-description">
                {{ $t("Global-chat.description") }}
            </p>
        </div>
    </section>
    <section class="chat" >
        <div class="container">
            <h4 class="chat-header">
                {{ $t("Global-chat.title") }}
            </h4>
            <Button label="Підключитись" v-if="!this.showChat" @click.prevent="joinToChat()" />
            <div class="chat-content" v-if="this.showChat">
                <div class="chat-users" v-show="this.showUsers || this.screenWidth >= 1000">
                    <p class="chat-users_title chat-title">
                        {{ $t("Global-chat.chatInfo.usersTitle") }}
                        <i class="pi pi-times chat-users_close" v-if="this.screenWidth < 1000" @click.prevent="this.showUsers = false"></i>
                    </p>
                    <ul class="chat-users_list">
                        <li class="chat-users_item chat-items" v-for="user in this.users" :key="user">
                            {{ user.login }}
                        </li>
                    </ul>
                </div>
                <div class="chat-body" id="chat-body" ref="chatBody">
                    <div class="chat-message">
                        <quill-editor class="chat-message_input" @keydown.enter.prevent="sendMessage()" :toolbar="false" v-model:content="this.message" contentType="text" @selection-change="getNumberByClick" @text-change="getNumberByWrite"></quill-editor>
                        <i class="pi pi-face-smile chat-emoji" @click="this.visibleEmoji = !this.visibleEmoji"></i>
                        <EmojiPicker v-if="this.visibleEmoji" class="chat-message_emoji" native="true" @select="onSelectEmoji" />
                        <Button class="chat-message_btn" label="Надіслати" @click.prevent="sendMessage()"/>
                    </div>
                    <ul class="chat-body_list">
                        <p class="chat-body_users" @click.prevent="this.showUsers = true" v-if="this.screenWidth < 1000">
                            Show users
                            <i class="pi pi-angle-right"></i>
                        </p>
                        <li class="chat-body_item" :style="`align-items: ${message.type == 'status' ? 'center' : message.login == this.currentUser ? 'flex-end' : 'flex-start'}`" v-for="message in this.messages.sort((a, b) => b.id - a.id)" :key="message.id">
                            <div class="chat-body_message">
                                <span v-if="message.type != 'status'">
                                    {{ message.login == this.currentUser ? 'You' : message.login}} 
                                </span>
                                <div v-html="message.message" v-if="message.type == 'status' && message.login != this.currentUser"></div>
                                <div v-html="message.message" v-if="message.type != 'status'"></div>
                            </div>
                        </li>
                    </ul>
                    
                </div>
            </div>
        </div>
        <Toast class="chat-toast"/>
    </section>
  </div>
</template>

<script>
import Vue3autocounter from 'vue3-autocounter';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { io } from 'socket.io-client';
import axios from 'axios';
export default {
    components: {Vue3autocounter, QuillEditor, EmojiPicker, Button, Toast},
    data(){
        return{
            gOnlineUsers: '',
            existUsers: 999,
            message: '',
            getTextPosition: 0,
            showChat: false,
            visibleEmoji: false,
            currentUser: "",
            socket: null,
            users: [],
            messages: [],
            privatChats: [],
            textareaContent: '',
            htmlPreview: null,
            screenWidth: '',
            showUsers: false
        }
    },
    methods:{
        showSuccess() {
            this.$toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
        },
        showInfo() {
            this.$toast.add({ severity: 'info', summary: 'Info Message', detail: 'Message Content', life: 3000 });
        },
        showError(msg) {
            this.$toast.add({ severity: 'error', summary: 'Error Message', detail: msg, life: 3000 });
        },
        getNumberByClick(delta){
            if(delta.range){
                this.getTextPosition = delta.range.index
            }
        },
        getNumberByWrite(delta){
            this.getTextPosition = delta.delta.ops[0].retain + 1
        },
        onSelectEmoji(emoji) {
            const before = this.message.slice(0, this.getTextPosition);
            const after = this.message.slice(this.getTextPosition);
            this.message = before + emoji.i + after;
        },
        sendMessage(){
            if(this.message.trim()){
                this.socket.emit('message', {"login": localStorage.getItem("login"), "message": this.message});
                this.message = " "
                this.visibleEmoji = false
            }else{
                this.message = " "
                this.showError(this.$t("Global-chat.chatInfo.error"))
            }
        },
        getMessageFromDB(){
            let config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    email: localStorage.getItem('email'),
                    chatType: 'global',
                    chatId: ''
                }
            }
            axios.get('http://localhost:3000/user/getMessages', config)
            .then(response => {
                this.messages = response.data
            })
        },
        joinToChat(){
            if(localStorage.getItem("email")){
                this.getMessageFromDB()
                this.showChat = true
                this.currentUser = localStorage.getItem("login");
                this.socket = io('http://localhost:3000/global-chat');
                this.socket.emit('user_connected', localStorage.getItem("login"));
                this.socket.on('user_connected', (users) => {
                    this.users = users.usersList
                    this.messages.push({"id": this.messages.length ? this.messages[0].id + 0.1 : 0, "chat_id": '', "chat_type": "global", "date_time": '', "login": users.login, "message": users.login + ' connected to global chat', "type": "status"})
                });
                this.socket.on('user_disconnected', (users) => {
                    this.messages.push({"id": this.messages.length ? this.messages[0].id + 0.1 : 0, "chat_id": '', "chat_type": "global", "date_time": '', "login": users.login, "message": users.login + ' disconnected from global chat', "type": "status"})
                    this.users = users.usersList
                });
                this.socket.on('message', (msg) => {
                    this.messages.push(msg)
                });
            }else{
                this.showError(this.$t("login.need_sign_in"))
            }
        }
    },
    unmounted(){
        if(this.showChat){
            this.socket.emit('leave', localStorage.getItem("login"));
            this.socket.on('user_disconnected', (users) => {
                this.messages.push({"id": this.messages.length ? this.messages[0].id + 0.1 : 0, "chat_id": '', "chat_type": "global", "date_time": '', "login": users.login, "message": users.login + ' connected to global chat', "type": "status"})
            });
        }
    },
    mounted(){
        this.screenWidth = screen.width
    }
}
</script>

<style>

</style>