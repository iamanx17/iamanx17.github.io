/*
---------------------------------------------------
Tiny tool registry + renderer
---------------------------------------------------

Every tool is registered with:

  Tools.add({
    id, cat, name, desc,
    inputs: [ { key, label, type, ... } ],
    run(values) -> string | { html: "..." } | Promise<...>
  })

Input types: textarea, text, password, select, checkbox
*/

const Tools = {

  list: [],

  add(tool) {
    this.list.push(tool);
  },

  get(id) {
    return this.list.find(t => t.id === id);
  }
};


const CATEGORY_ORDER = ["cURL", "API", "JSON", "Auth", "Webhooks"];


/*
---------------------------------------------------
Sidebar
---------------------------------------------------
*/

function buildSidebar(filter) {

  const nav = document.getElementById("nav");

  nav.innerHTML = "";

  const query = (filter || "").toLowerCase().trim();

  for (const cat of CATEGORY_ORDER) {

    const tools = Tools.list.filter(t =>
      t.cat === cat &&
      (!query || t.name.toLowerCase().includes(query))
    );

    if (!tools.length) continue;

    const title = document.createElement("div");
    title.className = "cat-title";
    title.textContent = cat;
    nav.appendChild(title);

    for (const tool of tools) {

      const item = document.createElement("a");

      item.className = "nav-item";
      item.dataset.id = tool.id;
      item.textContent = tool.name;
      item.href = "#" + tool.id;

      nav.appendChild(item);
    }
  }

  markActive();
}


function markActive() {

  const current = location.hash.slice(1);

  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.id === current);
  });
}


/*
---------------------------------------------------
Render a tool
---------------------------------------------------
*/

let currentTool = null;


function renderTool(tool) {

  currentTool = tool;

  document.getElementById("tool-title").textContent = tool.name;
  document.getElementById("tool-desc").textContent = tool.desc || "";

  const inputPanel = document.getElementById("input-fields");
  const outLabel = document.getElementById("output-label");

  inputPanel.innerHTML = "";
  outLabel.textContent = tool.outputLabel || "Output";

  setOutput("");

  for (const input of tool.inputs) {

    const field = document.createElement("div");
    field.className = "field";

    if (input.type !== "checkbox") {
      const label = document.createElement("label");
      label.textContent = input.label;
      field.appendChild(label);
    }

    let el;

    if (input.type === "textarea") {

      el = document.createElement("textarea");
      el.placeholder = input.placeholder || "";
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

      const wrap = document.createElement("label");
      wrap.style.textTransform = "none";
      wrap.style.letterSpacing = "0";
      wrap.style.fontSize = "13px";
      wrap.style.color = "#e6e6e6";
      wrap.style.display = "flex";
      wrap.style.gap = "8px";
      wrap.style.alignItems = "center";
      wrap.style.margin = "0";

      el = document.createElement("input");
      el.type = "checkbox";

      wrap.appendChild(el);
      wrap.appendChild(document.createTextNode(input.label));

      field.appendChild(wrap);

    } else {

      el = document.createElement("input");
      el.type = input.type === "password" ? "password" : "text";
      el.placeholder = input.placeholder || "";
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

    if (input.type !== "checkbox") {
      field.appendChild(el);
    }

    if (input.hint) {
      const hint = document.createElement("div");
      hint.className = "hint";
      hint.textContent = input.hint;
      field.appendChild(hint);
    }

    el.addEventListener("input", run);
    el.addEventListener("change", run);

    inputPanel.appendChild(field);
  }

  document.getElementById("exampleBtn").style.display =
    tool.example ? "" : "none";

  if (tool.autoRun !== false) run();
}


function readValues() {

  const values = {};

  for (const input of currentTool.inputs) {

    const el = document.getElementById("in-" + input.key);

    values[input.key] = input.type === "checkbox" ? el.checked : el.value;
  }

  return values;
}


function setOutput(result) {

  const box = document.getElementById("output");

  if (result && typeof result === "object" && result.html !== undefined) {

    box.innerHTML = '<div class="out-html"></div>';
    box.firstChild.innerHTML = result.html;

  } else {

    box.innerHTML = "<pre></pre>";
    box.firstChild.textContent = result || "";
  }
}


async function run() {

  if (!currentTool) return;

  try {

    const result = await currentTool.run(readValues());

    setOutput(result);

  } catch (error) {

    setOutput({
      html: '<span class="error">Error: ' + escapeHtml(error.message) + "</span>"
    });
  }
}


/*
---------------------------------------------------
Routing
---------------------------------------------------
*/

function route() {

  const id = location.hash.slice(1);

  const tool = Tools.get(id) || Tools.list[0];

  if (!tool) return;

  if (!location.hash) {
    location.hash = tool.id;
    return;
  }

  renderTool(tool);
  markActive();
}


/*
---------------------------------------------------
Shared helpers
---------------------------------------------------
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
---------------------------------------------------
Boot
---------------------------------------------------
*/

window.addEventListener("hashchange", route);

window.addEventListener("DOMContentLoaded", () => {

  buildSidebar("");
  route();

  document.getElementById("search").addEventListener("input", e => {
    buildSidebar(e.target.value);
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

    run();
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {

    const text = document.getElementById("output").textContent;

    if (!text) return;

    await navigator.clipboard.writeText(text);

    const button = document.getElementById("copyBtn");

    button.textContent = "Copied!";

    setTimeout(() => { button.textContent = "Copy Output"; }, 1500);
  });

  document.getElementById("clearBtn").addEventListener("click", () => {

    document.querySelectorAll("#input-fields textarea, #input-fields input[type=text], #input-fields input[type=password]")
      .forEach(el => { el.value = ""; });

    run();
  });
});
