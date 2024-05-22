<template>
    <header class="header">
        <div class="container">
            <nav class="nav">
                <router-link to="/" class="nav-logo">
                    Logo
                </router-link>
                <ul class="nav-list">
                    <li class="nav-item">
                        <router-link to="/" class="nav-link">
                            {{ $t("menu.text1") }}
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/Global-chat" class="nav-link">
                            {{ $t("menu.text2") }}
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/group-chat" class="nav-link">
                            {{ $t("menu.text3") }}
                        </router-link>
                    </li>
                </ul>
                <ul class="nav-lang_list">
                    <li  class="lang-list_item" @click.prevent="this.visibleLangMenu = !this.visibleLangMenu">
                        {{ this.selectedLang }}
                    </li>
                    <li class="lang-list_item lang-list_change" @click="changeLang(lang)" v-for="lang in this.langList.filter(item => item != this.selectedLang && this.visibleLangMenu)" :key="lang">
                        {{ lang }}
                    </li>
                </ul>
                <Button class="nav-login" icon="pi pi-user" @click.prevent="openLoginForm()"/>
            </nav>
        </div>
        <Dialog v-model:visible="this.openLogin" modal :header="this.modalTitle" class="login">
            <label for="email" class="login-label">
                {{ $t("login.email") }} *
                <InputText type="email" id="email" class="login-input" v-model="this.email"/>
            </label>
            <label for="login" class="login-label" v-if="this.modalTitle == 'Register'">
                {{ $t("login.login") }} *
                <InputText type="text" id="login" class="login-input" v-model="this.login"/>
            </label>
            <label  for="password" class="login-label">
                {{ $t("login.password") }} *
                <Password v-model="this.password" id="password" class="login-input" toggleMask :feedback="false" />
            </label>
            <label v-if="this.modalTitle == 'Register'" for="conf_password" class="login-label">
                {{ $t("login.conf_password") }} *
                <Password v-model="this.confPassword" id="conf_password" class="login-input" toggleMask :feedback="false" />
                <span v-if="this.password != this.confPassword" style="color:red;font-size:14px;margin-top:8px;">
                    Паролі повинні співпадати
                </span>
            </label>
            <div class="login-buttons">
                <Button :label="$t('login.register')" @click.prevent="this.modalTitle = 'Register'" v-if="this.modalTitle == 'Login'" class="login-button login-register"/>
                <Button :label="$t('login.singIn')" @click.prevent="signIn()" v-if="this.modalTitle == 'Login'" class="login-button"/>
                <Button :label="$t('login.back')" v-if="this.modalTitle == 'Register'" @click.prevent="this.modalTitle = 'Login'" class="login-button"/>
                <Button :label="$t('login.register')" v-if="this.modalTitle == 'Register'" @click.prevent="register" class="login-button login-register"/>
            </div>
            <div class="login-separator">{{ $t('login.separator') }}</div>
            <GoogleLogin
                data-width="235"
                class="login-google"
                :callback="callback"
            />
        </Dialog>
        <Dialog v-model:visible="this.success" modal :header=" $t('login.thanks_title')" class="login login-thanks">
            <p class="thanks-text">{{ $t('login.thanks_text') }}</p>
        </Dialog>
    </header>
</template>

<script>
    import Button from 'primevue/button';
    import Dialog from 'primevue/dialog';
    import InputText from 'primevue/inputtext';
    import FloatLabel from 'primevue/floatlabel';
    import Password from 'primevue/password';
    import { decodeCredential } from "vue3-google-login";
    import axios from 'axios'
    export default {
        components: {
            Button, Dialog, InputText, FloatLabel, Password
        },
        data(){
            return{
                langList: ['UA', 'EN'],
                selectedLang: 'UA',
                visibleLangMenu: false,
                openLogin: false,
                modalTitle: 'Login',
                email: '',
                login: '',
                password: '',
                confPassword: '',
                success: false,
                callback: async (response) => {
                    const userData = decodeCredential(response.credential);
                    if (userData.email_verified) {
                    let config = {
                        headers: {
                        "Content-Type": "application/json",
                        },
                    };
                    const userInfo = JSON.stringify({
                        check: "gmail_validate",
                        email: userData.email,
                        name: userData.given_name + " " + userData.family_name,
                    });
                    await axios .post("http://localhost:3000/auth/gSignIn", userInfo, config)
                        .then((response) => {
                            localStorage.setItem("token", response.data.token);
                            localStorage.setItem("email", response.data.email);
                            localStorage.setItem("userRole", response.data.role);
                            localStorage.setItem("login", response.data.login);
                            this.openLogin = false;
                            this.$store.dispatch("setMessages", [
                                {
                                severity: "success",
                                content: "Авторизовано!",
                                id: this.count++,
                                },
                            ]);
                        })
                        .catch((error) => console.log(error));
                    }
                },
            }
        },
        methods: {
            changeLang(val){
                this.selectedLang = val
                this.$i18n.locale = val
                this.visibleLangMenu = false
            },
            openLoginForm(){
                if(localStorage.getItem("email")){
                    this.$store.dispatch("setMessages", [
                        {
                            severity: "info",
                            content: "Ви вже увійшли",
                            id: this.count++,
                        },
                    ]);
                }else{
                    this.openLogin = true
                }
            },
            async register(){
                if (this.password == this.confPassword){
                    let config = {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    };
                    const userInfo = JSON.stringify({
                        email: this.email,
                        password: this.password,
                        login: this.login
                    });
                    await axios.post("http://localhost:3000/auth/user", userInfo, config)
                    .then((response) => {
                        localStorage.setItem("token", response.data.token);
                        localStorage.setItem("email", response.data.email);
                        localStorage.setItem("userRole", response.data.role);
                        localStorage.setItem("login", response.data.login);
                        this.openLogin = false;
                        this.$store.dispatch("setMessages", [
                            {
                                severity: "success",
                                content: this.$t("login.msg1"),
                                id: this.count++,
                            },
                        ]);
                        this.openLogin = false
                    })
                    .catch((error) => console.log(error));
                }
            },
            signIn(){
                if (this.password && this.email){
                    let config = {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    };
                    const userInfo = JSON.stringify({
                        email: this.email,
                        password: this.password
                    });
                    axios.post("http://localhost:3000/auth/signIn", userInfo, config)
                    .then((response) => {
                        console.log(response)
                        localStorage.setItem("token", response.data.token);
                        localStorage.setItem("email", response.data.email);
                        localStorage.setItem("userRole", response.data.role);
                        localStorage.setItem("login", response.data.login);
                        this.openLogin = false;
                        this.$store.dispatch("setMessages", [
                            {
                                severity: "success",
                                content: "Авторизовано!",
                                id: this.count++,
                            },
                        ]);
                        this.openLogin = false
                    })
                    .catch((error) => {
                        console.log(error)
                        this.$store.dispatch("setMessages", [
                            {
                                severity: "error",
                                content: error.response.data.message,
                                id: this.count++,
                            },
                        ]);
                    });   
                }
            }
        }
    }
</script>
  
<style scoped>
    a, a:hover{
        text-decoration: none;
    }
</style>