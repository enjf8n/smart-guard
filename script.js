const quizSteps = Array.from(document.querySelectorAll(".quiz__step"));
const prevBtn = document.getElementById("quiz-prev");
const nextBtn = document.getElementById("quiz-next");
const progressFill = document.getElementById("quiz-progress-fill");
const progressPercent = document.getElementById("quiz-progress-percent");
const stepText = document.getElementById("quiz-step-text");
const startQuizBtn = document.querySelector('a[href="#quiz"]');
const quizSection = document.getElementById("quiz");
const callbackBtn = document.getElementById("callback-btn");
const contactSection = document.getElementById("contact");
const userAnswers = {
  objectType: "",
  securityLevel: "",
  installTime: "",
};

let currentStep = 0;

function getTotalSteps() {
  return quizSteps.length;
}

function setActiveStep(stepIndex) {
  quizSteps.forEach((step, index) => {
    step.classList.toggle("is-active", index === stepIndex);
  });

  const total = getTotalSteps();
  const progress = Math.round(((stepIndex + 1) / total) * 100);
  progressFill.style.width = `${progress}%`;
  progressPercent.textContent = `${progress}%`;
  stepText.textContent = `Вопрос ${stepIndex + 1} из ${total}`;

  prevBtn.disabled = stepIndex === 0;
  nextBtn.textContent = stepIndex === total - 1 ? "К форме" : "Далее";
}

function isCurrentStepAnswered() {
  const activeStep = quizSteps[currentStep];
  if (!activeStep) {
    return false;
  }
  return Boolean(activeStep.querySelector('input[type="radio"]:checked'));
}

function updateUserAnswers(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  if (target.type !== "radio" || !target.name) {
    return;
  }
  if (Object.prototype.hasOwnProperty.call(userAnswers, target.name)) {
    userAnswers[target.name] = target.value;
  }
}

quizSteps.forEach((step) => {
  step.addEventListener("change", updateUserAnswers);
});

prevBtn?.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep -= 1;
    setActiveStep(currentStep);
  }
});

nextBtn?.addEventListener("click", () => {
  if (!isCurrentStepAnswered()) {
    return;
  }

  if (currentStep < getTotalSteps() - 1) {
    currentStep += 1;
    setActiveStep(currentStep);
    return;
  }

  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

setActiveStep(currentStep);

startQuizBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  quizSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

const phoneInput = document.getElementById("phone");
const leadForm = document.getElementById("lead-form");
const phoneError = document.getElementById("phone-error");
const modal = document.getElementById("success-modal");
const closeModalElements = document.querySelectorAll("[data-close-modal]");
const featureCards = Array.from(document.querySelectorAll(".feature-card"));

callbackBtn?.addEventListener("click", () => {
  contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    phoneInput?.focus();
  }, 450);
});

function applyPhoneMask(value) {
  const digits = value.replace(/\D/g, "").substring(0, 11);
  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
  const parts = normalized.startsWith("7") ? normalized.slice(1) : normalized;

  let masked = "+7";
  if (parts.length > 0) masked += ` (${parts.slice(0, 3)}`;
  if (parts.length >= 3) masked += ")";
  if (parts.length > 3) masked += ` ${parts.slice(3, 6)}`;
  if (parts.length > 6) masked += `-${parts.slice(6, 8)}`;
  if (parts.length > 8) masked += `-${parts.slice(8, 10)}`;
  return masked;
}

function isPhoneComplete(value) {
  return value.replace(/\D/g, "").length === 11;
}

function showPhoneError(message) {
  if (phoneError) {
    phoneError.textContent = message;
  }
  phoneInput?.classList.add("input-error", "is-shaking");
  // Restart shake animation on repeated invalid submits.
  setTimeout(() => phoneInput?.classList.remove("is-shaking"), 450);
}

function clearPhoneError() {
  if (phoneError) {
    phoneError.textContent = "";
  }
  phoneInput?.classList.remove("input-error", "is-shaking");
}

phoneInput?.addEventListener("input", (event) => {
  const target = event.target;
  target.value = applyPhoneMask(target.value);
  if (isPhoneComplete(target.value)) {
    clearPhoneError();
  }
});

function openModal() {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

closeModalElements.forEach((element) => {
  element.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const phoneValue = phoneInput?.value ?? "";
  const submitButton = leadForm.querySelector('button[type="submit"]');
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }
  if (submitButton.classList.contains("is-loading")) {
    return;
  }

  if (!isPhoneComplete(phoneValue)) {
    showPhoneError("Введите телефон полностью в формате +7 (XXX) XXX-XX-XX");
    phoneInput?.focus();
    return;
  }

  clearPhoneError();
  submitButton.classList.add("is-loading");
  submitButton.disabled = true;
  const initialButtonText = submitButton.textContent;
  submitButton.textContent = "Отправка...";

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const leadPayload = {
    name: (leadForm.elements.namedItem("name")?.value || "").trim() || "Не указано",
    phone: phoneValue,
    objectType: userAnswers.objectType || "Не выбран",
    securityLevel: userAnswers.securityLevel || "Не выбрана",
    installTime: userAnswers.installTime || "Не выбраны",
    submittedAt: new Date().toISOString(),
  };
  console.log("--- НОВАЯ ЗАЯВКА ---", leadPayload);

  submitButton.classList.remove("is-loading");
  submitButton.disabled = false;
  submitButton.textContent = initialButtonText;
  leadForm.reset();
  userAnswers.objectType = "";
  userAnswers.securityLevel = "";
  userAnswers.installTime = "";
  openModal();
});

featureCards.forEach((card) => card.classList.add("reveal"));
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("feature-card")) {
            const index = featureCards.indexOf(entry.target);
            const delay = Math.max(0, index) * 200;
            setTimeout(() => {
              entry.target.classList.add("is-visible");
            }, delay);
          } else {
            entry.target.classList.add("is-visible");
          }
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (window.VanillaTilt && window.innerWidth > 1024) {
  const tiltCards = document.querySelectorAll(".quiz__card, .feature-card");
  if (tiltCards.length > 0) {
    VanillaTilt.init(tiltCards, {
      max: 5,
      speed: 1000,
      glare: true,
      "max-glare": 0.1,
      gyroscope: true,
      perspective: 1500,
      scale: 1.02,
    });
  }

  const heroTiltElements = document.querySelectorAll("[data-hero-tilt]");
  if (heroTiltElements.length > 0) {
    VanillaTilt.init(heroTiltElements, {
      max: 1.5,
      speed: 1000,
      glare: false,
      gyroscope: false,
      perspective: 1500,
      scale: 1,
    });
  }
}
