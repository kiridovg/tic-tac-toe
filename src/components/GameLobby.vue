<template>
  <div v-if="game" class="wrap">

    <div id="board">
      <h2>GAME BOARD</h2>

      <p v-if="error" class="error-message">{{ error }}</p>
      <div id="main">
        <div id='board'>
          <div class="flex">
            <div class='square'
                 v-for="(item, index) in game.boardState"
                 :id="'pos' + index"
                 :key="'pos' + index"
                 :class='{"square active": index.bg}'
                 @click="makePlayerMove(index)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="game">
      <h2>GAME</h2>

      <template v-if="game.gameState !== 'In Progress'">
        <h3>{{ game.gameState }}</h3>
        <h3>{{ statusIncomeAndExpenses }}</h3>
      </template>

      <div v-if="!isBidMade && !statusNewGame">
        <p class="text-waiting">
          <label for="name mb-3">Please place a bid Near: </label>
          <input
              class="text-field__input"
              id="bid"
              v-model="bid"
              type="text"
              name="bid"
          >
        </p>

        <div
            @click="makeBet"
            class="logout-button"
        >
          Make a bet and play
        </div>
      </div>

      <div v-if="statusNewGame">
        <div>
          <div class="logout-button" @click="newGame">NewGame</div>
        </div>
      </div>

      <template v-else-if="game.gameState === 'In Progress' && isBidMade" >
        <p class="center-text">{{ currentTurnName }}'s turn</p>
      </template>
    </div>

    <div>
      <div class="logout-button" @click="handleClickLogOut">Logout</div>
    </div>

    <div id="stats">
      <h2>STATS</h2>
      <div id="score">
        <div class="top">
          <template v-if="game.player1"
            >{{ game.player1 }}'s Wins<br />(X)</template
          >
        </div>
        <div class="top right">
          <template v-if="game.player2"
            >{{ game.player2 }}'s Wins<br />(O)</template
          >
        </div>
        <div class="bottom">
          <span v-if="game">{{ game.wins.player1 }}</span>
        </div>
        <div class="bottom right">
          <span v-if="game">{{ game.wins.player2 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { state } from "../globalState.js";
import {getDatabase, ref, onValue, update, set} from "firebase/database";
import * as near from "@/near";

export default {
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if(!near.getWalletId()){
        vm.$router.push("/login");
      }
    });
  },
  props: ["playerName"],
  data() {
    return {
      statusNewGame: null,
      bid: null,
      bidVal: null,
      isBidMade: null,
      state,
      game: null,
      error: null,
      ticTacBot: false,
      enteredName: "",
      nearBidString: "",
      statusIncomeAndExpenses: "",
      winConditions: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ],
    };
  },
  computed: {
    currentTurnName: function () {
      return this.game[this.game.currentTurn];
    },
  },
  created() {
    near.getBid().then( (result) => { this.bidVal = near.formatNearAmount(result.toLocaleString()) })
    this.isBidMadeBool()
    this.setPlayerName()
    this.createNewGame()
    this.getGame()
    window.addEventListener("beforeunload", this.leaveGame)
    this.playTicTacBot()
  },
  methods: {
    handleClickLogOut() {
      near.logout()
    },
    async isBidMadeBool() {
      this.isBidMade = false
      await near.isBidMade()
          .then((result) => {
            this.isBidMade = result
          })
      await near.getBid().then( (result) => { this.bidVal = near.formatNearAmount(result.toLocaleString()) })
    },
    async makeBet() {
      this.newGame()
      await near.makeBid(this.bid)
      await this.isBidMadeBool()
    },
    async doubleBitRefund() {
      await near.doubleBitRefund()
    },
    async deleteBit() {
      await near.deleteBit()
    },
    createNewGame() {
      const db = getDatabase();
      state.gameID = this.generateID(25);
      set(ref(db, "games/" + state.gameID), {
        gameID: state.gameID,
        full: false,
        player1: state.playerName,
        currentTurn: "player1",
        boardState: ["", "", "", "", "", "", "", "", ""],
        gameState: "In Progress",
        wins: {
          player1: 0,
          player2: 0,
        },
        chatLog: [
          {
            Sender: "System",
            Message: "Welcome to the Game!",
          },
        ],
      })
          .then(() => {
            this.state.player = "player1";
            this.$router.push("/");
          })
          .catch((error) => {
            this.createError = error;
          });
    },
    generateID(length) {
      const characters =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let id = "";
      let i = 0;
      while (i < length) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
        i++;
      }
      return id;
    },
    newGame() {
      this.statusNewGame = false;
      const db = getDatabase();
      const updates = {};

      let newGameStartTurn =
        this.game.currentTurn === "player1" ? "player2" : "player1";

      //make player always first for my testing
      if (this.ticTacBot) {
        newGameStartTurn = "player1";
      }

      updates["games/" + state.gameID + "/currentTurn"] = newGameStartTurn;
      updates["games/" + state.gameID + "/boardState"] = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ];
      updates["games/" + state.gameID + "/gameState"] = "In Progress";

      update(ref(db), updates);
    },
    makePlayerMove(index) {
      if (this.game.gameState !== "In Progress") {
        this.error = "Game is over.";
        return false;
      }

      const playersHere = this.game.full;
      const myTurn = this.game.currentTurn === state.player;
      const emptySpace = this.game.boardState[index] === "";

      if (!this.isBidMade) {
        this.error = "Please place a bid.";
      } else if (!playersHere) {
        this.error = "Other player must join.";
      } else if (!myTurn) {
        this.error = "Please wait your turn.";
      } else if (!emptySpace) {
        this.error = "Please select an empty space.";
      } else {
        this.error = null;

        //first player gets X's second player gets 0's
        const XO = state.player === "player1" ? "X" : "O";
        this.game.boardState[index] = XO;

        //record move to db
        const db = getDatabase();
        const updates = {};
        updates["games/" + state.gameID + "/boardState"] = this.game.boardState;

        //check if move ends the game
        let gameState = this.checkGameState();

        if (gameState === "In Progress") {
          //if not set currentTurn to next player
          this.game.currentTurn =
            this.game.currentTurn === "player1" ? "player2" : "player1";

          updates["games/" + state.gameID + "/currentTurn"] =
            this.game.currentTurn;
        } else if (gameState === "It's a tie!") {
          //if so update game state
          updates["games/" + state.gameID + "/gameState"] = gameState;
        } else {
          //someone has won
          updates["games/" + state.gameID + "/gameState"] = gameState;
          updates["games/" + state.gameID + "/wins/" + this.game.currentTurn] =
            this.game.wins[this.game.currentTurn] + 1;
        }

        update(ref(db), updates).then(() => {
          if (this.ticTacBot) {
            this.makeBotMove();
          }
        });
      }
    },
    makeBotMove() {
      //can only move if the game hasn't ended
      if (this.game.gameState !== "In Progress") {
        return false;
      }

      let winningSpace = this.checkBotWinningOrBlockingMove("winning");
      let blockingSpace = this.checkBotWinningOrBlockingMove("blocking");
      let cornerSpace = this.checkBotCornerMove();
      let centerSpace = this.game.boardState[4] === "" ? true : false;

      if (winningSpace !== undefined) {
        this.game.boardState[winningSpace] = "O";
      } else if (blockingSpace !== undefined) {
        this.game.boardState[blockingSpace] = "O";
      } else if (cornerSpace) {
        this.game.boardState[cornerSpace] = "O";
      } else if (centerSpace) {
        this.game.boardState[4] = "O";
      } else {
        //makes move in random empty space
        let moveSpace;
        let emptySpaces = [];
        this.game.boardState.forEach((space, index) => {
          if (space === "") {
            emptySpaces.push(index);
          }
        });

        moveSpace = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
        this.game.boardState[moveSpace] = "O";
      }

      this.handleMove(true);
    },
    checkBotWinningOrBlockingMove(moveType) {
      let checkFor;
      if (moveType === "winning") {
        checkFor = "O";
      } else if (moveType === "blocking") {
        checkFor = "X";
      }

      //is there a winning or blocking move?
      let board = this.game.boardState;
      let moveSpace;
      this.winConditions.forEach((condition) => {
        let moveType = 0;
        let empty = 0;
        let emptySpace;

        condition.forEach((space) => {
          if (board[space] === "") {
            empty += 1;
            emptySpace = space;
          } else if (board[space] === checkFor) {
            moveType += 1;
          }
        });

        if (moveType === 2 && empty === 1) {
          moveSpace = emptySpace;
        }
      });
      return moveSpace;
    },
    checkBotCornerMove() {
      let board = this.game.boardState;
      let moveSpace;
      let corners = [0, 2, 6, 8];
      let emptyCorners = [];
      corners.forEach((space) => {
        if (board[space] === "") {
          emptyCorners.push(space);
        }
      });

      if (emptyCorners.length > 0) {
        moveSpace =
          emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
      }

      return moveSpace;
    },
    handleMove() {
      //check if move ends the game
      let gameState = this.checkGameState();

      //record move to db
      const db = getDatabase();
      const updates = {};

      if (gameState === "In Progress") {
        //if not set currentTurn to next player
        this.game.currentTurn =
          this.game.currentTurn === "player1" ? "player2" : "player1";

        updates["games/" + state.gameID + "/currentTurn"] =
          this.game.currentTurn;
      } else if (gameState === "It's a tie!") {
        //if so update game state
        updates["games/" + state.gameID + "/gameState"] = gameState;
      } else {
        //someone has won
        updates["games/" + state.gameID + "/gameState"] = gameState;
        updates["games/" + state.gameID + "/wins/" + this.game.currentTurn] =
          this.game.wins[this.game.currentTurn] + 1;
      }

      updates["games/" + state.gameID + "/boardState"] = this.game.boardState;
      updates["games/" + state.gameID + "/currentTurn"] = "player1";

      update(ref(db), updates);
    },
    checkGameState() {
      let gameState = "In Progress";
      let board = this.game.boardState;

      //check for win
      this.winConditions.forEach(async (condition) => {
        if (
          board[condition[0]] !== "" &&
          board[condition[0]] === board[condition[1]] &&
          board[condition[1]] === board[condition[2]]
        ) {
          this.isBidMade = false
          this.statusNewGame = true;

          if(this.currentTurnName === state.playerName){
            gameState = `${this.currentTurnName} win's the game!`

            this.statusIncomeAndExpenses = `You won ${ this.bidVal * 2  } Near`

            await this.doubleBitRefund()
            await this.isBidMadeBool()
          }

          if(this.currentTurnName === 'TicTac Bot'){
            gameState = `${this.currentTurnName} win's the game!`
            this.statusIncomeAndExpenses = `You lost ${ this.bidVal } Near`

            await this.deleteBit()
            await this.isBidMadeBool()
          }
        }
      });

      //check for tie
      if (!board.includes("") && gameState === "In Progress") {
        gameState = "It's a tie!";
        this.statusIncomeAndExpenses = '';
        this.statusNewGame = true;
      }

      return gameState;
    },
    getGame() {
      //get game data and watch it for updates
      const db = getDatabase();
      const game = ref(db, "games/" + state.gameID);
      onValue(game, (snapshot) => {
        const data = snapshot.val();
        this.game = data;
      });
    },
    leaveGame() {
      const db = getDatabase();
      const updates = {};

      //if only player in lobby, then delete game data
      if (
        (state.player === "player1" && !this.game.full) ||
        this.ticTacBot === true
      ) {
        updates["games/" + state.gameID] = null;
        update(ref(db), updates).then(this.$router.push("/lobby"));
      } else {
        //reset game state
        const remainingPlayer =
          state.player === "player1" ? "player2" : "player1";
        const remainingPlayerName = this.game[remainingPlayer];

        updates["games/" + state.gameID + "/full"] = false;
        updates["games/" + state.gameID + "/player1"] = remainingPlayerName;
        updates["games/" + state.gameID + "/player2"] = null;
        updates["games/" + state.gameID + "/currentTurn"] = "player1";
        updates["games/" + state.gameID + "/boardState"] = [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ];
        updates["games/" + state.gameID + "/gameState"] = "In Progress";
        updates["games/" + state.gameID + "/wins"] = {
          player1: 0,
          player2: 0,
        };
        update(ref(db), updates).then(this.$router.push("/lobby"));
      }
    },
    playTicTacBot() {
      const db = getDatabase();
      const updates = {};
      updates["games/" + state.gameID + "/player2"] = "TicTac Bot";
      updates["games/" + state.gameID + "/full"] = true;

      update(ref(db), updates)
          .then(() => {
            this.ticTacBot = true;
          })
          .catch((error) => {
            console.log("error");
            console.log(error);
          });
    },
    setPlayerName() {
      state.playerName = near.getWalletId();
    },
  },
};
</script>

