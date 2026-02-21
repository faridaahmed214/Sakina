lucide.createIcons();

function switchPage(pageId) {
  const pages = document.querySelectorAll(".page-section");
  pages.forEach((page) => page.classList.remove("active"));

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add("active");

  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => item.classList.remove("active"));

  const activeNav = document.getElementById(`nav-${pageId}`);
  if (activeNav) activeNav.classList.add("active");

  if (pageId === "masbaha") initLadder();
}

function toggleTheme() {
  const htmlEl = document.documentElement;

  let currentTheme = htmlEl.getAttribute("data-theme");
  if (!currentTheme) {
    currentTheme = localStorage.getItem("sakina_theme") || "light";
  }

  const newTheme = currentTheme === "light" ? "dark" : "light";

  htmlEl.setAttribute("data-theme", newTheme);
  localStorage.setItem("sakina_theme", newTheme);

  const btn = document.querySelector(".theme-toggle");

  if (btn) {
    const iconName = newTheme === "light" ? "moon" : "sun";

    btn.innerHTML = `<i data-lucide="${iconName}"></i>`;

    lucide.createIcons();
  }
}
// =========================================
// 📖 الأذكار (مع الحفظ التلقائي)
// =========================================

let currentAzkarCategory = "sabah";

function filterAzkar(category) {
  currentAzkarCategory = category;
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick").includes(category))
      btn.classList.add("active");
  });

  const filteredAzkar = azkarData.filter((item) => item.category === category);
  const container = document.getElementById("azkar-list");
  container.innerHTML = "";

  if (filteredAzkar.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; padding:20px; color:var(--text-sub)">لا توجد بيانات هنا حالياً.</p>';
    return;
  }

  filteredAzkar.forEach((zekr, index) => {
    const uniqueKey = `sakina_${category}_${index}`;

    const savedCount = localStorage.getItem(uniqueKey) || 0;

    const div = document.createElement("div");
    div.className = `zekr-card ${savedCount >= zekr.count ? "completed" : ""} ${zekr.count === 100 ? "count-100" : ""}`;

    div.setAttribute("data-target", zekr.count);
    div.setAttribute("data-current", savedCount);
    div.setAttribute("data-key", uniqueKey);
    div.setAttribute("onclick", "incrementCard(this)");

    const percentage = (savedCount / zekr.count) * 100;
    const badgeText =
      savedCount >= zekr.count ? "✔" : `${savedCount} / ${zekr.count}`;

    div.innerHTML = `
            <div class="zekr-header">
                <span class="counter-badge">${badgeText}</span>
                <small style="color:var(--text-sub)">${
                  zekr.description ? zekr.description : ""
                }</small>
            </div>
            <div class="zekr-text">${zekr.text}</div>
            <div class="progress-fill" style="width:${percentage}%"></div>
        `;
    container.appendChild(div);
  });
}

function incrementCard(cardElement) {
  let current = parseInt(cardElement.getAttribute("data-current"));
  const target = parseInt(cardElement.getAttribute("data-target"));
  const key = cardElement.getAttribute("data-key");

  if (current >= target) return;

  current++;
  cardElement.setAttribute("data-current", current);

  localStorage.setItem(key, current);

  const badge = cardElement.querySelector(".counter-badge");
  const progressBar = cardElement.querySelector(".progress-fill");

  badge.innerText = `${current} / ${target}`;
  const percentage = (current / target) * 100;
  progressBar.style.width = `${percentage}%`;

  if (navigator.vibrate) navigator.vibrate(5);

  if (current === target) {
    cardElement.classList.add("completed");
    badge.innerHTML = "✔";
    if (navigator.vibrate) navigator.vibrate([50, 50]);
  }
}

function resetAzkar() {
  if (!currentAzkarCategory) return;

  if (confirm("هل تريد تصفير العدادات لهذه الفئة؟")) {
    const list = azkarData.filter(
      (item) => item.category === currentAzkarCategory,
    );

    list.forEach((item, index) => {
      const key = `sakina_${currentAzkarCategory}_${index}`;
      localStorage.setItem(key, 0);
    });

    filterAzkar(currentAzkarCategory);
  }
}

// =========================================
// 📿 سلم التسابيح
// =========================================

let currentStepIndex = 0;
let currentCount = 0;

