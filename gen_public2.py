# -*- coding: utf-8 -*-
exec(open("gen_public.py").read().split("# ─────────────────────────────── HOME")[0])

# ───────────────────────── INVENTORY (search + filters) ─────────────────
veh_body = '''
<section class="block" style="padding-top:34px"><div class="wrap">
  <span class="eyebrow">Inventory</span>
  <h1 style="font-size:clamp(1.9rem,4vw,2.9rem)">Find your vehicle</h1>
  <p style="max-width:70ch">Filter by category, origin country, brand, fuel and price. Every listing is demonstration data until supplier onboarding is complete.</p>
  <div id="filterroot"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 16px;flex-wrap:wrap;gap:10px">
    <div class="small" id="count"></div>
    <div class="small">Showing prices in <b id="curlabel"></b> · <a href="#" id="curtoggle" style="color:#5AA0FF">change</a></div>
  </div>
  <div class="grid g4" id="results"></div>
</div></section>
'''
veh_js = r'''
(function () {
  const G = window.GAD;
  G.mount("vehicles.html");
  const root = document.getElementById("filterroot");
  const results = document.getElementById("results");
  const count = document.getElementById("count");
  document.getElementById("curlabel").textContent = G.cur();
  document.getElementById("curtoggle").onclick = (e) => {
    e.preventDefault();
    const list = Object.keys(G.db().currencies);
    const next = list[(list.indexOf(G.cur()) + 1) % list.length];
    G.setCur(next);
  };
  const params = new URLSearchParams(location.search);
  const draw = (f) => {
    const list = G.apply(f);
    G.grid(list, results);
    count.textContent = list.length + " vehicle" + (list.length === 1 ? "" : "s") + " found";
    const p = new URLSearchParams();
    if (f.cat) p.set("category", f.cat); if (f.origin) p.set("origin", f.origin);
    if (f.q) p.set("q", f.q); if (f.sort !== "new") p.set("sort", f.sort);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
  };
  const read = G.filterForm(root, draw);
  if (params.get("category")) root.querySelector("#fcat").value = params.get("category");
  if (params.get("origin")) root.querySelector("#forigin").value = params.get("origin");
  if (params.get("q")) root.querySelector("#fq").value = params.get("q");
  if (params.get("sort")) root.querySelector("#fsort").value = params.get("sort");
  let f = read();
  if (params.get("featured")) { const all = G.apply(f); G.grid(all.filter(v => v.featured).concat(all.filter(v => !v.featured)), results); count.textContent = all.length + " vehicles found"; }
  else draw(f);
})();
'''
write("vehicles.html", "Vehicle inventory — GLOBAL AUTO DIRECT",
      "Browse import-ready cars, SUVs, pickups, buses, motorcycles, electric vehicles, machinery and spare parts with advanced filters.",
      veh_body, veh_js)

