/* GLOBAL AUTO DIRECT — core: data layer, money, tax engine, auth, shell */
(function () {
  const KEY = "gad.v1";
  const GAD = (window.GAD = {});

  /* ---------- storage ----------
     With Supabase configured every read comes from Postgres and every write is
     pushed back. Without it the app runs on bundled demonstration data. */
  const SB = window.GAD.sb || null;
  const LIVE = !!(SB && SB.on);
  let liveDb = null, bootError = null;
  if (LIVE) {
    try { liveDb = SB.loadSync(); } catch (e) { bootError = String((e && e.message) || e); }
  }

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function write(d) { if (!LIVE) localStorage.setItem(KEY, JSON.stringify(d)); }
  function db() {
    if (LIVE && liveDb) return liveDb;
    let d = read();
    if (!d) { d = window.GAD_SEED(); write(d); }
    return d;
  }
  function save(mutator) {
    const d = db();
    const before = LIVE ? JSON.stringify(d) : null;
    mutator(d);
    write(d);
    if (LIVE && liveDb) pushChanges(before, d);
    return d;
  }

  const PUSH_TABLES = ["vehicles", "suppliers", "requests", "orders", "quotations", "payments", "notifications", "tickets", "audits", "taxRules", "countries"];
  let pushQueue = Promise.resolve();
  function pushChanges(beforeJson, after) {
    if (!SB || !SB.rest || !SB.map) return;
    const before = JSON.parse(beforeJson);
    const rows = [];
    for (const key of PUSH_TABLES) {
      const spec = SB.map[key];
      if (!spec) continue;
      const now = key === "countries" ? Object.values(after.countries || {}) : (after[key] || []);
      const was = key === "countries" ? Object.values(before.countries || {}) : (before[key] || []);
      for (const row of now) {
        const id = row.id || row.code;
        const old = (was || []).find((r) => (r.id || r.code) === id);
        if (!old || JSON.stringify(old) !== JSON.stringify(row)) {
          try { rows.push([spec, spec.to(row)]); } catch (e) { /* skipped */ }
        }
      }
    }
    if (!rows.length) return;
    pushQueue = pushQueue.then(async () => {
      for (const pair of rows) {
        const spec = pair[0], body = pair[1];
        let q = "";
        if (spec.table === "vehicles" || spec.table === "suppliers") q = "?on_conflict=legacy_id";
        else if (spec.table === "countries") q = "?on_conflict=code";
        else if (spec.table === "tax_rules") q = "?on_conflict=id";
        else if (spec.table === "requests" || spec.table === "orders" || spec.table === "quotations") q = "?on_conflict=code";
        await SB.rest(spec.table + q, { method: "POST", body, headers: { Prefer: "resolution=merge-duplicates" } })
          .catch((e) => { GAD.lastSyncError = String(e.message).slice(0, 200); });
      }
    });
  }
  GAD.db = db; GAD.save = save;
  GAD.live = LIVE;
  GAD.bootError = bootError;
  GAD.reset = function () { localStorage.removeItem(KEY); location.reload(); };

  GAD.uid = (p) => (p || "id") + "_" + Math.random().toString(36).slice(2, 9);
  GAD.now = () => new Date().toISOString();
  GAD.when = (iso) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  /* ---------- money ---------- */
  const CUR = { USD: { s: "$", d: 2 }, UGX: { s: "UGX ", d: 0 }, EUR: { s: "€", d: 0 }, GBP: { s: "£", d: 0 }, JPY: { s: "¥", d: 0 }, AED: { s: "AED ", d: 0 }, CNY: { s: "CNY ", d: 0 }, KRW: { s: "₩", d: 0 } };
  GAD.money = function (amountUsd, currency) {
    const d = db(); const rate = (d.currencies[currency] || d.currencies.USD).rate;
    const v = amountUsd * rate;
    const meta = CUR[currency] || { s: currency + " ", d: 0 };
    return meta.s + v.toLocaleString("en-US", { minimumFractionDigits: meta.d, maximumFractionDigits: meta.d });
  };
  GAD.convert = function (amountUsd, currency) { const d = db(); return amountUsd * ((d.currencies[currency] || d.currencies.USD).rate); };
  GAD.num = (n) => Number(n || 0).toLocaleString("en-US");

  /* ---------- auth ---------- */
  async function hash(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text + "::gad"));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  GAD.hash = hash;
  GAD.currentUser = function () {
    if (LIVE) {
      try {
        const p = JSON.parse(localStorage.getItem("gad.sb.profile") || "null");
        if (p) return p;
      } catch (e) { /* fall through */ }
      return null;
    }
    const id = localStorage.getItem("gad.session");
    if (!id) return null;
    return db().users.find((u) => u.id === id) || null;
  };
  GAD.login = async function (email, password) {
    if (LIVE && SB && SB.signIn) {
      const r = await SB.signIn(email, password);
      if (!r.ok) return r;
      localStorage.setItem("gad.sb.profile", JSON.stringify(r.user));
      localStorage.setItem("gad.session", r.user.id);
      return { ok: true, user: r.user };
    }
    const u = db().users.find((x) => x.email.toLowerCase() === String(email).toLowerCase().trim());
    if (!u) return { ok: false, error: "No account with that email." };
    if (u.passwordHash !== await hash(password)) return { ok: false, error: "That password is not correct." };
    if (u.status === "suspended") return { ok: false, error: "This account is suspended." };
    localStorage.setItem("gad.session", u.id);
    audit(u.id, "Signed in", "session", u.id);
    return { ok: true, user: u };
  };
  GAD.register = async function (data) {
    if (LIVE && SB && SB.signUp) {
      const r = await SB.signUp(data);
      if (!r.ok) return r;
      return { ok: true, needsConfirm: !!r.needsConfirm, user: { id: (r.user && r.user.id) || "", name: data.name, email: data.email, role: data.role || "customer", currency: data.currency || "UGX" } };
    }
    const exists = db().users.some((x) => x.email.toLowerCase() === data.email.toLowerCase().trim());
    if (exists) return { ok: false, error: "An account with that email already exists." };
    const user = {
      id: GAD.uid("usr"), name: data.name.trim(), email: data.email.trim().toLowerCase(),
      phone: data.phone || "", role: data.role || "customer", status: "active",
      passwordHash: await hash(data.password), created_at: GAD.now(),
      country: data.country || "UG", currency: data.currency || "UGX", supplierId: data.supplierId || null,
    };
    save((d) => d.users.push(user));
    localStorage.setItem("gad.session", user.id);
    audit(user.id, "Created account", "user", user.id);
    return { ok: true, user };
  };
  GAD.logout = function () {
    localStorage.removeItem("gad.session");
    localStorage.removeItem("gad.sb.profile");
    if (LIVE && SB && SB.signOut) return SB.signOut();
    location.href = "index.html";
  };
  GAD.guard = function (roles) {
    const u = GAD.currentUser();
    if (!u) { location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search); return null; }
    if (roles && roles.length && !roles.includes(u.role)) { document.body.innerHTML = '<div style="padding:60px;text-align:center;font-family:system-ui"><h2>Not your area</h2><p style="color:#93A3BF">This dashboard is for: ' + roles.join(", ") + '</p><a href="index.html" style="color:#2E7DFF">Back to the website</a></div>'; return null; }
    return u;
  };
  GAD.requireLogin = function () {
    const u = GAD.currentUser();
    if (!u) { location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search); return null; }
    return u;
  };

  /* ---------- audit ---------- */
  function audit(actorId, action, entity, entityId) {
    save((d) => d.audits.unshift({ id: GAD.uid("aud"), actor: actorId, action, entity, entityId, at: GAD.now() }));
  }
  GAD.audit = audit;

  /* ---------- countries ---------- */
  GAD.origins = () => db().origins;
  GAD.destinations = () => db().countries;
  GAD.country = (code) => db().countries.find((c) => c.code === code) || db().countries[0];
  GAD.origin = (code) => db().origins.find((c) => c.code === code) || db().origins[0];

  /* ---------- the import calculator / quotation engine ---------- */
  /* Country-specific rules live in the database (admin editable) — never one global %  */
  GAD.quote = function (input) {
    const d = db();
    const v = d.vehicles.find((x) => x.id === input.vehicleId) || null;
    const dest = d.countries.find((c) => c.code === input.destCode) || d.countries[0];
    const originCode = input.originCode || (v && v.origin) || "JP";
    const origin = d.origins.find((c) => c.code === originCode) || d.origins[0];
    const rule = (d.taxRules.find((r) => r.country === dest.code && r.origin === originCode) || d.taxRules.find((r) => r.country === dest.code) || null);
    const freightUsd = input.shipping === "air" ? origin.air : origin.sea;
    const inspectionPct = origin.inspectionPct || 0.02;
    const price = Number(input.price || (v && v.priceUsd) || 0);
    const engineCc = Number(input.engineCc || (v && v.engineCc) || 1500);
    const amount = Number(input.vehiclePrice || 0);

    const lines = [];
    const add = (label, usd, note) => lines.push({ label, usd: Math.round(usd * 100) / 100, note: note || "" });

    add("Vehicle purchase price", amount || 100, "Supplier invoice price");
    add("Supplier and inspection fee", (amount || 100) * inspectionPct, "Third-party inspection");
    add("Export documentation", origin.docs, "Export certificate, invoice, bill of lading prep");
    add("Inland transport to port", origin.inland, "Moved from supplier to export port");
    add("Ocean or air freight", freightUsd, input.shipping === "air" ? "Air freight to " + dest.port : "Sea freight to " + dest.port);
    add("Marine insurance", (amount || 100) * 0.015, "1.5% of vehicle value");
    const cif = lines.reduce((s, l) => s + l.usd, 0);
    const duty = rule ? cif * (rule.dutyPct / 100) : 0;
    const excisePct = rule
      ? (rule.exciseTiers && rule.exciseTiers.length
          ? (rule.exciseTiers.find((t) => engineCc <= t.maxCc) || rule.exciseTiers[rule.exciseTiers.length - 1]).pct
          : (rule.excisePct || 0))
      : 0;
    const excise = cif * (excisePct / 100);
    const vat = (cif + duty + excise) * (rule ? rule.vatPct / 100 : 0);
    add("Estimated customs duty", duty, rule ? rule.dutyPct + "% of CIF value" : "No rule configured");
    add("Estimated excise duty", excise, excisePct + "% by engine size");
    add("Estimated VAT", vat, rule ? rule.vatPct + "% on CIF + duties" : "No rule configured");
    add("Port handling", dest.portHandling, dest.port + " terminal charges");
    add("Customs clearance", dest.clearance, "Licensed clearing agent");
    add("Local delivery", dest.localDelivery, "To " + (input.deliveryCity || dest.capital));
    add("Platform service fee", (amount || 100) * 0.03, "GLOBAL AUTO DIRECT coordination fee");

    const total = lines.reduce((s, l) => s + l.usd, 0);
    return {
      vehicle: v, origin, dest, rule, lines, totalUsd: total, cif,
      engineCc, shipping: input.shipping || "sea",
      eta: (input.shipping === "air" ? origin.airDays : origin.seaDays) + " days",
      currency: input.currency || "UGX",
      ageWarning: v && rule && rule.maxAgeYears && (new Date().getFullYear() - v.year) > rule.maxAgeYears
        ? "This vehicle is " + (new Date().getFullYear() - v.year) + " years old. " + dest.name + " restricts imports to vehicles under " + rule.maxAgeYears + " years. A licensed clearing agent must confirm eligibility."
        : "",
      ruleNote: rule ? rule.note : "No tax rule is configured for this route yet. An administrator must add one before a quotation can be issued.",
    };
  };

  /* ---------- order stages ---------- */
  GAD.STAGES = ["Enquiry received", "Availability confirmed", "Supplier verified", "Quotation prepared", "Customer approval", "Deposit received", "Vehicle purchased", "Inspection completed", "Export documents ready", "Shipment booked", "Vessel departed", "In transit", "Arrived at destination port", "Customs clearance", "Local delivery", "Completed"];
  GAD.stageIndex = (name) => Math.max(0, GAD.STAGES.indexOf(name));

  /* ---------- shell: header, footer, toast ---------- */
  const NAV = [
    ["index.html", "Home"], ["vehicles.html", "Inventory"], ["calculator.html", "Import calculator"],
    ["import-request.html", "Custom import"], ["guides.html", "Guides"], ["track.html", "Track"],
  ];
  function shell(active) {
    const u = GAD.currentUser();
    const dash = !u ? "" : u.role === "customer" ? "account.html" : u.role === "supplier" ? "supplier.html" : "admin.html";
    return `<header class="site"><div class="wrap bar">
      <a class="logo" href="index.html"><span class="mark">G</span><span>GLOBAL AUTO DIRECT<small>BUY ANYWHERE. DELIVERED WORLDWIDE.</small></span></a>
      <button class="burger" aria-label="Menu" onclick="document.querySelector('nav.main').classList.toggle('open')">☰</button>
      <nav class="main">${NAV.map(([h, t]) => `<a href="${h}" class="${h === active ? "on" : ""}">${t}</a>`).join("")}
        <a href="connect.html" class="chip ${LIVE ? "ok" : "warn"}" title="${LIVE ? "Reading and writing your Postgres database" : "Running on bundled demonstration data"}">${LIVE ? "● Live data" : "● Demo data"}</a>
        ${u ? `<a href="${dash}" class="btn ghost sm">${u.role === "customer" ? "My account" : "Dashboard"}</a>` : `<a href="login.html" class="btn ghost sm">Sign in</a>`}
        <a href="vehicles.html" class="btn primary sm">Search vehicles</a>
      </nav>
    </div></header>`;
  }
  function footer() {
    return `<footer class="site"><div class="wrap">
      <div class="fg">
        <div>
          <a class="logo" href="index.html"><span class="mark">G</span><span>GLOBAL AUTO DIRECT<small>BUY ANYWHERE. DELIVERED WORLDWIDE.</small></span></a>
          <p class="small" style="margin-top:14px;max-width:330px">An international vehicle marketplace and import coordination platform. We connect buyers with verified suppliers in Japan, China, Germany, South Korea, the UAE and the USA, and coordinate inspection, shipping, clearance and delivery.</p>
        </div>
        <div><h4>Shop</h4><a href="vehicles.html?category=cars">Cars</a><a href="vehicles.html?category=suvs">SUVs</a><a href="vehicles.html?category=pickups">Pickup trucks</a><a href="vehicles.html?category=motorcycles">Motorcycles</a><a href="vehicles.html?category=zongshen">Zongshen</a><a href="vehicles.html?category=electric-cars">Electric cars</a><a href="vehicles.html?category=spare-parts">Spare parts</a></div>
        <div><h4>Import from</h4><a href="vehicles.html?origin=JP">Japan</a><a href="vehicles.html?origin=CN">China</a><a href="vehicles.html?origin=DE">Germany</a><a href="vehicles.html?origin=KR">South Korea</a><a href="vehicles.html?origin=AE">United Arab Emirates</a><a href="vehicles.html?origin=US">United States</a></div>
        <div><h4>Company</h4><a href="calculator.html">Import calculator</a><a href="import-request.html">Custom import request</a><a href="guides.html">Import guides</a><a href="track.html">Track a shipment</a><a href="suppliers-join.html">Become a supplier</a><a href="login.html">Sign in</a></div>
      </div>
      <div class="legal">
        <span>© ${new Date().getFullYear()} GLOBAL AUTO DIRECT. Demonstration platform.</span>
        <span>Prices, duties and shipping figures are estimates and require confirmation by a licensed clearing agent.</span>
      </div>
    </div></footer>
    <div class="mobile-nav">
      <a href="index.html"><b>⌂</b>Home</a>
      <a href="vehicles.html"><b>❏</b>Inventory</a>
      <a href="calculator.html"><b>∑</b>Calculate</a>
      <a href="import-request.html"><b>✎</b>Request</a>
      <a href="account.html"><b>◍</b>Account</a>
    </div>`;
  }
  GAD.mount = function (active) {
    const h = document.getElementById("site-header"); if (h) h.innerHTML = shell(active);
    const f = document.getElementById("site-footer"); if (f) f.innerHTML = footer();
  };
  GAD.toast = function (msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 3600);
  };
  GAD.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  GAD.qs = (k) => new URLSearchParams(location.search).get(k);
  GAD.CATEGORIES = [
    ["cars", "Cars", "🚗", "Sedans and hatchbacks"], ["suvs", "SUVs & crossovers", "🚙", "Family and 4x4"],
    ["pickups", "Pickup trucks", "🛻", "Work and double cab"], ["commercial", "Commercial vehicles", "🚐", "Vans and lorries"],
    ["buses", "Buses & minibuses", "🚌", "22 to 65 seats"], ["motorcycles", "Motorcycles", "🏍", "Street and off-road"],
    ["zongshen", "Zongshen motorcycles", "🏍", "Authorised line"], ["electric-cars", "Electric cars", "⚡", "Zero emission"],
    ["electric-motorcycles", "Electric motorcycles", "🛵", "Battery powered"], ["heavy-machinery", "Heavy machinery", "🚜", "Loaders and excavators"],
    ["spare-parts", "Spare parts & accessories", "⚙", "Genuine parts"],
  ];
})();
