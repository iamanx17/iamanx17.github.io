/*
============================================================
<<<<<<< HEAD
curl2code — tool registry, form renderer and router
============================================================

Every tool registers itself:
=======
curl2code — tool runtime

Every tool page is a static HTML document that declares which
tool it hosts:

  <script>window.TOOL = { id: "curl-to-code", preset: { lang: "python" } };</script>

This file finds that tool in the registry, renders its form,
and re-runs it as the user types. Tools register themselves:
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  Tools.add({
    id, cat, name, desc,
    inputs: [ { key, label, type, ... } ],
<<<<<<< HEAD
    run(values) -> string | { html } | Promise<...>
  })

Input types: textarea, text, password, select, checkbox
=======
    run(values) -> string | { html } | { code, notes } | { note }
  })

Input types: textarea, text, password, select, checkbox
============================================================
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
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


<<<<<<< HEAD
const CATEGORY_ORDER = ["cURL", "API", "JSON", "Auth", "Webhooks"];


/*
------------------------------------------------------------
Sidebar
------------------------------------------------------------
*/

function buildSidebar(filter) {

  const nav = document.getElementById("nav");
  const query = (filter || "").toLowerCase().trim();

  const fragment = document.createDocumentFragment();

  let shown = 0;

  for (const category of CATEGORY_ORDER) {

    const tools = Tools.list.filter(tool =>
      tool.cat === category && (
        !query ||
        tool.name.toLowerCase().includes(query) ||
        (tool.desc || "").toLowerCase().includes(query)
      )
    );

    if (!tools.length) continue;

    const title = document.createElement("div");
    title.className = "cat-title";
    title.textContent = category;
    fragment.appendChild(title);

    for (const tool of tools) {

      const item = document.createElement("a");

      item.className = "nav-item";
      item.dataset.id = tool.id;
      item.textContent = tool.name;
      item.href = "#" + tool.id;

      fragment.appendChild(item);
      shown++;
    }
  }

  if (!shown) {

    const empty = document.createElement("div");
    empty.className = "nav-empty";
    empty.textContent = "No tools match that search.";
    fragment.appendChild(empty);
  }

  nav.replaceChildren(fragment);

  markActive();
}


function markActive() {

  const current = location.hash.slice(1);

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.id === current);
  });
=======
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
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
}


/*
------------------------------------------------------------
<<<<<<< HEAD
Rendering a tool
=======
Form rendering
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
------------------------------------------------------------
*/

let currentTool = null;
<<<<<<< HEAD
=======
let lastCopyText = "";
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)


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


<<<<<<< HEAD
function renderTool(tool) {

  currentTool = tool;

  document.title = tool.name + " — curl2code";

  document.getElementById("tool-title").textContent = tool.name;
  document.getElementById("tool-desc").textContent = tool.desc || "";
  document.getElementById("tool-cat").textContent = tool.cat;
  document.getElementById("output-label").textContent = tool.outputLabel || "Output";

  /* replay the entrance animation on every tool switch */
  document.querySelectorAll(".tool-head, .panel, .actions").forEach(el => {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });
=======
function renderTool(tool, preset) {

  currentTool = tool;

  const label = document.getElementById("output-label");

  if (label) label.textContent = tool.outputLabel || "Output";
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  const fields = document.createDocumentFragment();

  for (const input of tool.inputs) {
    fields.appendChild(buildField(input));
  }

  document.getElementById("input-fields").replaceChildren(fields);

<<<<<<< HEAD
  document.getElementById("exampleBtn").hidden = !tool.example;
=======
  if (preset) applyValues(preset);

  const exampleBtn = document.getElementById("exampleBtn");

  if (exampleBtn) exampleBtn.hidden = !tool.example;
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  if (tool.autoRun === false) {
    showPlaceholder("Fill in the fields, then press Run.");
  } else {
    run();
  }
}


<<<<<<< HEAD
=======
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


>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
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
<<<<<<< HEAD
=======

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
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
}


