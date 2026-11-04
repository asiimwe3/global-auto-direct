# -*- coding: utf-8 -*-
exec(open("gen_public.py").read().split("# ─────────────────────────────── HOME")[0])

body = '''
<section class="block" style="padding-top:34px"><div class="wrap">
  <span class="eyebrow">Comparison</span><h1 style="font-size:clamp(1.8rem,3.6vw,2.6rem)">Compare vehicles side by side</h1>
  <p>Tick "Compare" on up to three vehicles in the inventory, then open them here. Landed cost is calculated for Uganda by sea.</p>
  <div id="cmp"></div>
</div></section>
'''
js = r'''
(function () {
  const G = window.GAD;
  G.mount("vehicles.html");
  const el = document.getElementById("cmp");
  const ids = (G.qs("ids") || "").split(",").filter(Boolean).length ? (G.qs("ids") || "").split(",").filter(Boolean) : G.compareIds();
  const d = G.db();
  const list = ids.map(id => d.vehicles.find(v => v.id === id)).filter(Boolean);
  if (!list.length) {
    el.innerHTML = `<div class="card"><h3 style="margin-top:0">Nothing to compare yet</h3><p class="small">Open the inventory and tick the compare box on the vehicles you are considering.</p><a class="btn primary" href="vehicles.html">Go to inventory</a></div>`;
    return;
  }
  const quotes = list.map(v => G.quote({ vehicleId: v.id, vehiclePrice: v.priceUsd, engineCc: v.engineCc, originCode: v.origin, destCode: "UG", shipping: "sea", currency: G.cur() }));
  const rows = [
    ["Price (FOB)", v => G.price(v.priceUsd)],
    ["Year", v => v.year],
    ["Mileage", v => v.mileageKm ? G.num(v.mileageKm) + " km" : "0 km (new)"],
    ["Engine", v => v.engineCc ? G.num(v.engineCc) + " cc" : "Electric"],
    ["Fuel", v => v.fuel],
    ["Transmission", v => v.transmission],
    ["Drivetrain", v => v.drivetrain],
    ["Condition", v => v.condition],
    ["Origin", v => G.origin(v.origin).name],
    ["Shipping estimate", v => G.price(v.shipEstimateUsd)],
    ["Delivery time", v => v.deliveryDays + " days"],
    ["Landed cost to Uganda", (v, i) => "<b>" + G.price(quotes[i].totalUsd) + "</b>"],
    ["Action", v => `<a class="btn ghost sm" href="vehicle.html?id=${v.id}">View</a>`],
  ];
  el.innerHTML = `<div class="table-wrap"><table style="min-width:760px"><thead><tr><th></th>${list.map(v => `<th style="position:static">${G.esc(v.title)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(([label, fn]) => `<tr><th style="position:static">${label}</th>${list.map((v, i) => `<td>${fn(v, i)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <p class="small" style="margin-top:12px">Landed cost uses each vehicle's own engine size and origin route. Estimates still require confirmation by a clearing agent.</p>
    <a class="btn ghost" href="vehicles.html">Add another vehicle</a>`;
})();
'''
write("compare.html", "Compare imported vehicles — GLOBAL AUTO DIRECT",
      "Compare up to three vehicles side by side: specification, shipping estimate and full landed cost to your destination.",
      body, js)

# floating compare bar, wired on the pages that render cards
for page, script in [("vehicles.html", None), ("index.html", None)]:
    pass