<style scoped>
@import 'https://fonts.googleapis.com/css?family=Oswald';
* {
  user-select: none;
}
.center, #board-i {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

span {
  color: #00b16a;
}
.modal-mask {
  position: absolute;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(108, 122, 137, .5);
  transition: opacity 0.3s ease;
}
.modal-container {
  width: 80%;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all 0.3s ease;
}
.modal-body {
  font-family: 'Oswald', sans-serif;
  font-size: 8vw;
  margin: 0;
  width: 100%;
  text-align: center;
  background: #6c7a89;
}
.select_marker {
  cursor: pointer;
}
#welcome {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #6c7a89;
}
.titleBlock {
  color: white;
  font-family: 'Oswald', sans-serif;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 4px;
}
.titleBlock h1 {
  font-size: 100px;
  width: 100%;
}
.titleBlock .mode {
  font-size: 50px;
  cursor: pointer;
}
#board {
  border-collapse: separate;
  border-spacing: 2px;
}
td {
  vertical-align: middle;
}
.square {
  width: 12vw;
  height: 12vw;
  background: #6c7a89;
  cursor: pointer;
  font-family: 'Oswald', sans-serif;
  font-size: 12vw;
  line-height: 12vw;
  text-align: center;
  color: white;
  margin: 1px;
}
.square:hover {
  opacity: 0.8;
}
.square.active {
  background: #00b16a;
}

