/*
============================================================
curl2code — tool runtime

Every tool page is a static HTML document that declares which
tool it hosts:

  <script>window.TOOL = { id: "curl-to-code", preset: { lang: "python" } };</script>

This file finds that tool in the registry, renders its form,
and re-runs it as the user types. Tools register themselves:

  Tools.add({
    id, cat, name, desc,
    inputs: [ { key, label, type, ... } ],
    run(values) -> string | { html } | { code, notes } | { note }
  })

Input types: textarea, text, password, select, checkbox
============================================================
*/

const Tools = {

  list: [],

  add(tool) {
    this.list.push(tool);
  },

  get(id) {
    return this.list.find(tool => tool.id === id);
  }
};


/*
------------------------------------------------------------
Shared helpers used by every tool module
------------------------------------------------------------
*/

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


function parseJson(text, what) {

  if (!text || !text.trim()) {
    throw new Error("Paste some " + (what || "JSON") + " first.");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Invalid JSON — " + error.message);
  }
}


/*
------------------------------------------------------------
Form rendering
------------------------------------------------------------
*/

let currentTool = null;
let lastCopyText = "";


function buildField(input) {

  const field = document.createElement("div");
  field.className = "field";

  let el;

  if (input.type === "textarea") {

    el = document.createElement("textarea");
    el.placeholder = input.placeholder || "";
    el.spellcheck = false;

    if (input.tall) el.classList.add("tall");

  } else if (input.type === "select") {

    el = document.createElement("select");

    for (const option of input.options) {

      const opt = document.createElement("option");

      opt.value = typeof option === "string" ? option : option.value;
      opt.textContent = typeof option === "string" ? option : option.label;

      el.appendChild(opt);
    }

  } else if (input.type === "checkbox") {

    el = document.createElement("input");
    el.type = "checkbox";

  } else {

    el = document.createElement("input");
    el.type = input.type === "password" ? "password" : "text";
    el.placeholder = input.placeholder || "";
    el.spellcheck = false;
    el.autocomplete = "off";
  }

  el.id = "in-" + input.key;
  el.dataset.key = input.key;

  if (input.value !== undefined) {

    if (input.type === "checkbox") {
      el.checked = !!input.value;
    } else {
      el.value = input.value;
    }
  }

  if (input.type === "checkbox") {

    const wrap = document.createElement("label");

    wrap.className = "check";
    wrap.appendChild(el);
    wrap.appendChild(document.createTextNode(input.label));

    field.appendChild(wrap);

  } else {

    const label = document.createElement("label");
    label.textContent = input.label;
    label.htmlFor = el.id;

    field.appendChild(label);
    field.appendChild(el);
  }

  if (input.hint) {

    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = input.hint;

    field.appendChild(hint);
  }

  el.addEventListener("input", scheduleRun);
  el.addEventListener("change", scheduleRun);

  return field;
}


function renderTool(tool, preset) {

  currentTool = tool;

  const label = document.getElementById("output-label");

  if (label) label.textContent = tool.outputLabel || "Output";

  const fields = document.createDocumentFragment();

  for (const input of tool.inputs) {
    fields.appendChild(buildField(input));
  }

  document.getElementById("input-fields").replaceChildren(fields);

  if (preset) applyValues(preset);

  const exampleBtn = document.getElementById("exampleBtn");

  if (exampleBtn) exampleBtn.hidden = !tool.example;

  if (tool.autoRun === false) {
    showPlaceholder("Fill in the fields, then press Run.");
  } else {
    run();
  }
}


function applyValues(values) {

  for (const [key, value] of Object.entries(values)) {

    const el = document.getElementById("in-" + key);

    if (!el) continue;

    if (el.type === "checkbox") {
      el.checked = !!value;
    } else {
      el.value = value;
    }
  }
}


function readValues() {

  const values = {};

  for (const input of currentTool.inputs) {

    const el = document.getElementById("in-" + input.key);

    values[input.key] = input.type === "checkbox" ? el.checked : el.value;
  }

  return values;
}


/*
------------------------------------------------------------
Output
------------------------------------------------------------
*/

function flashOutput(box) {

  box.classList.remove("flash");
  void box.offsetWidth;
  box.classList.add("flash");
}


function showPlaceholder(message) {

  const box = document.getElementById("output");

  const div = document.createElement("div");
  div.className = "placeholder";
  div.textContent = message;

  box.replaceChildren(div);

  lastCopyText = "";
}


