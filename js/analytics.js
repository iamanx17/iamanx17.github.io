/*
============================================================
Analytics — Google Analytics 4

Set MEASUREMENT_ID to your own "G-XXXXXXXXXX" property to turn
tracking on. While it is empty nothing is loaded and no
requests are made, so the site stays dependency-free in
development.

Rules this file enforces:
  · never send anything the user typed into a tool
  · never send URLs, tokens or headers
  · honour Do Not Track and Global Privacy Control
  · no advertising signals or cross-site personalisation
============================================================
*/

(function () {

  const MEASUREMENT_ID = "";

  const optedOut =
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.globalPrivacyControl === true;

  /* track() always exists so calling code never needs a guard */
  window.track = function (name, params) {

    if (!window.gtag) return;

    window.gtag("event", name, params || {});
  };

  if (!MEASUREMENT_ID || optedOut) return;

  window.dataLayer = window.dataLayer || [];

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());

  window.gtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    /* page_view fires automatically here; page_title and page_path
       are static strings from the HTML, never user input */
    send_page_view: true
  });

  const script = document.createElement("script");

  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;

  document.head.appendChild(script);
})();