function setOutput(result) {

  const box = document.getElementById("output");

  if (result && typeof result === "object" && result.note !== undefined) {

    showPlaceholder(result.note);
    flashOutput(box);

    return;
  }

<<<<<<< HEAD
=======
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

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  if (result && typeof result === "object" && result.html !== undefined) {

    const wrap = document.createElement("div");
    wrap.className = "out-html";
    wrap.innerHTML = result.html;

    box.replaceChildren(wrap);

<<<<<<< HEAD
=======
    lastCopyText = wrap.innerText.trim();

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  } else {

    const pre = document.createElement("pre");
    pre.textContent = result || "";

    box.replaceChildren(pre);
<<<<<<< HEAD
=======

    lastCopyText = String(result || "");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
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
<<<<<<< HEAD
=======
let lastErrorMessage = "";
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)


function scheduleRun() {

  clearTimeout(runTimer);

<<<<<<< HEAD
  runTimer = setTimeout(run, 120);
}


async function run() {
=======
  runTimer = setTimeout(run, 140);
}


async function run(options) {
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  if (!currentTool) return;

  const token = ++runToken;

  try {

    const result = await currentTool.run(readValues());

    /* a newer run started while this one was awaiting */
    if (token !== runToken) return;

    setOutput(result);
<<<<<<< HEAD
=======
    lastErrorMessage = "";

    if (options && options.manual) {
      track("generate", { tool_id: currentTool.id });
    }
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  } catch (error) {

    if (token !== runToken) return;

    setOutput({
<<<<<<< HEAD
      html: '<h3 class="error">Error</h3><p>' + escapeHtml(error.message) + "</p>"
    });
=======
      html: '<h3 class="error">' + escapeHtml(error.name === "Error" ? "Could not convert that" : error.name) +
        "</h3><p>" + escapeHtml(error.message) + "</p>"
    });

    /* only report the first occurrence of a given message per tool */
    if (error.message !== lastErrorMessage) {

      lastErrorMessage = error.message;

      track("tool_error", { tool_id: currentTool.id, error_message: error.message.slice(0, 100) });
    }
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  }
}


/*
------------------------------------------------------------
<<<<<<< HEAD
Routing
------------------------------------------------------------
*/

function route() {

  const id = location.hash.slice(1);
  const tool = Tools.get(id) || Tools.list[0];

  if (!tool) return;

  if (id !== tool.id) {
    location.replace("#" + tool.id);
    return;
  }

  renderTool(tool);
  markActive();
  closeSidebar();
}


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
Chrome: toast, sidebar, shortcuts
=======
Chrome: toast, copy, shortcuts
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
------------------------------------------------------------
*/

let toastTimer = null;


function toast(message) {

  const el = document.getElementById("toast");

<<<<<<< HEAD
=======
  if (!el) return;

>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  el.textContent = message;
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => el.classList.remove("show"), 1700);
}


<<<<<<< HEAD
function closeSidebar() {

  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("scrim").classList.remove("show");
}


async function copyOutput() {

  const text = document.getElementById("output").innerText.trim();
=======
async function copyOutput() {

  const text = lastCopyText || document.getElementById("output").innerText.trim();
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

  if (!text) return toast("Nothing to copy yet");

  try {
<<<<<<< HEAD
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  } catch {
    toast("Clipboard blocked by the browser");
=======

    await navigator.clipboard.writeText(text);

    toast("Copied to clipboard");
    track("copy_clicked", { tool_id: currentTool ? currentTool.id : "unknown" });

  } catch {
    toast("Your browser blocked clipboard access — select the text and copy manually.");
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
  }
}


/*
------------------------------------------------------------
Boot
------------------------------------------------------------
*/

<<<<<<< HEAD
window.addEventListener("hashchange", route);

window.addEventListener("DOMContentLoaded", () => {

  buildSidebar("");
  route();

  const search = document.getElementById("search");

  search.addEventListener("input", event => buildSidebar(event.target.value));

  search.addEventListener("keydown", event => {

    if (event.key === "Escape") {
      search.value = "";
      buildSidebar("");
      search.blur();
    }

    if (event.key === "Enter") {

      const first = document.querySelector(".nav-item");

      if (first) location.hash = first.dataset.id;
    }
  });

  document.getElementById("runBtn").addEventListener("click", run);

  document.getElementById("exampleBtn").addEventListener("click", () => {

    if (!currentTool || !currentTool.example) return;

    for (const [key, value] of Object.entries(currentTool.example)) {

      const el = document.getElementById("in-" + key);

      if (!el) continue;

      if (el.type === "checkbox") {
        el.checked = !!value;
      } else {
        el.value = value;
      }
    }
=======
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
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

    run();
    toast("Example loaded");
  });

<<<<<<< HEAD
  document.getElementById("copyBtn").addEventListener("click", copyOutput);
  document.getElementById("copyBtn2").addEventListener("click", copyOutput);

  document.getElementById("clearBtn").addEventListener("click", () => {
=======
  on("clearBtn", "click", () => {
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)

    document
      .querySelectorAll("#input-fields textarea, #input-fields input[type=text], #input-fields input[type=password]")
      .forEach(el => { el.value = ""; });

    run();
  });

<<<<<<< HEAD
  /* mobile drawer */

  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("scrim").classList.toggle("show");
  });

  document.getElementById("scrim").addEventListener("click", closeSidebar);

  /* shortcuts */

  document.addEventListener("keydown", event => {

    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

    if (event.key === "/" && !typing) {
      event.preventDefault();
      search.focus();
      search.select();
    }

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      run();
=======
  document.addEventListener("keydown", event => {

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      run({ manual: true });
>>>>>>> f3ae358 (Rebuild curl2code as a static multi-page site)
    }
  });
});