function noteList(notes) {

  const wrap = document.createElement("div");
  wrap.className = "notes";

  const title = document.createElement("strong");
  title.textContent = notes.length === 1 ? "1 option was not converted" : notes.length + " options were not converted";

  wrap.appendChild(title);

  const list = document.createElement("ul");

  for (const note of notes) {

    const item = document.createElement("li");
    item.textContent = note;

    list.appendChild(item);
  }

  wrap.appendChild(list);

  return wrap;
}


function setOutput(result) {

  const box = document.getElementById("output");

  if (result && typeof result === "object" && result.note !== undefined) {

    showPlaceholder(result.note);
    flashOutput(box);

    return;
  }

  if (result && typeof result === "object" && result.code !== undefined) {

    const nodes = [];

    const pre = document.createElement("pre");
    pre.textContent = result.code;

    nodes.push(pre);

    if (result.notes && result.notes.length) nodes.push(noteList(result.notes));

    box.replaceChildren(...nodes);

    lastCopyText = result.code;
    flashOutput(box);

    return;
  }

  if (result && typeof result === "object" && result.html !== undefined) {

    const wrap = document.createElement("div");
    wrap.className = "out-html";
    wrap.innerHTML = result.html;

    box.replaceChildren(wrap);

    lastCopyText = wrap.innerText.trim();

  } else {

    const pre = document.createElement("pre");
    pre.textContent = result || "";

    box.replaceChildren(pre);

    lastCopyText = String(result || "");
  }

  flashOutput(box);
}


/*
------------------------------------------------------------
Running
------------------------------------------------------------
*/

let runTimer = null;
let runToken = 0;
let lastErrorMessage = "";


function scheduleRun() {

  clearTimeout(runTimer);

  runTimer = setTimeout(run, 140);
}


async function run(options) {

  if (!currentTool) return;

  const token = ++runToken;

  try {

    const result = await currentTool.run(readValues());

    /* a newer run started while this one was awaiting */
    if (token !== runToken) return;

    setOutput(result);
    lastErrorMessage = "";

    if (options && options.manual) {
      track("generate", { tool_id: currentTool.id });
    }

  } catch (error) {

    if (token !== runToken) return;

    setOutput({
      html: '<h3 class="error">' + escapeHtml(error.name === "Error" ? "Could not convert that" : error.name) +
        "</h3><p>" + escapeHtml(error.message) + "</p>"
    });

    /* only report the first occurrence of a given message per tool */
    if (error.message !== lastErrorMessage) {

      lastErrorMessage = error.message;

      track("tool_error", { tool_id: currentTool.id, error_message: error.message.slice(0, 100) });
    }
  }
}


/*
------------------------------------------------------------
Chrome: toast, copy, shortcuts
------------------------------------------------------------
*/

let toastTimer = null;


function toast(message) {

  const el = document.getElementById("toast");

  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => el.classList.remove("show"), 1700);
}


async function copyOutput() {

  const text = lastCopyText || document.getElementById("output").innerText.trim();

  if (!text) return toast("Nothing to copy yet");

  try {

    await navigator.clipboard.writeText(text);

    toast("Copied to clipboard");
    track("copy_clicked", { tool_id: currentTool ? currentTool.id : "unknown" });

  } catch {
    toast("Your browser blocked clipboard access — select the text and copy manually.");
  }
}


/*
------------------------------------------------------------
Boot
------------------------------------------------------------
*/

window.addEventListener("DOMContentLoaded", () => {

  const config = window.TOOL;

  if (!config) return;

  const tool = Tools.get(config.id);

  if (!tool) {

    showPlaceholder("This tool failed to load. Please refresh the page.");
    return;
  }

  /* a page may ask for the tool's example to be loaded, so a first-time
     visitor sees a real conversion instead of an empty box */
  const preset = config.prefill
    ? { ...(tool.example || {}), ...(config.preset || {}) }
    : config.preset;

  renderTool(tool, preset);

  track("tool_opened", { tool_id: tool.id, tool_category: tool.cat });

  const on = (id, event, handler) => {

    const el = document.getElementById(id);

    if (el) el.addEventListener(event, handler);
  };

  on("runBtn", "click", () => run({ manual: true }));
  on("copyBtn", "click", copyOutput);
  on("copyBtn2", "click", copyOutput);

  on("exampleBtn", "click", () => {

    if (!currentTool || !currentTool.example) return;

    applyValues(currentTool.example);

    run();
    toast("Example loaded");
  });

  on("clearBtn", "click", () => {

    document
      .querySelectorAll("#input-fields textarea, #input-fields input[type=text], #input-fields input[type=password]")
      .forEach(el => { el.value = ""; });

    run();
  });

  document.addEventListener("keydown", event => {

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      run({ manual: true });
    }
  });
});
