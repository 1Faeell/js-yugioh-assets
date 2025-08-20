// ================== STATE ==================
const state = {
  score: {
    playerScore: 0,
    computerScore: 0,
    scoreBox: document.getElementById("score-points"),
  },
  cardSprites: {
    avatar: document.getElementById("card-image"),
    name: document.getElementById("card-name"),
    type: document.getElementById("card-type"),
  },
  fieldCards: {
    player: document.getElementById("player-field-card"),
    computer: document.getElementById("computer-field-card"),
  },
  playerSides: {
    player1: "player-cards",
    player1BOX: document.querySelector("#player-cards"),
    computer: "computer-cards",
    computerBOX: document.querySelector("#computer-cards"),
  },
  actions: {
    button: document.getElementById("next-duel"),
  },
};

// ================== CONFIG ==================
const pathImages = "./src/assets/icons/";

const cardData = [
  {
    id: 0,
    name: "PAPEL",
    type: "Paper",
    img: `${pathImages}papel-paper-Photoroom.png`,
    WinOf: [1],
    LoseOf: [2],
  },
  {
    id: 1,
    name: "PEDRA",
    type: "Rock",
    img: `${pathImages}pedra-rock-Photoroom.png`,
    WinOf: [2],
    LoseOf: [0],
  },
  {
    id: 2,
    name: "TESOURA",
    type: "Scissors",
    img: `${pathImages}tesoura-scissors-Photoroom.png`,
    WinOf: [0],
    LoseOf: [1],
  },
];

// ================== HELPERS ==================
async function getRandomCardId() {
  return Math.floor(Math.random() * cardData.length);
}

async function playAudio(status) {
  const audio = new Audio(`./src/assets/audios/${status}.wav`);
  await audio.play();
}

// ================== RENDERING ==================
async function createCardImage(IdCard, fieldSide) {
  const cardImage = document.createElement("img");
  cardImage.setAttribute("height", "110px");
  cardImage.setAttribute(
    "src",
    "./src/assets/icons/jokenpo-back-Photoroom.png"
  );
  cardImage.setAttribute("data-id", IdCard);
  cardImage.classList.add("card");

  if (fieldSide === state.playerSides.player1) {
    let touchedOnce = false;

    cardImage.addEventListener("click", () => {
      if (!touchedOnce) {
        // Primeiro toque → apenas visualizar
        drawSelectCard(IdCard);
        touchedOnce = true;

        // reseta caso o jogador não clique de novo
        setTimeout(() => (touchedOnce = false), 1500);
      } else {
        // Segundo toque → selecionar carta
        setCardsField(cardImage.getAttribute("data-id"));
        touchedOnce = false;
      }
    });
  }

  return cardImage;
}

async function drawSelectCard(index) {
  const avatar = state.cardSprites.avatar;

  // Troca conteúdo
  avatar.src = cardData[index].img;
  state.cardSprites.name.innerText = cardData[index].name;
  state.cardSprites.type.innerText = "Attribute: " + cardData[index].type;

  // 🔄 Resetando animação
  avatar.classList.remove("animate-appear");
  void avatar.offsetWidth; // força reflow
  avatar.classList.add("animate-appear");
}

async function drawCardsInField(cardId, computerCardId) {
  const playerCard = state.fieldCards.player;
  const computerCard = state.fieldCards.computer;

  // Atualiza imagens
  playerCard.src = cardData[cardId].img;
  computerCard.src = cardData[computerCardId].img;

  // Remove e adiciona classe para resetar animação
  playerCard.classList.remove("animate-scale");
  void playerCard.offsetWidth; // força reflow
  playerCard.classList.add("animate-scale");

  computerCard.classList.remove("animate-scale");
  void computerCard.offsetWidth; // força reflow
  computerCard.classList.add("animate-scale");
}

async function drawButton(text) {
  state.actions.button.innerText = text.toUpperCase();
  state.actions.button.style.display = "block";
}

async function updateScore() {
  state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

async function ShowHiddenCardFieldsImages(isVisible) {
  state.fieldCards.player.style.display = isVisible ? "block" : "none";
  state.fieldCards.computer.style.display = isVisible ? "block" : "none";
}

async function hiddenCardDetails() {
  state.cardSprites.avatar.src = "";
  state.cardSprites.name.innerText = "";
  state.cardSprites.type.innerText = "";
}

// ================== GAME LOGIC ==================
async function setCardsField(cardId) {
  await removeAllCardsImages();

  let computerCardId = await getRandomCardId();

  await ShowHiddenCardFieldsImages(true);
  await hiddenCardDetails();
  await drawCardsInField(cardId, computerCardId);

  let duelResults = await checkDuelResults(cardId, computerCardId);

  await updateScore();
  await drawButton(duelResults);
}

async function checkDuelResults(playerCardId, ComputerCardId) {
  let duelResults = "draw";
  let playerCard = cardData[playerCardId];

  if (playerCard.WinOf.includes(ComputerCardId)) {
    duelResults = "win";
    await playAudio(duelResults);
    state.score.playerScore++;
  } else if (playerCard.LoseOf.includes(ComputerCardId)) {
    duelResults = "lose";
    await playAudio(duelResults);
    state.score.computerScore++;
  }

  return duelResults;
}

async function removeAllCardsImages() {
  let { player1BOX, computerBOX } = state.playerSides;
  player1BOX.querySelectorAll("img").forEach((img) => img.remove());
  computerBOX.querySelectorAll("img").forEach((img) => img.remove());
}

async function drawCards(cardNumbers, fieldSide) {
  for (let i = 0; i < cardNumbers; i++) {
    const randomIdCard = await getRandomCardId();
    const cardImage = await createCardImage(randomIdCard, fieldSide);
    document.getElementById(fieldSide).appendChild(cardImage);
  }
}

async function resetDuel() {
  state.cardSprites.avatar.src = "";
  state.actions.button.style.display = "none";
  state.fieldCards.player.style.display = "none";
  state.fieldCards.computer.style.display = "none";
  init();
}

// ================== INIT ==================
function init() {
  state.fieldCards.player.style.display = "none";
  state.fieldCards.computer.style.display = "none";

  drawCards(5, state.playerSides.player1);
  drawCards(5, state.playerSides.computer);

  // const bgm = document.getElementById("bgm");
  // bgm.play();
}

init();
