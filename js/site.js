/*
------------------------------------------------------------
Site chrome — mobile navigation and the tools filter.
Everything is progressive enhancement: the pages work without it.
------------------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", () => {

  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");

  if (toggle && nav) {

    toggle.addEventListener("click", () => {

      const open = nav.classList.toggle("open");

      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* tools directory: live filter over the cards already in the HTML */
  const filter = document.getElementById("toolFilter");

  if (filter) {

    const cards = [...document.querySelectorAll("[data-tool-card]")];
    const groups = [...document.querySelectorAll("[data-tool-group]")];
    const empty = document.getElementById("toolFilterEmpty");

    filter.addEventListener("input", () => {

      const query = filter.value.toLowerCase().trim();

      let shown = 0;

      for (const card of cards) {

        const match = !query || card.dataset.toolCard.includes(query);

        card.hidden = !match;

        if (match) shown++;
      }

      for (const group of groups) {
        group.hidden = !group.querySelector("[data-tool-card]:not([hidden])");
      }

      if (empty) empty.hidden = shown > 0;
    });
  }
});
