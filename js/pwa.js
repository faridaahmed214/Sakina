if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("../sw.js")
      .then((registration) => {
        console.log("Sakina PWA Registered");

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
