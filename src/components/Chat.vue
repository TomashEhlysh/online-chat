<template>
    <div class="chat-content">
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
            <div class="chat-message" >
                <quill-editor class="chat-message_input" @keydown.enter.prevent="sendMessage()" :toolbar="false" v-model:content="this.message" contentType="text" @selection-change="getNumberByClick" @text-change="getNumberByWrite"></quill-editor>
                <i class="pi pi-face-smile chat-emoji" @click="this.visibleEmoji = !this.visibleEmoji"></i>
                <EmojiPicker v-if="this.visibleEmoji" class="chat-message_emoji" native="true" @select="onSelectEmoji" />
                <Button class="chat-message_btn" label="Надіслати" @click="sendMessage()"/>
            </div>
            <ul class="chat-body_list">
                <p class="chat-body_users" @click.prevent="this.showUsers = true" v-if="this.screenWidth < 1000">
                    Show users
                    <i class="pi pi-angle-right"></i>
                </p>
                <li class="chat-body_item" :style="`align-items: ${message.type == 'status' ? 'center' : message.login == this.currentUser ? 'flex-end' : 'flex-start'}`" v-for="message in this.messages.filter(id => id.chat_id == this.roomID).sort((a, b) => b.id - a.id)" :key="message.id">
                    <div class="chat-body_message">
                        <span v-if="message.type != 'status'">
                            {{ message.login == this.currentUser ? 'You' : message.login}} 
                        </span>
                        <div v-html="message.message" v-if="message.type == 'status' && message.login != this.currentUser"></div>
                        <div v-html="message.message" v-if="message.type != 'status'"></div>
                    </div>
                </li>
            </ul>
            <Toast class="chat-toast"/>
        </div>
    </div>
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { io } from 'socket.io-client';
import axios from 'axios';
export default {
    components: {QuillEditor, EmojiPicker, Button, Toast},
    props:['roomID'],
    data(){
        return{
            messages: [],
            visibleEmoji: false,
            message: '',
            users: [],
            screenWidth: '',
            showUsers: false,
            socket: null
        }
    },
    methods:{
        showInfo() {
            this.$toast.add({ severity: 'info', summary: 'Info Message', detail: 'Message Content', life: 3000 });
        },
        showError() {
            this.$toast.add({ severity: 'error', summary: 'Error Message', detail: this.$t("Global-chat.chatInfo.error"), life: 3000 });
        },
        getNumberByClick(delta){
            if(delta.range){
                this.getTextPosition = delta.range.index
            }
        },
        getNumberByWrite(delta){
            this.getTextPosition = delta.delta.ops[0].retain + 1
        },
        getMessageFromDB(){
            let config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    email: localStorage.getItem('email'),
                    chatType: 'group',
                    chatId: this.roomID
                }
            }
            axios.get('http://localhost:3000/user/getMessages', config)
            .then(response => {
                this.messages = response.data
            })
        },
        onSelectEmoji(emoji) {
            const before = this.message.slice(0, this.getTextPosition);
            const after = this.message.slice(this.getTextPosition);
            this.message = before + emoji.i + after;
        },
        sendMessage(){
            if(this.message.trim()){
                this.socket.emit('message', {"login": localStorage.getItem("login"), "chat_id": this.roomID, "message": this.message});
                this.message = " "
                this.visibleEmoji = false
            }else{
                this.message = " "
                this.showError()
            }
        },
        leaveFromChat(){
            this.socket.emit('leave', { user: localStorage.getItem('login'), roomID: this.roomID });
            this.socket.off('user_disconnected');
            this.socket.on('user_disconnected', (users) => {
                this.messages.push({
                    "id": this.messages.length ? this.messages[this.messages.length - 1].id + 0.1 : 0,
                    "chat_id": users.roomId,
                    "chat_type": "group",
                    "date_time": '',
                    "login": users.login,
                    "message": users.login + ' disconnected from group chat',
                    "type": "status"
                });
                this.users = users.usersList;
            });
        }
    },
    unmounted(){
        this.leaveFromChat();
    },
    mounted(){
        this.socket = io('http://localhost:3000/group-chat');
        this.leaveFromChat()
        this.getMessageFromDB();
        this.currentUser = localStorage.getItem("login");
        this.socket.emit('joinRoom', {"user": localStorage.getItem("login"), "roomID": this.roomID});
        this.socket.on('connected', (users) => {
            this.users = users.userList;
            this.messages.push({
                "id": this.messages.length ? this.messages[this.messages.length - 1].id + 0.1 : 0,
                "chat_id": users.roomID,
                "chat_type": "group",
                "date_time": '',
                "login": users.login,
                "message": users.login + ' connected to group chat',
                "type": "status"
            });
        });
        this.socket.on('message', (msg) => {
            this.messages.push(msg);
        });
        this.screenWidth = screen.width
    }
}
</script>

<style>

</style>