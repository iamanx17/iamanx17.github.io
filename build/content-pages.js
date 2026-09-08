import { SITE } from "./site.js";

/*
Written content for the non-tool pages. Kept short and honest:
curl2code is a personal project, and the legal pages say so
rather than inventing a company.
*/

export const ABOUT = `
<p>
  curl2code is a small collection of tools for people who work with HTTP APIs.
  It started as one thing — a converter that turns a cURL command into working
  code — and grew to cover the other lookups that interrupt the same work: reading
  a JWT, checking a status code, formatting a payload, generating an id.
</p>

<h2>How it works</h2>
<p>
  Every tool runs as JavaScript in your browser. There is no backend, no queue and
  no database. When you paste a command containing a bearer token, that token is
  parsed by code running on your own machine and is never sent anywhere. The one
  exception is the <a href="/tools/webhook-tester/">webhook tester</a>, which
  exists to send a request — and it sends it directly from your browser to the URL
  you type, not through this site.
</p>
<p>
  A side effect of that design is that the tools keep working with the network
  off, and that pages load in a few kilobytes. There are no frameworks, no web
  fonts and no third-party scripts.
</p>

<h2>Why it is free</h2>
<p>
  The site costs almost nothing to run, because it is static files on a CDN. It is
  free to use, has no accounts and no limits. Advertising may be added later to
  cover the domain; if it is, it will sit around the content rather than in front
  of it, and the tools will not change.
</p>

<h2>Who makes it</h2>
<p>
  curl2code is built and maintained by one developer as an independent side
  project. It is not a company, and there is no team behind it. If something is
  wrong or missing, <a href="/contact/">tell me</a> — bug reports about a command
  that converts incorrectly are the most useful kind of message, especially when
  they include the command.
</p>

<h2>What is next</h2>
<p>
  New tools are added when they solve a problem I actually hit, not to fill a
  directory. If you have one you keep searching for, it is worth suggesting.
</p>`;


export const CONTACT = `
<p>
  Email is the only channel, and it reaches the person who builds the site.
</p>

<p class="lead-contact">
  <a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>
</p>

<h2>Reporting a conversion bug</h2>
<p>
  These are the most useful reports and the fastest to fix. Please include:
</p>
<ul class="doc-list">
  <li>the cURL command or input, with any real token replaced by <code>YOUR_TOKEN</code>;</li>
  <li>the tool and target language;</li>
  <li>what the output was, and what it should have been.</li>
</ul>
<p>
  Do not send live credentials. Nothing you paste into the tools is transmitted to
  this site, but an email is a different matter.
</p>

<h2>Suggesting a tool</h2>
<p>
  Say what you are trying to do rather than naming the tool — the underlying
  problem often has a better answer than the one that comes to mind first.
</p>

<h2>Privacy and legal</h2>
<p>
  Questions about data, or a request under GDPR or CCPA, can go to the same
  address. See the <a href="/privacy/">privacy policy</a> for what is and is not
  collected.
</p>

<h2>Response time</h2>
<p>
  This is a side project, so replies take a few days. Every message is read.
</p>`;


