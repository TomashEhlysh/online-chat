// Default
import { createWebHistory, createRouter } from "vue-router";
import axios from "axios";
import store from "@/store";
//Pages
import Home from "../views/Home.vue";
const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
        meta: {
            title: "Головна",
        },
    },
    {
        path: "/Global-chat",
        name: "Global chat",
        meta: {
          mainPage: "Global chat",
        },
        component: () => import("../views/Global-chat.vue"),
    },
    {
        path: "/Group-Chat",
        name: "Group chat",
        meta: {
          mainPage: "Group chat",
        },
        component: () => import("../views/Group-chat.vue"),
    },
    {
        path: "/Group-Chat/:roomID/:roomName",
        name: "Room",
        meta: {
            auth: true,
            mainPage: "Room",
        },
        component: () => import("../views/Chat.vue"),
    },
]
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: function (to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        if (to.hash) {
            return { el: to.hash, behavior: "smooth" };
        } else {
            window.scrollTo(0, 0);
        }
    },
});
router.beforeEach((to, from, next) => {
    if (to.meta.auth) {
        if (localStorage.getItem("email")) {

        }else{
            store.dispatch('setMessages', [{severity: "error", content: "Прохання авторизуватись", id: 0,}])
            router.push({ path: "/" })
        }
    }
    next()
});
export default router;