function initLadder() {
  const savedIndex = localStorage.getItem("sakina_ladder_index");
  const savedCount = localStorage.getItem("sakina_ladder_count");

  if (savedIndex !== null) currentStepIndex = parseInt(savedIndex);
  if (savedCount !== null) currentCount = parseInt(savedCount);

  const ladderContainer = document.getElementById("ladder-steps");
  if (!ladderContainer) return;

  ladderContainer.innerHTML = "";

  tasabeehLadder.forEach((item, index) => {
    const stepDiv = document.createElement("div");
    stepDiv.className = `step-item ${
      index === currentStepIndex ? "active" : ""
    } ${index < currentStepIndex ? "completed" : ""}`;
    stepDiv.id = `step-${index}`;

    stepDiv.innerHTML = `
            <div class="step-number">
                ${index < currentStepIndex ? "✔" : index + 1}
            </div>
            <div class="step-info">
                ${item.text.substring(0, 35)}...
            </div>
        `;
    ladderContainer.appendChild(stepDiv);
  });

  if (currentStepIndex > 0 && currentStepIndex < tasabeehLadder.length) {
    setTimeout(() => {
      const activeStep = document.getElementById(`step-${currentStepIndex}`);
      if (activeStep)
        activeStep.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  updateActiveCard();
}

function updateActiveCard() {
  const currentTask = tasabeehLadder[currentStepIndex];

  if (!currentTask) {
    document.getElementById("ladder-title").innerText = "تم بحمد الله! 🎉";
    document.getElementById("ladder-desc").innerText =
      "أتممت ورد التسابيح لهذا اليوم.";
    document.getElementById("ladder-count").innerText = "✔";
    document.getElementById("ladder-target").innerText = "";
    return;
  }

  document.getElementById("ladder-title").innerText = currentTask.text;
  document.getElementById("ladder-desc").innerText = currentTask.desc;
  document.getElementById("ladder-count").innerText = currentCount;
  document.getElementById("ladder-target").innerText =
    `/ ${currentTask.target}`;
}

function handleLadderClick() {
  if (currentStepIndex >= tasabeehLadder.length) return;

  const target = tasabeehLadder[currentStepIndex].target;

  if (currentCount < target) {
    currentCount++;
    document.getElementById("ladder-count").innerText = currentCount;

    localStorage.setItem("sakina_ladder_count", currentCount);

    if (navigator.vibrate) navigator.vibrate(5);
  }

  if (currentCount === target) {
    completeStep();
  }
}

function completeStep() {
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

  const currentStepDiv = document.getElementById(`step-${currentStepIndex}`);
  if (currentStepDiv) {
    currentStepDiv.classList.remove("active");
    currentStepDiv.classList.add("completed");
    currentStepDiv.querySelector(".step-number").innerText = "✔";
  }

  currentStepIndex++;
  currentCount = 0;

  localStorage.setItem("sakina_ladder_index", currentStepIndex);
  localStorage.setItem("sakina_ladder_count", 0);

  updateActiveCard();

  if (currentStepIndex < tasabeehLadder.length) {
    const nextStepDiv = document.getElementById(`step-${currentStepIndex}`);
    if (nextStepDiv) {
      nextStepDiv.classList.add("active");
      nextStepDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function resetLadder() {
  if (confirm("هل تريد بدء السلم من جديد؟")) {
    currentStepIndex = 0;
    currentCount = 0;
    // مسح الحفظ
    localStorage.setItem("sakina_ladder_index", 0);
    localStorage.setItem("sakina_ladder_count", 0);
    initLadder();
  }
}

// =========================================
// ❤️ المشاعر
// =========================================
function renderMoods() {
  const grid = document.getElementById("moods-grid");
  if (!grid) return;

  const moodLabels = {
    happy: { label: "سعيد", icon: "smile" },
    sad: { label: "حزين", icon: "frown" },
    anxious: { label: "قلق", icon: "cloud-rain" },
    angry: { label: "غاضب", icon: "flame" },
  };

  grid.innerHTML = "";
  Object.keys(moodData).forEach((key) => {
    const btn = document.createElement("button");
    btn.className = "card";
    const iconName = moodLabels[key] ? moodLabels[key].icon : "circle";
    const labelText = moodLabels[key] ? moodLabels[key].label : key;

    btn.innerHTML = `
            <div style="font-size:1.5rem; margin-bottom:5px; color:var(--primary)">
                <i data-lucide="${iconName}"></i>
            </div>
            <span>${labelText}</span>
        `;
    btn.onclick = () => showMoodResult(key);
    grid.appendChild(btn);
  });
  lucide.createIcons();
}

function showMoodResult(moodKey) {
  const list = moodData[moodKey];
  if (list && list.length > 0) {
    const randomDua = list[Math.floor(Math.random() * list.length)];
    const resultDiv = document.getElementById("mood-result");
    const textP = document.getElementById("mood-text");
    textP.innerText = `"${randomDua}"`;
    resultDiv.style.display = "block";
    resultDiv.scrollIntoView({ behavior: "smooth" });
  }
}

window.onload = function () {
  const savedTheme = localStorage.getItem("sakina_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const btn = document.querySelector(".theme-toggle");

  if (btn) {
    const iconName = savedTheme === "light" ? "moon" : "sun";
    btn.innerHTML = `<i data-lucide="${iconName}"></i>`;

    lucide.createIcons();
  }

  filterAzkar("sabah");
  renderMoods();
};