#leave-game img,
#game-code img {
  height: 24px;
  width: 24px;
}

#leave-game span,
#game-code span {
  color: white;
}

#leave-game span {
  font-size: 12px;
  margin-left: 5px;
}

#game-code span {
  font-size: 12px;
  margin-right: 5px;
}

@media (min-width: 576px) {
  #leave-game span {
    font-size: 24px;
    margin-left: 10px;
  }

  #game-code span {
    font-size: 16px;
    margin-right: 10px;
  }
}

#game-code.copied {
  transform: translateY(-0.5em);
}

#board {
  grid-area: board;
}

#game {
  grid-area: game;
  text-align: center;
}

#stats {
  grid-area: stats;
}

.flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

#board,
#game,
#stats {
  margin: 0 auto;
  width: 100%;
  border-radius: 6px;
  padding-bottom: 15px;
}

.wrap {
  width: 1000px;
  max-width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto;
  grid-template-areas:
    "game"
    "stats"
    "board"
    "chat";
  grid-gap: 20px;
}

@media (min-width: 768px) {
  .wrap {
    grid-template-columns: 2fr 1fr;
    grid-template-areas:
      "board game"
      "board stats"
      "chat chat";
  }
}

@media (min-width: 992px) {
  .wrap {
    grid-template-columns: 2fr 1fr;
    grid-template-areas:
      "board game"
      "board stats"
      "chat .";
  }
}

h2 {
  text-align: center;
}

#score {
  margin: 0 auto;
  width: 90%;
  text-align: center;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

#score div {
  display: flex;
  justify-content: center;
  align-items: center;
}

#score .bottom {
  font-family: "Risque", cursive;
  color: white;
}

#score span {
  background: #46cbb3;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  line-height: 60px;
  font-size: 48px;
}

#game-board div {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
}

.text-waiting {
  margin-bottom: 10px;
}
.text-field__input{
  margin-top: 10px;
  font-size: 22px;
}

.text-field__input::placeholder {
  color: #212529;
  opacity: 0.4;
}

.text-field__input:focus {
  color: #212529;
  background-color: #fff;
  border-color: #bdbdbd;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(158, 158, 158, 0.25);
}
</style>