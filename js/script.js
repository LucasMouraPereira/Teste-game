const player = document.querySelector(".player");
const pipe = document.querySelector(".pipe");
const modal = document.getElementById("gameModal");
const playButton = document.getElementById("playButton");

const showModal = () => {
  modal.style.display = "block";
};

const hideModal = () => {
  modal.style.display = "none";
};

const jump = () => {
  player.classList.add("jump");

  setTimeout(() => {
    player.classList.remove("jump");
  }, 500);
};

const postMessageToPlaydeck = (method, value) => {
  const payload = {
    playdeck: {
      method,
      value,
    },
  };
  window.parent.postMessage(payload, '*');
};

const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    const payload = {
      playdeck: {
        method: 'getUserProfile',
      },
    };

    window.parent.postMessage(payload, '*');

    const handleMessage = ({ data }) => {
      if (data && data.playdeck && data.playdeck.method === 'userProfile') {
        window.removeEventListener('message', handleMessage);
        resolve(data.playdeck.value);
      }
    };

    window.addEventListener('message', handleMessage);
  });
};

const setData = (key, value) => {
  const payload = {
    playdeck: {
      method: 'setData',
      value: { key, data: value },
    },
  };
  window.parent.postMessage(payload, '*');
};

const getData = (key) => {
  return new Promise((resolve, reject) => {
    const payload = {
      playdeck: {
        method: 'getData',
        value: key,
      },
    };
    window.parent.postMessage(payload, '*');

    const handleMessage = ({ data }) => {
      if (data && data.playdeck && data.playdeck.method === 'getData' && data.playdeck.key === key) {
        window.removeEventListener('message', handleMessage);
        resolve(data.playdeck.value);
      }
    };

    window.addEventListener('message', handleMessage);
  });
};

document.addEventListener("keydown", jump);

let gameLoop;

const startGame = () => {
  player.src = "./images/mario.gif";
  player.style.width = "150px";
  player.style.marginLeft = "0px";
  player.style.bottom = "0px";
  player.style.animation = "";

  pipe.style.left = "initial";
  pipe.style.animation = "pipe-animation 1.5s infinite linear";

  clearInterval(gameLoop);

  gameLoop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const playerPosition = +window
      .getComputedStyle(player)
      .bottom.replace("px", "");

    if (pipePosition <= 120 && pipePosition > 0 && playerPosition < 80) {
      pipe.style.animation = "none";
      pipe.style.left = `${pipePosition}px`;

      player.style.animation = "none";
      player.style.bottom = `${playerPosition}px`;

      player.src = "./images/game-over.png";
      player.style.width = "75px";
      player.style.marginLeft = "50px";

      clearInterval(gameLoop);
      showModal();
    }
  }, 10);
};

playButton.addEventListener("click", () => {
  hideModal();
  postMessageToPlaydeck('play', 100);
  startGame();
});

document.addEventListener("DOMContentLoaded", () => {
  postMessageToPlaydeck('loading', 1);

  getUserProfile().then(profile => {
    console.log(profile);
  });

  postMessageToPlaydeck('loading', 100);
  showModal();
});

window.addEventListener("message", ({ data }) => {
  if (!data || !data["playdeck"]) return;

  const pdData = data["playdeck"];

  if (pdData.method === "play") {
    hideModal();
    startGame();
  }

  if (pdData.method === "isOpen") {
    window.playdeckIsOpen = data.value;
  }
});

const { parent } = window;

const payload = {
  playdeck: {
    method: "getPlaydeckState",
  },
};

parent.postMessage(payload, "*");
