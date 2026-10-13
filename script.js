document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelector("[data-year]").textContent = new Date().getFullYear();

const reservationForm = document.querySelector("#reservation-form");
const reservationStatus = document.querySelector("#reservation-status");
if (reservationForm) {
  const checkin = reservationForm.elements.checkin;
  const checkout = reservationForm.elements.checkout;
  const room = reservationForm.elements.room;
  const guests = reservationForm.elements.guests;
  const localDate = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };
  const capacityByRoom = { Individual: 1, Duplo: 2, Triplo: 3, "Quádruplo": 4 };
  checkin.min = localDate(new Date());
  checkout.min = checkin.min;

  checkin.addEventListener("change", () => {
    if (!checkin.value) return;
    const nextDay = new Date(`${checkin.value}T12:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    checkout.min = localDate(nextDay);
    if (checkout.value && checkout.value <= checkin.value) checkout.value = "";
  });

  document.querySelectorAll("[data-room-select]").forEach((link) => {
    link.addEventListener("click", () => {
      const valueBySlug = {
        individual: "Individual",
        duplo: "Duplo",
        triplo: "Triplo",
        quadruplo: "Quádruplo",
      };
      room.value = valueBySlug[link.dataset.roomSelect] || "";
      guests.value = String(Math.min(Number(guests.value), capacityByRoom[room.value] || 4));
    });
  });

  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(reservationForm);
    const selectedRoom = formData.get("room");
    const guestCount = Number(formData.get("guests"));
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = contact.replace(/\D/g, "");
    if (name.length < 2) {
      reservationStatus.textContent = "Informe seu nome para a equipe identificar a solicitação.";
      reservationForm.elements.name.focus();
      return;
    }
    if (!emailPattern.test(contact) && phoneDigits.length < 8) {
      reservationStatus.textContent = "Informe um e-mail válido ou um telefone com ao menos 8 dígitos.";
      reservationForm.elements.contact.focus();
      return;
    }
    if (formData.get("checkout") <= formData.get("checkin")) {
      reservationStatus.textContent = "Escolha uma data de saída posterior à entrada.";
      checkout.focus();
      return;
    }
    if (guestCount > (capacityByRoom[selectedRoom] || 4)) {
      reservationStatus.textContent = "A quantidade de hóspedes supera a capacidade anunciada para esta categoria. Escolha outra categoria ou ligue para confirmar opções.";
      room.focus();
      return;
    }

    const email = reservationForm.dataset.email;
    const subject = `Consulta de disponibilidade — ${selectedRoom}`;
    const body = [
      "Olá, equipe do Solara Hotel.",
      "Gostaria de consultar disponibilidade para a hospedagem abaixo:",
      `Nome: ${name}`,
      `Contato: ${contact}`,
      `Entrada: ${formData.get("checkin")}`,
      `Saída: ${formData.get("checkout")}`,
      `Hóspedes: ${guestCount}`,
      `Categoria desejada: ${selectedRoom}`,
      "",
      "Se possível, gostaria de receber as condições atuais. Sei que esta mensagem é apenas uma consulta e não confirma uma reserva.",
    ].join("\n");
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    reservationStatus.textContent = "Abrindo seu aplicativo de e-mail. Revise a mensagem e envie para concluir a consulta.";
    window.location.href = mailto;
  });
}

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 30);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeMenu = () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  navigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) closeMenu();
});

const revealTargets = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

