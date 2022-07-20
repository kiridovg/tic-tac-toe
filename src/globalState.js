import { reactive } from 'vue'

export const state = reactive({
  loggedIn: false,
  balance: '',
  accountId: '',
  player: null,
  gameID: null,
});
