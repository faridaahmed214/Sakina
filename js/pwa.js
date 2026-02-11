if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log("Sakina PWA Registered");

        startSalatReminder();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      })
      .catch((err) => console.log("SW Failed", err));

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  });
}

function playZekrSound() {
  const audio = new Audio("./assets/notification-sound.mp3");
  audio.play().catch((e) => console.log("Sound blocked until user interacts"));
}

async function sendNotification() {
  const registration = await navigator.serviceWorker.ready;
  playZekrSound();

  registration.showNotification("Sakina | سكينة", {
    body: "صلي على النبي ﷺ",
    icon: "./assets/icon512.png",
    badge: "./assets/icon192.png",
    vibrate: [200, 100, 200],
    tag: "salat-reminder",
    renotify: true,
  });
}

async function startSalatReminder() {
  if (Notification.permission === "default") {
    document.addEventListener(
      "click",
      async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          runInterval();
        }
      },
      { once: true },
    );
  } else if (Notification.permission === "granted") {
    runInterval();
  }
}

function runInterval() {
  sendNotification();
  setInterval(sendNotification, 3600000);
}

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

if (installBtn) {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "flex";
  });

  installBtn.addEventListener("click", () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        deferredPrompt = null;
        installBtn.style.display = "none";
      });
    }
  });
}
