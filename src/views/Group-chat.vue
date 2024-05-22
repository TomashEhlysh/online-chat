<template>
  <div class="wrapper">
    <section class="group">
        <div class="container">
            <h2 class="group-title title">
                {{ $t("Group-chat.title") }}
            </h2>
            <p class="group-description">
                {{ $t("Group-chat.description") }}
            </p>
            <Button v-if="!this.openChatFrom" :label="$t('Group-chat.chatTable.addButton')" @click.prevent="this.openChatFrom = true"/>
            <form class="group-form" v-if="this.openChatFrom">
                <label for="name" class="group-label">
                    {{ $t("Group-chat.chatTable.addInput1") }}
                    <InputText class="group-input" type="text" id="name" v-model="this.chatName"/>
                </label>
                <label for="lang" class="group-label">
                    {{ $t("Group-chat.chatTable.addInput2") }}
                    <Dropdown class="group-input" v-model="this.chatLang" :options="this.langList" :placeholder="this.chatLang" optionLabel="name"/>
                </label>
                <Button class="group-form_btn" :label="$t('Group-chat.chatTable.addButton')" @click.prevent="addChat()"/>
            </form>
            <DataTable :value="this.groupList" paginator :rows="5" class="group-list">
                <Column style="width: 35%" class="group-list_item" field="name" sortable :header="$t('Group-chat.chatTable.header1')"></Column>
                <Column style="width: 10%" class="group-list_item" field="lang" sortable :header="$t('Group-chat.chatTable.header2')"></Column>
                <Column style="width: 35%" class="group-list_item" field="created_date" sortable :header="$t('Group-chat.chatTable.header3')"></Column>
                <Column style="width: 12%" class="group-list_item" field="group_id" sortable :header="$t('Group-chat.chatTable.header5')">
                    <template #body="id">
                        <span>
                            {{ this.onlineUsers.filter(item => item.roomId == id.data.group_id).length }}
                        </span>
                    </template>
                </Column>
                <Column style="width: 8%" class="group-list_item" header="Action" #body="link">
                    <Button>
                        <router-link :to="`/group-chat/${link.data.group_id}/${link.data.name}`">
                            {{ $t('Group-chat.chatTable.join') }}
                        </router-link>
                    </Button>
                </Column>
                <template #empty> {{ $t("Group-chat.chatTable.empty") }} </template>
            </DataTable>
        </div>
    </section>
  </div>
</template>

<script>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import axios from 'axios';
export default {
    components:{Button, DataTable, Column, InputText, Dropdown},
    data(){
        return{
            groupList: [],
            chatName: '',
            openChatFrom: false,
            chatLang: {"name": "UA"},
            langList: [{"name": "UA"},{"name": "EN"}],
            onlineUsers: []
        }
    },
    methods:{
        addChat(){
            let config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            }
            const chatInfo = JSON.stringify({
                email: localStorage.getItem('email'),
                groupName: this.chatName,
                lang: this.chatLang.name,
            });
            axios.post('http://localhost:3000/user/createGroupChat', chatInfo, config)
            .then(response => {
                this.getChats();
                this.openChatFrom = false
            })
        },
        getChats(){
            let config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            }
            axios.get('http://localhost:3000/user/getGroups', config)
            .then(response => {
                this.groupList = response.data
            })
        }
    },
    mounted(){
        this.getChats();
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }
        axios.get('http://localhost:3000/getOnline', config)
        .then(response => {
            this.onlineUsers = response.data
        })
    },
}
</script>

<style>

</style>