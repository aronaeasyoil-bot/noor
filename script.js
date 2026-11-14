const dialog = document.querySelector("#planner-dialog");
const serviceField = document.querySelector("#selected-service");
const serviceLabel = document.querySelector("#dialog-service");
const destinationField = document.querySelector("#planner-destination");
const languageToggle = document.querySelector(".language-button");
const languageMenu = document.querySelector(".language-menu");
let language = "en";
let selectedEnglishService = "Travel planning";
let selectedFrenchService = "Préparer un voyage";

function setLanguage(nextLanguage) {
  language = nextLanguage === "fr" ? "fr" : "en";
  document.documentElement.lang = language;
  document.querySelector("#current-language").textContent = language.toUpperCase();

  document.querySelectorAll("[data-en][data-fr]").forEach((element) => {
    const translation = element.dataset[language];
    if (translation) element.innerHTML = translation;
  });

  document.querySelectorAll(".service-tile").forEach((tile) => {
    tile.setAttribute("aria-label", language === "fr" ? tile.dataset.frService : tile.dataset.service);
  });

  serviceField.value = language === "fr" ? selectedFrenchService : selectedEnglishService;
  serviceLabel.textContent = serviceField.value;
  destinationField.placeholder = language === "fr"
    ? "Dubaï, Abou Dhabi, Marrakech…"
    : "Dubai, Abu Dhabi, Marrakech…";

  try { localStorage.setItem("noor-language", language); } catch { /* Storage can be disabled. */ }
}

function openPlanner(service = "Travel planning", frenchService = "Préparer un voyage") {
  selectedEnglishService = service;
  selectedFrenchService = frenchService;
  serviceField.value = language === "fr" ? frenchService : service;
  serviceLabel.textContent = language === "fr" ? frenchService : service;
  if (!dialog.open) dialog.showModal();
  window.setTimeout(() => destinationField.focus({ preventScroll: true }), 80);
}

document.querySelectorAll("[data-open-planner]").forEach((button) => {
  button.addEventListener("click", () => {
    openPlanner(button.dataset.service || "Travel planning", button.dataset.frService || "Préparer un voyage");
  });
});

document.querySelectorAll(".service-tile").forEach((tile) => {
  tile.setAttribute("aria-pressed", "false");
  tile.addEventListener("click", () => {
    document.querySelectorAll(".service-tile").forEach((item) => item.setAttribute("aria-pressed", "false"));
    tile.setAttribute("aria-pressed", "true");
    openPlanner(tile.dataset.service, tile.dataset.frService);
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

languageToggle.addEventListener("click", () => {
  const expanded = languageToggle.getAttribute("aria-expanded") === "true";
  languageToggle.setAttribute("aria-expanded", String(!expanded));
  languageMenu.hidden = expanded;
});

languageMenu.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
    languageToggle.setAttribute("aria-expanded", "false");
    languageMenu.hidden = true;
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".top-actions")) {
    languageToggle.setAttribute("aria-expanded", "false");
    languageMenu.hidden = true;
  }
});

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#main-menu");
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menu.hidden = expanded;
});
menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  menu.hidden = true;
}));

try { setLanguage(localStorage.getItem("noor-language") || "en"); } catch { setLanguage("en"); }
