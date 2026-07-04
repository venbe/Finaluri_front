const LOG_KEY = "depot.messages.v1";

const form = document.querySelector("[data-contact-form]");
const logList = document.querySelector("[data-log-list]");
const successNote = document.querySelector("[data-form-success]");

const fields = {
  name: {
    input: form.querySelector("#name"),
    validate: (v) => v.trim().length >= 2, 
    message: "Enter your name (at least 2 characters).",
  },
  email: {
    input: form.querySelector("#email"),
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: "Enter a valid email address.",
  },
  topic: {
    input: form.querySelector("#topic"),
    validate: (v) => v !== "", 
    message: "Choose a topic.",
  },
  message: {
    input: form.querySelector("#message"),
    validate: (v) => v.trim().length >= 6,
    message: "Message should be at least 6 characters.",
  },
};


function validateField(key) {
  const { input, validate, message } = fields[key];
  const wrapper = input.closest(".field");           
  const errorEl = wrapper.querySelector(".field-error"); 
  const isValid = validate(input.value);

  wrapper.classList.toggle("has-error", !isValid);
  errorEl.textContent = isValid ? "" : message;

  return isValid;
}


Object.keys(fields).forEach((key) => {
  fields[key].input.addEventListener("blur", () => validateField(key));

 
  fields[key].input.addEventListener("input", () => {
    const wrapper = fields[key].input.closest(".field");
    if (wrapper.classList.contains("has-error")) validateField(key);
  });
});


form.addEventListener("submit", (event) => {

  event.preventDefault();

  const results = Object.keys(fields).map(validateField);
  const allValid = results.every(Boolean);

  if (!allValid) {
    successNote.hidden = true;

    const firstInvalid = form.querySelector(
      ".field.has-error input, .field.has-error textarea, .field.has-error select"
    );
    firstInvalid?.focus(); 
    return; 
  }

  saveMessage({
    name: fields.name.input.value.trim(),
    email: fields.email.input.value.trim(),
    topic: fields.topic.input.value,
    message: fields.message.input.value.trim(),
    sentAt: new Date().toISOString(), 
  });

  form.reset();              
  successNote.hidden = false; 
  toast("Message saved");
  renderLog();                

  setTimeout(() => {
    successNote.hidden = true;
  }, 4000);
});

function getMessages() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY)) || [];
  } catch {
    return []; 
  }
}

function saveMessage(entry) {
  const log = getMessages();
  log.unshift(entry); 
  localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 10)));
}


function renderLog() {
  const log = getMessages();

  if (log.length === 0) {
    logList.innerHTML = `<p class="state-msg">No messages!</p>`;
    return;
  }

  logList.innerHTML = log
    .map(
      (entry) => `
      <div class="log-item">
        <div class="log-item-head">
          <span>${escapeHtml(entry.topic)}</span>
          <span>${new Date(entry.sentAt).toLocaleString()}</span>
        </div>
        <p style="font-weight:600; font-size:0.9rem;">${escapeHtml(entry.name)} — ${escapeHtml(entry.email)}</p>
        <p style="color:var(--ink-soft); font-size:0.9rem; margin-top:4px;">${escapeHtml(entry.message)}</p>
      </div>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", renderLog);
