/* GLOBAL AUTO DIRECT — shared UI pieces */
(function () {
  const G = window.GAD;
  G.cur = () => localStorage.getItem("gad.cur") || (G.currentUser() ? G.currentUser().currency : "UGX");
  G.setCur = (c) => { localStorage.setItem("gad.cur", c); location.reload(); };
  G.price = (usd, cur) => G.money(usd, cur || G.cur());

  G.card = function (v) {
    const o = G.origin(v.origin);
    const cat = (G.CATEGORIES.find((c) => c[0] === v.category) || [, "Vehicle"])[1];
    return `<article class="car fade">
      <a class="ph" href="vehicle.html?id=${v.id}">
        <img src="${v.art}" alt="${G.esc(v.title)}" loading="lazy">
        <div class="chips"><span class="chip demo">Demonstration listing</span>${v.condition === "New" ? '<span class="chip ok">Brand new</span>' : '<span class="chip">Used</span>'}</div>
      </a>
      <div class="body">
        <h3><a href="vehicle.html?id=${v.id}">${G.esc(v.title)}</a></h3>
        <div class="spec">
          <span><b>${v.year}</b></span>
          <span><b>${v.mileageKm ? G.num(v.mileageKm) + " km" : "0 km"}</b></span>
          <span><b>${v.engineCc ? G.num(v.engineCc) + " cc" : "—"}</b></span>
          <span><b>${G.esc(v.fuel)}</b></span>
          <span><b>${G.esc(v.transmission)}</b></span>
        </div>
        <div class="spec"><span>${o.flag} ${G.esc(o.name)}</span><span>·</span><span>${G.esc(cat)}</span></div>
        <div class="price"><span class="amt">${G.price(v.priceUsd)}</span><span class="loc">ship from ${G.price(v.shipEstimateUsd)}</span></div>
        <label class="small" style="display:flex;align-items:center;gap:7px;color:#93A3BF;cursor:pointer;margin-top:2px">
          <input type="checkbox" class="cmp" data-id="${v.id}" style="width:auto" ${G.compareIds().includes(v.id) ? "checked" : ""}> Compare
        </label>
      </div>
    </article>`;
  };

  G.grid = function (list, el) {
    el.innerHTML = list.length ? list.map(G.card).join("") : `<div class="card" style="grid-column:1/-1;text-align:center"><h3>No vehicles match those filters</h3><p>Try widening the price range or choosing another origin country.</p><a class="btn ghost sm" href="vehicles.html">Clear filters</a></div>`;
  };

  G.filterForm = function (root, onChange) {
    const origins = G.origins();
    const cats = G.CATEGORIES;
    const brands = [...new Set(G.db().vehicles.map((v) => v.brand))].sort();
    root.innerHTML = `
      <div class="filters">
        <div><label class="f">Search</label><input id="fq" placeholder="Brand, model or keyword"></div>
        <div><label class="f">Category</label><select id="fcat"><option value="">All categories</option>${cats.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></div>
        <div><label class="f">Origin country</label><select id="forigin"><option value="">Any origin</option>${origins.map((o) => `<option value="${o.code}">${o.flag} ${o.name}</option>`).join("")}</select></div>
        <div><label class="f">Brand</label><select id="fbrand"><option value="">Any brand</option>${brands.map((b) => `<option>${b}</option>`).join("")}</select></div>
        <div><label class="f">Min price (USD)</label><input id="fmin" type="number" min="0" step="500" placeholder="0"></div>
        <div><label class="f">Max price (USD)</label><input id="fmax" type="number" min="0" step="500" placeholder="Any"></div>
        <div><label class="f">New or used</label><select id="fcond"><option value="">Any condition</option><option value="new">Brand new only</option><option value="used">Used only</option></select></div>
        <div><label class="f">Fuel</label><select id="ffuel"><option value="">Any</option><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option></select></div>
        <div><label class="f">Sort by</label><select id="fsort"><option value="new">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="year">Year: newest</option></select></div>
      </div>`;
    const read = () => ({
      q: root.querySelector("#fq").value.toLowerCase().trim(),
      cat: root.querySelector("#fcat").value,
      origin: root.querySelector("#forigin").value,
      brand: root.querySelector("#fbrand").value,
      min: Number(root.querySelector("#fmin").value || 0),
      max: Number(root.querySelector("#fmax").value || Infinity),
      fuel: root.querySelector("#ffuel").value,
      cond: root.querySelector("#fcond").value,
      sort: root.querySelector("#fsort").value,
    });
    root.addEventListener("change", () => onChange(read()));
    root.addEventListener("input", () => onChange(read()));
    return read;
  };

  G.apply = function (f) {
    let list = G.db().vehicles.filter((v) => v.status === "published");
    if (f.q) list = list.filter((v) => (v.title + " " + v.brand + " " + v.model + " " + v.category).toLowerCase().includes(f.q));
    if (f.cat) list = list.filter((v) => v.category === f.cat);
    if (f.origin) list = list.filter((v) => v.origin === f.origin);
    if (f.brand) list = list.filter((v) => v.brand === f.brand);
    if (f.fuel) list = list.filter((v) => v.fuel === f.fuel);
    if (f.cond === "new") list = list.filter((v) => v.condition === "New");
    if (f.cond === "used") list = list.filter((v) => v.condition !== "New");
    list = list.filter((v) => v.priceUsd >= (f.min || 0) && v.priceUsd <= (f.max || Infinity));
    const order = { new: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0), low: (a, b) => a.priceUsd - b.priceUsd, high: (a, b) => b.priceUsd - a.priceUsd, year: (a, b) => b.year - a.year };
    return list.slice().sort(order[f.sort] || order.new);
  };

  G.specs = function (v) {
    const o = G.origin(v.origin);
    const s = G.db().suppliers.find((x) => x.id === v.supplierId);
    const rows = [
      ["Brand", v.brand], ["Model", v.model], ["Year", v.year], ["Mileage", v.mileageKm ? G.num(v.mileageKm) + " km" : "0 km (new)"],
      ["Engine", v.engineCc ? G.num(v.engineCc) + " cc" : "Electric"], ["Fuel", v.fuel], ["Transmission", v.transmission],
      ["Drivetrain", v.drivetrain], ["Exterior", v.exterior], ["Interior", v.interior], ["Condition", v.condition],
      ["VIN / chassis", "Available to verified buyers"], ["Origin", o.flag + " " + o.name], ["Supplier", s ? s.name + " (" + s.status + ")" : "—"],
      ["Export availability", v.exportAvailable ? "Available for export" : "Domestic only"],
      ["Video inspection", v.videoInspection ? "Available on request" : "Not available"],
      ["Estimated shipping", G.price(v.shipEstimateUsd)], ["Estimated delivery", v.deliveryDays + " days door to door"],
      ["Destination eligibility", v.destinations.map((c) => (G.country(c) || {}).name).filter(Boolean).join(", ") || "Ask us"],
    ];
    return rows.map(([k, val]) => `<tr><th style="width:42%;position:static">${k}</th><td>${G.esc(val)}</td></tr>`).join("");
  };

  /* tracking timeline shared by account + track pages */
  G.timeline = function (order) {
    const log = order.log || [];
    const stamp = (stage) => {
      const key = stage.toLowerCase().slice(0, 14);
      const hit = log.find((l) => String(l.text).toLowerCase().indexOf(key) === 0);
      return hit ? hit.at : null;
    };
    return `<ul class="timeline">${G.STAGES.map((s, i) => {
      const done = i < G.stageIndex(order.stage), now = i === G.stageIndex(order.stage);
      const at = done || now ? stamp(s) : null;
      return `<li class="${done ? "done" : now ? "now" : ""}"><b>${i + 1}. ${s}</b><span>${now ? "Current stage" : done ? "Completed" : "Not started"}${at ? " · " + G.when(at) : ""}</span></li>`;
    }).join("")}</ul>`;
  };

  /* comparison: keep a short list of vehicles to compare side by side */
  G.compareIds = () => { try { return JSON.parse(sessionStorage.getItem("gad.compare") || "[]"); } catch (e) { return []; } };
  G.toggleCompare = function (id) {
    let list = G.compareIds();
    if (list.includes(id)) list = list.filter((x) => x !== id);
    else { if (list.length >= 3) list.shift(); list.push(id); }
    sessionStorage.setItem("gad.compare", JSON.stringify(list));
    document.dispatchEvent(new Event("gad:compare"));
    return list;
  };
})();