# ───────────────────────── VEHICLE DETAIL ─────────────────
detail_body = '''
<section class="block" style="padding-top:30px"><div class="wrap" id="detail"><p class="muted">Loading vehicle…</p></div></section>
<section class="block" style="border-bottom:0"><div class="wrap">
  <div class="sec-head"><div><h2>Similar vehicles</h2><p>Other listings in this category.</p></div></div>
  <div class="grid g4" id="similar"></div>
</div></section>
'''
detail_js = r'''
(function () {
  const G = window.GAD;
  G.mount("vehicles.html");
  const id = G.qs("id");
  const d = G.db();
  const v = d.vehicles.find(x => x.id === id);
  const el = document.getElementById("detail");
  if (!v) { el.innerHTML = '<h2>Vehicle not found</h2><p>That listing may have been removed.</p><a class="btn primary" href="vehicles.html">Back to inventory</a>'; return; }
  const o = G.origin(v.origin), sup = d.suppliers.find(s => s.id === v.supplierId);
  document.title = v.title + " — GLOBAL AUTO DIRECT";
  const q = G.quote({ vehicleId: v.id, vehiclePrice: v.priceUsd, engineCc: v.engineCc, destCode: "UG", originCode: v.origin, currency: G.cur(), shipping: "sea" });
  el.innerHTML = `
    <div class="small" style="margin-bottom:12px"><a href="vehicles.html" style="color:#5AA0FF">Inventory</a> / <a href="vehicles.html?category=${v.category}" style="color:#5AA0FF">${(G.CATEGORIES.find(c=>c[0]===v.category)||[,v.category])[1]}</a> / ${G.esc(v.title)}</div>
    <div class="calc">
      <div>
        <div class="card" style="padding:0;overflow:hidden">
          <img src="${v.art}" alt="${G.esc(v.title)}" style="width:100%;aspect-ratio:16/10;object-fit:cover">
          <div style="padding:14px;display:flex;gap:8px;flex-wrap:wrap"><span class="chip demo">Demonstration listing</span><span class="chip">${o.flag} ${o.name}</span><span class="chip ${v.condition === "New" ? "ok" : ""}">${G.esc(v.condition)}</span>${v.videoInspection ? '<span class="chip">Video inspection available</span>' : ''}</div>
        </div>
        <div class="card"><h3 style="margin-top:0">Vehicle specifications</h3><div class="table-wrap"><table><tbody>${G.specs(v)}</tbody></table></div></div>
        <div class="card"><h3 style="margin-top:0">Supplier</h3>
          <p class="small" style="margin:0"><b>${sup ? sup.name : "—"}</b> · ${sup ? G.origin(sup.country).name : ""} · rating ${sup ? sup.rating : "—"}</p>
          <p class="small" style="margin:6px 0 0">Verification status: <span class="chip ${sup && sup.status === "verified" ? "ok" : "warn"}">${sup ? sup.status : "unknown"}</span></p>
          <p class="small" style="margin:8px 0 0">Documents on file: ${sup ? sup.docs.join(", ") : "—"}</p>
        </div>
      </div>
      <div>
        <div class="card">
          <span class="eyebrow">Vehicle price</span>
          <h2 style="margin:0 0 4px">${G.price(v.priceUsd)}</h2>
          <p class="small" style="margin:0 0 12px">FOB ${o.name} · shipping estimate ${G.price(v.shipEstimateUsd)} · ${v.deliveryDays} days door to door</p>
          <div class="breakdown"><li style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed rgba(255,255,255,.1)"><span class="muted">Estimated landed cost to Uganda</span><b>${G.price(q.totalUsd)}</b></div></div>
          <p class="small" style="margin:8px 0 14px">Includes freight, insurance, duties, clearance and delivery. Estimates only — a licensed clearing agent confirms final figures.</p>
          <a class="btn primary block" href="calculator.html?vehicle=${v.id}">Calculate exact landed cost</a>
          <a class="btn ghost block" style="margin-top:10px" href="import-request.html?vehicle=${v.id}">Request a quotation</a>
          <button class="btn ghost block" style="margin-top:10px" id="save">Save this vehicle</button>
          <button class="btn ghost block" style="margin-top:10px" id="wa">Ask on WhatsApp</button>
        </div>
        <div class="card"><h3 style="margin-top:0">Import notes for ${G.country("UG").flag} Uganda</h3>
          <p class="small">${G.country("UG").regs}</p>
          <p class="small" style="margin:0">Estimated delivery ${v.deliveryDays} days · destination eligibility: ${v.destinations.map(c => (G.country(c) || {}).name).filter(Boolean).join(", ")}</p>
        </div>
        <div class="notice">VVIN and chassis numbers are released only to verified buyers at quotation stage. This listing is demonstration data, not confirmed supplier stock.</div>
      </div>
    </div>`;
  document.getElementById("similar").innerHTML = d.vehicles.filter(x => x.category === v.category && x.id !== v.id).slice(0, 4).map(G.card).join("");
  document.getElementById("save").onclick = () => {
    const u = G.currentUser();
    if (!u) { location.href = "login.html?next=" + encodeURIComponent("vehicle.html?id=" + v.id); return; }
    G.save(db => { db.saved = db.saved || []; if (!db.saved.some(s => s.userId === u.id && s.vehicleId === v.id)) db.saved.push({ userId: u.id, vehicleId: v.id, at: G.now() }); });
    G.toast("Saved to your account.");
  };
  document.getElementById("wa").onclick = () => {
    const txt = encodeURIComponent("Hello GLOBAL AUTO DIRECT, I am interested in " + v.title + " (" + v.id + ").");
    window.open("https://wa.me/256700000001?text=" + txt, "_blank");
  };
})();
'''
write("vehicle.html", "Vehicle details — GLOBAL AUTO DIRECT",
      "Full specifications, supplier verification, shipping estimate and landed cost for this import-ready vehicle.",
      detail_body, detail_js)

