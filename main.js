const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatched: "CardsMatched",
  CardsMatchedFailed: "CardsMatchedFailed",
  GameFinished: "GameFinished",
};

const view = {
  getCardBack(index) {
    return `
    <div class="card back" data-index="${index}"></div>`;
  },

  getCardContent(index) {
    const symbol = Symbols[Math.floor(index / 13)];
    const number = this.transformNumber((index % 13) + 1);
    return `
    <div class="card" data-index="${index}">
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    </div>
    `;
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  displayCards(numberArray) {
    const cards = document.querySelector("#cards");
    cards.innerHTML = numberArray.map((i) => this.getCardBack(i)).join("");
  },

  flipCards(...cards) {
    // 翻正面
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 翻背面
      card.classList.add("back");
      card.innerHTML = null;
    });
  },

  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  displayScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  displayTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried ${times} times`;
  },

  matchFailedAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("failed");
      card.addEventListener("animationend", (event) => {
        event.target.classList.remove("failed"), { once: true };
      });
    });
  },

  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("finished");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
    view.displayScore(model.score);
    view.displayTriedTimes(model.triedTimes);
  },
  // 點擊卡片後  進入哪個狀態
  runDown(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        this.currentState = GAME_STATE.SecondCardAwaits;
        model.revealedCards.push(card);
        view.flipCards(card);
        break;
      case GAME_STATE.SecondCardAwaits:
        model.revealedCards.push(card);
        view.flipCards(card);
        view.displayTriedTimes(++model.triedTimes);
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          this.currentState = GAME_STATE.FirstCardAwaits;
          view.displayScore((model.score += 10));
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchedFailed;
          view.matchFailedAnimation(...model.revealedCards);
          setTimeout(this.restCards, 1000);
        }
        break;
    }
    console.log(model.revealedCards.map((card) => card.dataset.index));
    console.log(this.currentState);
  },
  restCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
};

const utility = {
  getRandomNumberArray(total) {
    const number = Array.from(Array(total).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.runDown(card);
  });
});