export const PRIVACY = `
<p class="meta-line">Last updated: ${SITE.effectiveDate}</p>

<p>
  This policy explains what curl2code does with information when you use the site
  at <a href="${SITE.domain}">curl2code.xyz</a>. The short version: the tools run
  in your browser, and what you paste into them is never sent to this site.
</p>

<h2>What you paste into the tools</h2>
<p>
  Every tool is JavaScript executed by your own browser. cURL commands, JSON
  payloads, JWTs, secrets and any other input are processed locally and are
  <strong>never transmitted to curl2code, stored, or logged</strong>. There is no
  server-side component that could receive them.
</p>
<p>
  One tool makes a network request by design: the
  <a href="/tools/webhook-tester/">webhook tester</a> sends the request you
  compose directly from your browser to the URL you enter. That traffic goes to
  the destination you choose and does not pass through curl2code. Whatever you
  send is subject to the receiving service's own policies.
</p>
<p>
  Some tools remember small preferences, such as a selected language, in your
  browser's local storage. That data stays on your device and is not readable by
  this site's operator.
</p>

<h2>Hosting and server logs</h2>
<p>
  The site is served as static files by GitHub Pages. GitHub processes standard
  request data — including your IP address and user agent — in order to deliver
  the site and protect it from abuse. That processing is governed by
  <a href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement" rel="nofollow noopener">GitHub's privacy statement</a>.
  The operator of curl2code has no access to those logs.
</p>

<h2>Analytics</h2>
<p>
  The site is prepared to use Google Analytics 4 to count visits and understand
  which tools are used. When it is enabled, the events recorded are limited to
  page views and interactions — which tool was opened, that a conversion was run,
  that a copy button was pressed, and the type of any error message. <strong>The
  content of what you paste is never included in an event.</strong>
</p>
<p>
  Advertising signals and cross-site personalisation are switched off, IP
  addresses are anonymised, and the analytics script is not loaded at all if your
  browser sends a Do Not Track or Global Privacy Control signal. Google's handling
  of the data it does receive is described in
  <a href="https://policies.google.com/privacy" rel="nofollow noopener">Google's privacy policy</a>.
</p>

<h2>Cookies</h2>
<p>
  curl2code sets no cookies of its own. If analytics is enabled, Google Analytics
  sets its own first-party cookies to distinguish repeat visits; you can block
  them in your browser without affecting any tool on this site.
</p>

<h2>Advertising</h2>
<p>
  There are currently no advertisements. If advertising is introduced in future,
  this policy will be updated before it goes live to name the provider and explain
  what it collects, and this notice will be replaced.
</p>

<h2>Third parties</h2>
<p>
  Beyond the hosting provider and the optional analytics described above, the site
  loads no third-party scripts, fonts, trackers or embeds. Nothing you do here is
  shared with or sold to anyone.
</p>

<h2>Your rights</h2>
<p>
  Because no personal data is collected or stored by curl2code itself, there is
  nothing held here to access, correct or delete. For data held by the hosting
  provider or by Google Analytics, exercise your rights with them directly, or
  write to <a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a> and any
  request will be passed on.
</p>

<h2>Children</h2>
<p>
  The site is a developer utility and is not directed at children under 13. No
  personal information is knowingly collected from anyone.
</p>

<h2>Changes</h2>
<p>
  Material changes will be reflected in the date at the top of this page.
  Questions can go to <a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>.
</p>`;


export const TERMS = `
<p class="meta-line">Last updated: ${SITE.effectiveDate}</p>

<p>
  By using curl2code you agree to these terms. They are deliberately short.
</p>

<h2>The service</h2>
<p>
  curl2code provides free developer utilities that run in your browser. No account
  is required and there is no charge. The site is offered as-is and may change or
  be discontinued at any time.
</p>

<h2>Use of the tools</h2>
<p>
  You may use the tools for any lawful purpose, personal or commercial, including
  in code you ship. Output generated from your own input is yours; no attribution
  is required.
</p>
<p>
  You may not use the site to attack, overload or gain unauthorised access to any
  system. The <a href="/tools/webhook-tester/">webhook tester</a> sends requests
  to a destination you choose, and you are responsible for having permission to
  send them. Using it to flood a third-party endpoint is not permitted.
</p>

<h2>No warranty</h2>
<p>
  The tools are provided without warranty of any kind. Generated code and parsed
  output are produced automatically and may be incomplete or incorrect for inputs
  the parser does not model. <strong>Review anything you copy from this site
  before running it</strong>, particularly against production systems.
</p>

<h2>Limitation of liability</h2>
<p>
  To the extent permitted by law, the operator of curl2code is not liable for any
  loss or damage arising from use of the site or of anything generated by it,
  including data loss, service outages or security incidents.
</p>

<h2>Your data and your secrets</h2>
<p>
  The tools process input locally and do not transmit it to this site, as
  described in the <a href="/privacy/">privacy policy</a>. Even so, generated
  output can contain credentials that were present in your input. Handling that
  output — where you paste it, whether you commit it — is your responsibility.
</p>

<h2>Intellectual property</h2>
<p>
  The site's design, written content and source code belong to their author. The
  written explanations may not be republished wholesale, but you are welcome to
  link to any page, and to use generated output freely.
</p>

<h2>Third-party links</h2>
<p>
  Some pages link to external documentation. Those sites have their own terms, and
  curl2code is not responsible for their content.
</p>

<h2>Changes</h2>
<p>
  These terms may be updated; the date above records when. Continuing to use the
  site after a change means accepting it.
</p>

<h2>Contact</h2>
<p>
  <a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>
</p>`;
