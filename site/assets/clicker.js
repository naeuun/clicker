// clicker.js – Animal Clicker static front-end
// Handles design/sound selection and batch-syncs click counts to Supabase.

(function () {
  // ── DOM refs ───────────────────────────────────────────────────
  const clickerImg  = document.getElementById("clicker");
  const countEl     = document.getElementById("count");

  // ── State ──────────────────────────────────────────────────────
  let currentDesign = "lion";
  let localScore    = parseInt(countEl.textContent, 10) || 0;
  let pendingDelta  = 0;           // clicks not yet synced
  let syncing       = false;

  const nickname = localStorage.getItem("nickname");
  const pin      = localStorage.getItem("pin");

  // ── Audio pool (iPhone reliability) ───────────────────────────
  const POOL_SIZE = 4;
  let   poolIndex = 0;
  let   currentSoundName = "clicker1";

  function buildPool(soundName) {
    const pool = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const a = new Audio("./assets/sounds/" + soundName + ".mp3");
      a.preload = "auto";
      pool.push(a);
    }
    return pool;
  }

  let audioPool = buildPool(currentSoundName);

  function playSound() {
    const a = audioPool[poolIndex % POOL_SIZE];
    poolIndex++;
    a.currentTime = 0;
    a.play().catch(function () {}); // ignore autoplay policy errors
  }

  // ── Design selection ──────────────────────────────────────────
  const VALID_DESIGNS = ["lion", "bear", "cat"];

  window.setDesign = function (name, event) {
    if (!VALID_DESIGNS.includes(name)) return;
    currentDesign = name;
    clickerImg.src = "./assets/images/" + name + "_default.png";

    document.querySelectorAll(".design-select button")
      .forEach(function (btn) { btn.classList.remove("selected"); });
    event.target.classList.add("selected");
  };

  // ── Sound selection ───────────────────────────────────────────
  const VALID_SOUNDS = ["clicker1", "clicker2", "clicker3"];

  window.setSound = function (name, event) {
    if (!VALID_SOUNDS.includes(name)) {
      console.warn("setSound: unknown sound", name);
      return;
    }
    currentSoundName = name;
    audioPool = buildPool(name);
    poolIndex = 0;

    document.querySelectorAll(".sound-select button")
      .forEach(function (btn) { btn.classList.remove("selected"); });
    event.target.classList.add("selected");
  };

  // ── Sync status display ───────────────────────────────────────
  function setStatus(state) {
    if (window.console && console.debug) console.debug("[sync]", state);
  }

  // ── Batch sync to Supabase ────────────────────────────────────
  async function syncScore() {
    if (syncing || pendingDelta === 0) return;
    if (!window._supabase) return;

    syncing = true;
    setStatus("syncing");
    const delta = pendingDelta;

    try {
      const { data, error } = await window._supabase.rpc("increment_score", {
        p_nickname: nickname,
        p_pin:      pin,
        p_delta:    delta,
      });

      if (error) throw error;

      pendingDelta -= delta;            // keep any clicks that arrived during await
      if (data && data.length > 0) {
        // server score + any clicks that arrived while awaiting
        localScore = Number(data[0].score) + pendingDelta;
        countEl.textContent = localScore;
      }
      setStatus("synced");
    } catch (err) {
      console.error("sync error:", err);
      setStatus("offline");
    } finally {
      syncing = false;
    }
  }

  setInterval(syncScore, 1000);

  // ── Click / tap handler ───────────────────────────────────────
  clickerImg.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch" && event.currentTarget === clickerImg) {
      event.preventDefault();
    }

    // Optimistic UI
    localScore++;
    pendingDelta++;
    countEl.textContent = localScore;

    // Image flash
    clickerImg.src = "./assets/images/" + currentDesign + "_click.png";
    setTimeout(function () {
      clickerImg.src = "./assets/images/" + currentDesign + "_default.png";
    }, 150);

    // Sound
    playSound();

    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  });

  // Initial status
  setStatus(window._supabase ? "synced" : "offline");
})();
