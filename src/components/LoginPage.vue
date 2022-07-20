<template>
  <main class="container">
    <div class="base-button" v-if="!state.loggedIn" @click="handleClickLogIn">Log in</div>

    <div v-else class="user-info-block">
      <div><span>account id:</span> {{ state.accountId }}</div>
      <div><span>balance:</span> {{ state.balance }}</div>
      <div><span>human-format balance:</span> {{ BalanceHuman }}</div>

      <div class="logout-button" @click="handleClickLogOut">Logout</div>
    </div>
  </main>
</template>

<script>
import { state } from "../globalState.js";
import * as near from '../near'

export default {
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if(near.getWalletId()){
        vm.$router.push("/");
      }
    });
  },
  data() {
    return {
      state,
      BalanceHuman: ''
    }
  },
  created() {
    if (near.getWalletId()) {
      near.getWalletBalance().then(balance => {
            state.accountId = near.getWalletId(),
            state.balance = balance,
            state.loggedIn = true,
            this.BalanceHuman = near.formatBalanceToHuman(balance)
        }
      )
    }
  },
  methods: {
    handleClickLogIn() {
      near.connectWallet()
    },
    handleClickLogOut() {
      near.logout()
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

span {
  font-weight: bold;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.user-info-block {
  text-align: left;
}

.logout-button {
  width: fit-content;
  margin: auto;
  text-align: center;
  margin-top: 1rem;
}

.logout-button,
.base-button {
  padding: 1rem 2.5rem;
  background-color: #00b16a;
  filter: brightness(0.9);
  font-weight: bold;
  padding: 1rem 2.5rem;
  user-select: none;
  cursor: pointer;
}
</style>