# ───────────────────────── CALCULATOR ─────────────────
calc_body = '''
<section class="block" style="padding-top:34px"><div class="wrap">
  <span class="eyebrow">Import calculator</span>
  <h1 style="font-size:clamp(1.9rem,4vw,2.9rem)">Know the full landed cost before you commit</h1>
  <p style="max-width:74ch">Thirteen cost lines, calculated from the destination country's own duty, excise and VAT rules. Choose a vehicle or enter your own price.</p>
  <div class="notice">These are estimates. Import duties change and vehicles must meet age and drive-side rules. A licensed clearing agent in your destination country must confirm the final figures before we issue a binding quotation.</div>
  <div class="calc">
    <div class="card">
      <div class="form-grid">
        <div><label class="f">Vehicle</label><select id="cvehicle"></select></div>
        <div><label class="f">Origin country</label><select id="corigin"></select></div>
        <div><label class="f">Destination country</label><select id="cdest"></select></div>
        <div><label class="f">Destination port or city</label><input id="ccity" placeholder="Kampala"></div>
        <div><label class="f">Shipping method</label><select id="cship"><option value="sea">Sea freight (cheaper)</option><option value="air">Air freight (faster)</option></select></div>
        <div><label class="f">Delivery preference</label><select id="cdel"><option>To my city</option><option>Collect at port</option><option>Deliver to a garage</option></select></div>
        <div><label class="f">Vehicle price (USD)</label><input id="cprice" type="number" min="0" step="100"></div>
        <div><label class="f">Engine size (cc)</label><input id="ccc" type="number" min="0" step="100"></div>
        <div><label class="f">Currency</label><select id="ccur"></select></div>
      </div>
    </div>
    <div>
      <div class="card">
        <h3 style="margin-top:0">Cost breakdown</h3>
        <ul class="breakdown" id="lines"></ul>
        <div id="warn"></div>
        <button class="btn primary block" id="cgo" style="margin-top:14px">Use these figures in a quotation request</button>
      </div>
      <div class="card"><h3 style="margin-top:0">Rule in force</h3><div class="small" id="rulenote"></div></div>
    </div>
  </div>
</div></section>
'''
calc_js = r'''
(function () {
  const G = window.GAD;
  G.mount("calculator.html");
  const d = G.db();
  const veh = document.getElementById("cvehicle");
  veh.innerHTML = `<option value="">Enter my own vehicle price</option>` + d.vehicles.map(v => `<option value="${v.id}">${G.esc(v.title)} — ${G.price(v.priceUsd)}</option>`).join("");
  document.getElementById("corigin").innerHTML = d.origins.map(o => `<option value="${o.code}">${o.flag} ${o.name}</option>`).join("");
  document.getElementById("cdest").innerHTML = d.countries.map(c => `<option value="${c.code}">${c.flag} ${c.name}${c.verified ? "" : " (rates unverified)"}</option>`).join("");
  document.getElementById("ccur").innerHTML = Object.keys(d.currencies).map(c => `<option>${c}</option>`).join("");
  document.getElementById("ccur").value = G.cur();

  const setFromVehicle = () => {
    const v = d.vehicles.find(x => x.id === veh.value);
    if (!v) return;
    document.getElementById("cprice").value = v.priceUsd;
    document.getElementById("ccc").value = v.engineCc;
    document.getElementById("corigin").value = v.origin;
  };
  if (G.qs("vehicle")) { veh.value = G.qs("vehicle"); setFromVehicle(); }
  else { veh.value = d.vehicles[0].id; setFromVehicle(); }

  const run = () => {
    const v = d.vehicles.find(x => x.id === veh.value) || null;
    const input = {
      vehicleId: veh.value, vehiclePrice: Number(document.getElementById("cprice").value || 0),
      engineCc: Number(document.getElementById("ccc").value || 1500),
      originCode: document.getElementById("corigin").value, destCode: document.getElementById("cdest").value,
      deliveryCity: document.getElementById("ccity").value || "", shipping: document.getElementById("cship").value,
      currency: document.getElementById("ccur").value,
    };
    const q = G.quote(input);
    const cur = input.currency;
    document.getElementById("lines").innerHTML = q.lines.map(l =>
      `<li><span>${l.label}<div class="small" style="color:#5A708F">${l.note}</div></span><span>${G.money(l.usd, cur)}</span></li>`).join("")
      + `<li class="total"><span>Estimated landed cost</span><span>${G.money(q.totalUsd, cur)}</span></li>`;
    document.getElementById("warn").innerHTML = (q.ageWarning ? `<div class="notice">${q.ageWarning}</div>` : "")
      + (q.rule && q.rule.verified === false ? `<div class="notice">${G.country(q.dest.code).name} rates are unverified in this system. Treat them as a guide only.</div>` : "")
      + `<p class="small" style="margin:10px 0 0">Estimated transit: ${q.eta}. Duty and excise are calculated on the CIF value; VAT is applied on CIF plus duties.</p>`;
    document.getElementById("rulenote").textContent = q.ruleNote;
    document.getElementById("cgo").onclick = () => {
      const p = new URLSearchParams({ vehicle: veh.value || "", origin: input.originCode, dest: input.destCode, price: input.vehiclePrice, cc: input.engineCc, shipping: input.shipping, cur });
      location.href = "import-request.html?" + p.toString();
    };
  };
  veh.onchange = () => { setFromVehicle(); run(); };
  ["corigin", "cdest", "cship", "ccur", "cprice", "ccc", "ccity", "cdel"].forEach(id => { const e = document.getElementById(id); e.oninput = run; e.onchange = run; });
  run();
})();
'''
write("calculator.html", "Import calculator — GLOBAL AUTO DIRECT",
      "Calculate the full landed cost: vehicle price, fees, freight, insurance, customs duty, excise, VAT, clearance and delivery by destination country.",
      calc_body, calc_js)

