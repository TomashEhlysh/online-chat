<template>
    <div class="wrapper">
      <section class="globalChat">
          <div class="container">
              <h4 class="chat-header">
                Груповий чат
              </h4>
              <ul class="chat-groups">
                  <p class="globalChat-title">
                      Оберіть чат щоб підключитись:
                  </p>
                  <li class="chat-groups_item" @click.prevent="joinToChat(group)" v-for="group in this.chatList" :key="group" v-if="!this.$route.params.roomID">
                      <router-link :to="`/Group-Chat/${group}`" class="chat-groups_link">
                          {{ group }} ({{ this.users.filter(user => user.roomId == group).length }})
                      </router-link>
                  </li>
                  <Button v-if="this.$route.params.roomID">
                      <router-link to="/Group-Chat">Leave from room</router-link>
                  </Button>
              </ul>
              <div class="chat-content" v-if="this.$route.params.roomID">
                  <div class="chat-users">
                      <p class="chat-users_title chat-title">
                          {{ $t("Global-chat.chatInfo.usersTitle") }}
                      </p>
                      <ul class="chat-users_list">
                          <li class="chat-users_item chat-items" v-for="user in this.users.filter(user => user.roomId == this.$route.params.roomID)" :key="user">
                              {{ user }}
                          </li>
                      </ul>
                  </div>
                  <div class="chat-body" id="chat-body" ref="chatBody">
                      <ul class="chat-body_list">
                          <li class="chat-body_item" :style="`align-items: ${message.type == 'status' ? 'center' : message.login == this.currentUser ? 'flex-end' : 'flex-start'}`" v-for="message in this.messages.filter(id => id.chat_id == this.$route.params.roomID)" :key="message.id">
                              <span v-if="message.type != 'status'">
                                  {{ message.login == this.currentUser ? 'You' : message.login}} 
                              </span>
                              <div v-html="message.message"></div>
                          </li>
                      </ul>
                      <div class="chat-message">
                          <quill-editor class="chat-message_input" @keydown.enter.prevent="sendMessage()" :toolbar="false" v-model:content="this.message" contentType="text" @selection-change="getNumberByClick" @text-change="getNumberByWrite"></quill-editor>
                          <i class="pi pi-face-smile chat-emoji" @click="this.visibleEmoji = !this.visibleEmoji"></i>
                          <EmojiPicker v-if="this.visibleEmoji" class="chat-message_emoji" native="true" @select="onSelectEmoji" />
                          <Button class="chat-message_btn" label="Надіслати" @click="sendMessage()"/>
                      </div>
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
              message: '',
              getTextPosition: 0,
              visibleEmoji: false,
              currentUser: '',
              socket: null,
              users: [],
              messages: [],
              privatChats: [],
              textareaContent: '',
              htmlPreview: null,
              chatList: [
                  'group1',
                  'group2'
              ],
              activeUsers: []
          }
      },
      methods:{
          showSuccess() {
              this.$toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
          },
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
          onSelectEmoji(emoji) {
              const before = this.message.slice(0, this.getTextPosition);
              const after = this.message.slice(this.getTextPosition);
              this.message = before + emoji.i + after;
          },
          sendMessage(){
              if(this.message.trim()){
                  this.socket.emit('message', {"login": localStorage.getItem("login"), "chat_id": this.$route.params.roomID, "message": this.message});
                  this.message = " "
                  const chatBody = this.$refs.chatBody;
                  chatBody.scrollTop = chatBody.scrollHeight;
                  this.visibleEmoji = false
                  this.socket.on('message', (msg) => {
                      this.messages.push(msg);
                  });
              }else{
                  this.message = " "
                  this.showError()
              }
          },
          joinToChat(group){
              this.getMessageFromDB(group);
              this.currentUser = localStorage.getItem("login");
              this.socket.emit('joinRoom', {"user": localStorage.getItem("login"), "roomID": group});
              this.socket.off('connected');
              this.socket.off('message');
              this.socket.on('connected', (users) => {
                  this.users = users.userList;
                  this.messages.push({
                      "id": this.messages.length + 1,
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
          },
          getMessageFromDB(chatId){
              let config = {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  params: {
                      email: localStorage.getItem('email'),
                      chatType: 'group',
                      chatId: chatId
                  }
              }
              axios.get('http://localhost:3000/user/getMessages', config)
              .then(response => {
                  this.messages = response.data
              })
          },
      },
      watch: {
          $route(to, from) {
              if(from.params.roomID){
                  this.socket.emit('leave', { user: localStorage.getItem('login'), roomID: from.params.roomID });
                  this.socket.off('user_disconnected');
                  this.socket.on('user_disconnected', (users) => {
                      this.messages.push({
                          "id": this.messages.length + 1,
                          "chat_id": from.params.roomID,
                          "chat_type": "group",
                          "date_time": '',
                          "login": users.login,
                          "message": users.login + ' disconnected from group chat',
                          "type": "status"
                      });
                      this.users = users.usersList;
                  });
              }
              
          }
      },
      mounted(){
          this.socket = io('http://localhost:3000/group-chat');
          if(this.$route.params.roomID){
              this.getMessageFromDB(this.$route.params.roomID)
              this.socket.on('message', (msg) => {
                  this.messages.push(msg);
              });
              this.currentUser = localStorage.getItem('login')
          }
      }
  }
  </script>
  
  <style>
  
  </style>