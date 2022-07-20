import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import * as near from './near'

import App from './App.vue';
import GameLobby from './components/GameLobby.vue';
import LoginPage from './components/LoginPage.vue';

near.initContract()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: GameLobby },
    { path: '/login', component: LoginPage },
  ]
})

import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/database'; //v9

const firebaseConfig = {
  apiKey: "AIzaSyCDAtxEZwCJpERZZ0xbxfFVBFolXUo0YZ4",
  authDomain: "tic-tac-toe-9aab9.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-9aab9-default-rtdb.firebaseio.com",
  projectId: "tic-tac-toe-9aab9",
  storageBucket: "tic-tac-toe-9aab9.appspot.com",
  messagingSenderId: "614411124656",
  appId: "1:614411124656:web:b344f454c825a62bde6075",
  measurementId: "G-JPT5TH0637"
};

firebase.initializeApp(firebaseConfig);

/*firebase stuff end*/

const app = createApp(App);
app.use(router);

app.component('game-lobby', GameLobby);
app.component('login-page', LoginPage);

app.mount('#app');