# ───────────────────────── IMPORT REQUEST ─────────────────
req_body = '''
<section class="block" style="padding-top:34px"><div class="wrap" style="max-width:900px">
  <span class="eyebrow">Custom import</span>
  <h1 style="font-size:clamp(1.8rem,3.6vw,2.6rem)">Request any vehicle, from anywhere</h1>
  <p>Tell us what you want and where it should land. We check availability with verified suppliers, arrange an inspection, and send you a full landed-cost quotation.</p>
  <div id="reqform">
    <form id="rf" class="card">
      <div class="form-grid">
        <div><label class="f">Full name *</label><input id="rname" required></div>
        <div><label class="f">Email *</label><input id="remail" type="email" required></div>
        <div><label class="f">Phone *</label><input id="rphone" required placeholder="+256..."></div>
        <div><label class="f">Destination country *</label><select id="rdest"></select></div>
        <div><label class="f">Preferred origin</label><select id="rorigin"></select></div>
        <div><label class="f">Brand</label><input id="rbrand" placeholder="Toyota"></div>
        <div><label class="f">Model</label><input id="rmodel" placeholder="Prado TX-L"></div>
        <div><label class="f">Year</label><input id="ryear" type="number" min="1980" max="2027" placeholder="2020"></div>
        <div><label class="f">New or used</label><select id="rcond"><option>Used</option><option>New</option><option>Either</option></select></div>
        <div><label class="f">Maximum budget (USD)</label><input id="rbudget" type="number" min="0" step="500"></div>
        <div><label class="f">Preferred condition</label><select id="rpref"><option>Excellent</option><option>Very good</option><option>Good</option><option>Any clean unit</option></select></div>
        <div><label class="f">Reference photographs</label><input id="rfiles" type="file" accept="image/*" multiple></div>
      </div>
      <div class="field"><label class="f">Additional requirements</label><textarea id="rnotes" rows="3" placeholder="Colour, trim, sunroof, mileage limit, delivery timing..."></textarea></div>
      <p class="small">By sending this request you agree that we may contact you about it. We do not share your details with suppliers until you approve a quotation.</p>
      <button class="btn primary" type="submit">Send my import request</button>
    </form>
  </div>
  <div id="reqdone" class="hide"></div>
</div></section>
'''
req_js = r'''
(function () {
  const G = window.GAD;
  G.mount("import-request.html");
  const d = G.db();
  const u = G.currentUser();
  document.getElementById("rdest").innerHTML = d.countries.map(c => `<option value="${c.code}">${c.flag} ${c.name}</option>`).join("");
  document.getElementById("rorigin").innerHTML = `<option value="">Any origin</option>` + d.origins.map(o => `<option value="${o.code}">${o.flag} ${o.name}</option>`).join("");
  if (u) { document.getElementById("rname").value = u.name; document.getElementById("remail").value = u.email; document.getElementById("rphone").value = u.phone || ""; document.getElementById("rdest").value = u.country || "UG"; }
  const p = new URLSearchParams(location.search);
  if (p.get("origin")) document.getElementById("rorigin").value = p.get("origin");
  if (p.get("dest")) document.getElementById("rdest").value = p.get("dest");
  if (p.get("price")) document.getElementById("rbudget").value = Math.round(Number(p.get("price")) * 1.6);
  if (p.get("vehicle")) {
    const v = d.vehicles.find(x => x.id === p.get("vehicle"));
    if (v) { document.getElementById("rbrand").value = v.brand; document.getElementById("rmodel").value = v.model; document.getElementById("ryear").value = v.year; document.getElementById("rnotes").value = "Interested in listing " + v.id + " (" + v.title + ")."; }
  }
  document.getElementById("rf").onsubmit = async (e) => {
    e.preventDefault();
    const fileEl = document.getElementById("rfiles");
    const files = [...(fileEl.files || [])].slice(0, 4).map(f => ({ name: f.name, size: Math.round(f.size / 1024) + " KB" }));
    const req = {
      id: G.uid("req"), code: "GAD-REQ-" + Math.floor(1000 + Math.random() * 9000),
      userId: u ? u.id : null,
      name: document.getElementById("rname").value.trim(), email: document.getElementById("remail").value.trim(),
      phone: document.getElementById("rphone").value.trim(), destCountry: document.getElementById("rdest").value,
      origin: document.getElementById("rorigin").value || "any", brand: document.getElementById("rbrand").value.trim(),
      model: document.getElementById("rmodel").value.trim(), year: document.getElementById("ryear").value,
      condition: document.getElementById("rcond").value, budgetUsd: Number(document.getElementById("rbudget").value || 0),
      preferred: document.getElementById("rpref").value, notes: document.getElementById("rnotes").value.trim(),
      files, status: "new", createdAt: G.now(),
    };
    if (!req.name || !req.email || !req.phone) { G.toast("Please fill your name, email and phone."); return; }
    G.save(db => { db.requests.unshift(req); });
    G.audit(u ? u.id : null, "Submitted import request " + req.code, "request", req.id);
    document.getElementById("reqform").classList.add("hide");
    const done = document.getElementById("reqdone");
    done.classList.remove("hide");
    done.innerHTML = `<div class="card" style="text-align:center">
      <div style="font-size:2.4rem">✅</div>
      <h2>Request received</h2>
      <p>Your import request ID is <b style="color:#fff">${req.code}</b>. Keep it for reference.</p>
      <p class="small">Our team has been notified. A sales manager reviews new requests, confirms supplier availability and sends a landed-cost quotation, usually within 2 working days.</p>
      <div class="table-wrap" style="text-align:left;margin:18px 0"><table><tbody>
        <tr><th>Vehicle</th><td>${G.esc(req.brand)} ${G.esc(req.model)} ${G.esc(req.year)}</td></tr>
        <tr><th>Route</th><td>${req.origin === "any" ? "Any origin" : G.origin(req.origin).name} → ${G.country(req.destCountry).name}</td></tr>
        <tr><th>Budget</th><td>${req.budgetUsd ? G.price(req.budgetUsd) : "Not specified"}</td></tr>
        <tr><th>Status</th><td><span class="chip warn">Awaiting review</span></td></tr>
      </tbody></table></div>
      <a class="btn primary" href="account.html">Track it in my account</a>
      <a class="btn ghost" href="vehicles.html" style="margin-left:8px">Keep browsing</a>
    </div>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
})();
'''
write("import-request.html", "Custom vehicle import request — GLOBAL AUTO DIRECT",
      "Request any vehicle from Japan, China, Germany, Korea, the UAE or the USA. We confirm availability, arrange inspection and send a full landed-cost quotation.",
      req_body, req_js)
