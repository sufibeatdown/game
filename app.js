/* Sufi Beat Down – UI Preview + Audio harness (v0.3) */

const UI = {
  1: { file: "./assets/ui1.png", name: "Loading / Offline setup" },
  2: { file: "./assets/ui2.png", name: "Mode Select" },
  3: { file: "./assets/ui3.png", name: "Online Lobby" },
  4: { file: "./assets/ui4.png", name: "Character Select" },
  5: { file: "./assets/ui5.png", name: "Stage Select" },
  6: { file: "./assets/ui6.png", name: "Fight HUD" },
  7: { file: "./assets/ui7.png", name: "Fight Intro" },
  8: { file: "./assets/ui8.png", name: "Victory" },
  9: { file: "./assets/ui9.png", name: "Defeat" },
  10:{ file: "./assets/ui10.png", name: "Results / Summary" },
  11:{ file: "./assets/ui11.png", name: "Pause Menu" },
  12:{ file: "./assets/ui12.png", name: "Settings" },
  13:{ file: "./assets/ui13.png", name: "Tutorial" },
  14:{ file: "./assets/ui14.png", name: "Character Bio" },
};

const SFX = {
  menu: "./assets/sounds/menu.wav",
  punch1: "./assets/sounds/punch1.wav",
  punch2: "./assets/sounds/punch2.wav",
  kick1: "./assets/sounds/kick1.wav",
  kick2: "./assets/sounds/kick2.wav",
  block: "./assets/sounds/block.wav",
  crowd: "./assets/sounds/crowd.wav",
  win: "./assets/sounds/win.wav",
  lose: "./assets/sounds/lose.wav",
  super: "./assets/sounds/super.mp3",
};

const MUSIC = {
  fight: "./assets/sounds/fight.mp3",
  west1: "./assets/sounds/westcoast.mp3",
  west2: "./assets/sounds/westcoast2.mp3",
  west3: "./assets/sounds/westcoast3.mp3",
  west4: "./assets/sounds/westcoast4.mp3",
};

let current = 1;

// Elements
const uiImage = document.getElementById("uiImage");
const subtitle = document.getElementById("screenSubtitle");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const stageThumbs = document.getElementById("stageThumbs");
const cacheStatus = document.getElementById("cacheStatus");

const musicToggle = document.getElementById("musicToggle");
const sfxToggle = document.getElementById("sfxToggle");
const vol = document.getElementById("vol");
const stopMusic = document.getElementById("stopMusic");

// Audio
const sfxPlayers = new Map();
let musicPlayer = null;

function getVolume() {
  return Math.max(0, Math.min(1, Number(vol.value) / 100));
}

function ensureAudio(url, loop = false) {
  const a = new Audio(url);
  a.preload = "auto";
  a.loop = loop;
  a.volume = getVolume();
  return a;
}

function playSfx(key) {
  if (!sfxToggle.checked) return;

  const url = SFX[key];
  if (!url) return;

  // Create a new player each time for reliable overlapping hits
  const a = ensureAudio(url, false);
  a.play().catch(() => {});
}

function playMusic(key) {
  if (!musicToggle.checked) return;

  const url = MUSIC[key];
  if (!url) return;

  stopCurrentMusic();
  musicPlayer = ensureAudio(url, true);
  musicPlayer.play().catch(() => {});
}

function stopCurrentMusic() {
  if (!musicPlayer) return;
  try {
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
  } catch {}
  musicPlayer = null;
}

function updateAllVolumes() {
  const v = getVolume();
  if (musicPlayer) musicPlayer.volume = v;
}

// UI
function setScreen(n) {
  current = Math.max(1, Math.min(14, n));
  const screen = UI[current];

  subtitle.textContent = screen.name;
  uiImage.src = screen.file;

  // Add small hints for flow
  const hintLeft = document.getElementById("hintLeft");
  if (current === 4) hintLeft.textContent = "Character Select – UI4 loaded. Next: Stage Select.";
  else if (current === 5) hintLeft.textContent = "Stage Select – pick a stage thumb below. Next: Fight HUD.";
  else if (current === 6) hintLeft.textContent = "Fight HUD – we’ll animate mechanics later (movement, hits, HP).";
  else hintLeft.textContent = "Hint: Use the buttons below to navigate.";

  // Soft UI sound
  playSfx("menu");

  // Autoplay music by screen (optional)
  if (current === 6) playMusic("fight");
}

function buildStageThumbs() {
  const names = [
    "Stage 01","Stage 02","Stage 03","Stage 04","Stage 05",
    "Stage 06","Stage 07","Stage 08","Stage 09","Stage 10"
  ];

  stageThumbs.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const num = String(i).padStart(2, "0");
    const file = `./assets/stages/stage${num}.png`;

    const wrap = document.createElement("div");
    wrap.className = "thumb";
    wrap.innerHTML = `
      <img src="${file}" alt="stage ${num}" loading="lazy">
      <div class="label">${names[i-1]}</div>
    `;

    wrap.addEventListener("click", () => {
      playSfx("menu");
      // If user clicks stage thumbs while not on UI5, jump there
      if (current !== 5) setScreen(5);
    });

    stageThumbs.appendChild(wrap);
  }
}

function hookButtons() {
  btnPrev.addEventListener("click", () => setScreen(current - 1));
  btnNext.addEventListener("click", () => setScreen(current + 1));

  document.querySelectorAll("[data-go]").forEach((b) => {
    b.addEventListener("click", () => setScreen(Number(b.dataset.go)));
  });

  document.querySelectorAll("[data-sfx]").forEach((b) => {
    b.addEventListener("click", () => playSfx(b.dataset.sfx));
  });

  document.querySelectorAll("[data-music]").forEach((b) => {
    b.addEventListener("click", () => playMusic(b.dataset.music));
  });

  stopMusic.addEventListener("click", stopCurrentMusic);

  musicToggle.addEventListener("change", () => {
    if (!musicToggle.checked) stopCurrentMusic();
  });

  vol.addEventListener("input", updateAllVolumes);
}

async function checkCacheStatus() {
  try {
    if (!("caches" in window)) {
      cacheStatus.textContent = "Cache: not supported";
      return;
    }
    const keys = await caches.keys();
    cacheStatus.textContent = `Cache: ${keys.length ? "ready" : "empty"}`;
  } catch {
    cacheStatus.textContent = "Cache: unknown";
  }
}

// Init
buildStageThumbs();
hookButtons();
setScreen(1);
checkCacheStatus();
