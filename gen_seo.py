# -*- coding: utf-8 -*-
exec(open("gen_public.py").read().split("# ─────────────────────────────── HOME")[0])

COUNTRY = {
 "JP": ("Japan", "Import cars from Japan to Uganda — auction grades, JEVIC inspection and Yokohama shipping",
        "Buying from Japan: how Japanese auctions work, what JEVIC and auction grades mean, shipping from Yokohama to Mombasa, and what to check before paying a deposit."),
 "CN": ("China", "Buy cars, EVs and motorcycles from China — verified suppliers and shipping to East Africa",
        "Sourcing from China: new energy vehicles, Zongshen motorcycles and commercial vehicles, CCC certification, factory inspection and freight from Shanghai."),
 "DE": ("Germany", "Import premium cars from Germany — TÜV reports and Hamburg shipping",
        "German sourcing: dealer and trade stock, service history, TÜV inspection, export plates and container shipping from Hamburg."),
 "KR": ("South Korea", "Import Hyundai and Kia vehicles from South Korea — Busan shipping",
        "Korean sourcing: domestic-market Hyundai and Kia stock, mileage verification, inspection and freight from Busan."),
 "AE": ("United Arab Emirates", "Import Gulf-spec vehicles from the UAE — fastest route to East Africa",
        "UAE sourcing: Gulf-spec Land Cruisers, Hilux pickups and Boxer motorcycles, Dubai inspection, and the short Jebel Ali to Mombasa route."),
 "US": ("United States", "Import pickups and electric cars from the USA — Baltimore shipping",
        "US sourcing: F-150 pickups and Tesla models, mileage in miles, left-hand drive checks, title verification and Baltimore container shipping."),
}

for code, (name, title, desc) in COUNTRY.items():
    body = f'''
<section class="hero" style="padding:44px 0 34px"><div class="wrap" style="grid-template-columns:1fr">
  <div>
    <span class="eyebrow">Import from {name}</span>
    <h1 style="font-size:clamp(1.9rem,4vw,3rem)">Vehicles from {name}, delivered to your door</h1>
    <p style="max-width:75ch">{desc}</p>
    <div class="hero-cta"><a class="btn primary" href="vehicles.html?origin={code}">Browse {name} stock</a><a class="btn ghost" href="calculator.html">Calculate landed cost</a><a class="btn ghost" href="import-request.html?origin={code}">Request a specific vehicle</a></div>
  </div>
</div></section>
<section class="block" style="padding-top:30px"><div class="wrap">
  <div class="sec-head"><div><h2>Available from {name}</h2><p>Demonstration listings from this origin.</p></div><a class="btn ghost sm" href="vehicles.html?origin={code}">See all</a></div>
  <div class="grid g4" id="list"></div>
</div></section>
<section class="block"><div class="wrap" style="max-width:860px">
  <h2>How the {name} route works</h2>
  <div class="steps">
    <div class="step"><b>Source verified</b><p>We work with licensed exporters in {name}. Their trading documents and inspection partners are checked before a vehicle is quoted.</p></div>
    <div class="step"><b>Inspected before payment</b><p>An independent inspection is arranged at the supplier or auction house, with photographs and a condition report sent to you.</p></div>
    <div class="step"><b>Export and freight</b><p>Export documentation is prepared, the vehicle is moved to the export port and loaded, with marine insurance from the moment it leaves the yard.</p></div>
    <div class="step"><b>Clearance and delivery</b><p>Our clearing partners handle duty, excise, VAT and port charges at destination, then arrange delivery to your city.</p></div>
  </div>
  <h2 style="margin-top:34px">What to check before you commit</h2>
  <p>Confirm the vehicle's age against your country's import limit, confirm the drive side, and ask for the chassis number on the invoice to match the inspection report. Duties are calculated on the CIF value, so freight and insurance change the tax you pay. Our calculator shows every line before you commit, and every figure is marked as an estimate until a licensed agent confirms it.</p>
  <div class="notice">All listings on this page are demonstration data. Final quotations are issued only after supplier confirmation and inspection.</div>
  <a class="btn primary" href="import-request.html?origin={code}">Start an import request</a>
</div></section>'''
    js = f'''
(function () {{
  const G = window.GAD; G.mount("");
  const list = G.db().vehicles.filter(v => v.origin === "{code}");
  document.getElementById("list").innerHTML = list.length ? list.slice(0,8).map(G.card).join("") : '<div class="card" style="grid-column:1/-1"><p>No demonstration listings from this origin yet.</p></div>';
}})();'''
    write(f"country-{code.lower()}.html", title + " — GLOBAL AUTO DIRECT", desc, body, js)

# ───────────────────────── GUIDES INDEX ─────────────────────────
guides_body = '''
<section class="block" style="padding-top:38px"><div class="wrap">
  <span class="eyebrow">Guides</span><h1 style="font-size:clamp(1.9rem,4vw,2.9rem)">Import guides and market notes</h1>
  <p style="max-width:75ch">Plain explanations of how vehicle importing works: duty calculations, inspection grades, shipping routes and what to verify before you pay.</p>
  <div class="grid g3" style="margin-top:22px">
    <a class="card" href="guide-import-uganda.html"><span class="chip">Uganda</span><h3 style="margin-top:10px">Importing a vehicle into Uganda: duty, excise and VAT explained</h3><p class="small">How URA duty is calculated on the CIF value, why engine size changes your excise, and how to check the age limit.</p></a>
    <a class="card" href="guide-import-japan.html"><span class="chip">Japan</span><h3 style="margin-top:10px">Buying from Japanese auctions: grades, JEVIC and what they mean</h3><p class="small">Auction grade sheets, accident history, mileage verification and why an independent inspection matters.</p></a>
    <a class="card" href="guide-zongshen.html"><span class="chip">Motorcycles</span><h3 style="margin-top:10px">Importing Zongshen motorcycles in bulk</h3><p class="small">Crate packing, serial numbers, spare parts, duty on motorcycles and licensing at destination.</p></a>
    <a class="card" href="guide-shipping.html"><span class="chip">Shipping</span><h3 style="margin-top:10px">Container shipping, RoRo and what your bill of lading tells you</h3><p class="small">What a BL proves, how container sharing works, and what to do when a vessel is delayed.</p></a>
  </div>
</div></section>
'''
write("guides.html", "Vehicle import guides — GLOBAL AUTO DIRECT",
      "Practical guides to importing vehicles: Uganda duty calculation, Japanese auction grades, Zongshen motorcycles and container shipping.",
      guides_body, 'G.mount("guides.html");')

def article(slug, title, desc, heading, paras, related):
    body = f'''<section class="block" style="padding-top:38px"><div class="wrap" style="max-width:760px">
  <div class="small"><a href="guides.html" style="color:#5AA0FF">Guides</a> / {title.split(":")[0]}</div>
  <h1 style="font-size:clamp(1.7rem,3.4vw,2.5rem);margin-top:10px">{heading}</h1>
  {paras}
  <div class="notice info">This guide is general information, not customs or legal advice. Rules change and are applied case by case.</div>
  <h2 style="margin-top:28px">Related</h2>
  <div class="grid g2">{related}</div>
  <p style="margin-top:24px"><a class="btn primary" href="import-request.html">Send an import request</a> <a class="btn ghost" href="calculator.html">Calculate landed cost</a></p>
</div></section>'''
    write(slug, title + " — GLOBAL AUTO DIRECT", desc, body, 'G.mount("guides.html");')

article("guide-import-uganda.html", "Importing a vehicle into Uganda: duty, excise and VAT",
  "How Uganda import duty, excise and VAT are calculated on vehicles, and how to check eligibility before paying.",
  "Importing a vehicle into Uganda: duty, excise and VAT explained",
  '''<p>Uganda charges three main taxes on imported vehicles: import duty, excise duty and value added tax. They are calculated in a chain, and that chain is why two vehicles with the same price can land at very different totals.</p>
  <h3>The CIF value comes first</h3>
  <p>Duty is charged on the CIF value: the cost of the vehicle, plus insurance, plus freight. A cheap vehicle with expensive freight can therefore carry more tax than expected. Our calculator builds the CIF value from the supplier price, marine insurance and the freight quote for the route.</p>
  <h3>Duty, then excise, then VAT</h3>
  <p>Import duty applies to the CIF value. Excise applies to the same value but at a rate that rises with engine size, which is why a 2.7 litre Prado attracts more excise than a 1.0 litre Vitz. VAT is then charged on the CIF value plus duty plus excise. Each line is shown separately in the calculator so you can see exactly what the engine size is costing you.</p>
  <h3>Age and drive side</h3>
  <p>Uganda requires right-hand drive vehicles, and older vehicles face restrictions. Before a deposit is taken, we check the year of manufacture against the rule in force and tell you if the unit is at risk. If eligibility is uncertain, we pause rather than take payment.</p>
  <h3>Why estimates need confirmation</h3>
  <p>URA applies its own valuation in some cases, and rates change. The figures from our calculator are estimates until a licensed clearing agent confirms them for your specific chassis number. That confirmation is what a final quotation is based on.</p>''',
  '''<a class="card" href="guide-import-japan.html"><h3>Japanese auction grades</h3><p class="small">What the grade sheet tells you.</p></a>
     <a class="card" href="clockwise"><h3>Import calculator</h3><p class="small">See every cost line for your vehicle.</p></a>'''.replace('href="clockwise"','href="calculator.html"'))

article("guide-import-japan.html", "Buying from Japanese auctions: grades, JEVIC and what they mean",
  "Japanese auction grades, JEVIC inspection reports, mileage verification and how to buy safely from Japan.",
  "Buying from Japanese auctions: grades, JEVIC and what they mean",
  '''<p>Japan is the world's most organised used-vehicle export market. Cars reach export through manufacturer auctions, dealer auctions and trade stock, and each comes with paperwork that you should read before paying.</p>
  <h3>Auction grades</h3>
  <p>A grade is a condition score, not a warranty. A 4.5 car is usually clean with minor marks; a 3.5 car may have panel repairs or visible wear. Grades do not tell you whether the mileage is genuine on their own, and they are not a substitute for photographs of the actual unit.</p>
  <h3>JEVIC and independent inspection</h3>
  <p>JEVIC is a Japanese export inspection certificate. It gives you a documented condition record at the port, which matters if something is disputed later. We ask for the JEVIC sheet plus a walk-round video before the purchase stage is authorised.</p>
  <h3>Mileage and service history</h3>
  <p>Japanese auction sheets show recorded mileage and often the auction house's own inspection notes. Cross-check the mileage against the service stickers and the auction sheet: a car with unusually low mileage and no history is a reason to pause, not a bargain to grab.</p>
  <h3>What we check before your money moves</h3>
  <p>Supplier licence, the chassis number on the invoice against the inspection report, the auction sheet, photographs and video, and the shipping schedule from Yokohama. Only then does the quotation become a purchase.</p>''',
  '''<a class="card" href="guide-import-uganda.html"><h3>Uganda duty explained</h3><p class="small">How the tax chain works.</p></a>
     <a class="card" href="country-jp.html"><h3>Stock from Japan</h3><p class="small">Current demonstration listings.</p></a>''')

article("guide-zongshen.html", "Importing Zongshen motorcycles in bulk",
  "How bulk Zongshen motorcycle importing works: crate packing, serial numbers, duty treatment and licensing.",
  "Importing Zongshen motorcycles in bulk",
  '''<p>Zongshen motorcycles are popular with boda operators, dealers and cooperatives because parts are available and the price per unit is low. Bulk importing changes a few things compared with importing a car.</p>
  <h3>Crate packing and volume</h3>
  <p>Motorcycles ship crated, usually two to four units per crate depending on model. Volume, not weight, drives your freight cost, which is why a consolidated crate of mixed models is often cheaper per bike than a single unit.</p>
  <h3>Serial numbers must match</h3>
  <p>Every frame and engine number on the commercial invoice has to match the crates and the bill of lading. Mismatches are the most common reason shipments get stuck at destination. We record serials against your order before the crate is sealed.</p>
  <h3>Duty treatment</h3>
  <p>Motorcycles are classified separately from cars, with their own duty and excise treatment by engine size. The calculator applies the destination rule for the cc of the model you are importing, so a 150 cc commuter and a 400 cc adventure bike are not assumed to cost the same.</p>
  <h3>Spare parts in the same shipment</h3>
  <p>Shipping a parts allowance with the bikes is far cheaper than a separate consignment later. Tell us which consumables you want in the crate: chains, sprockets, brake pads, cables and filters are the usual list.</p>''',
  '''<a class="card" href="country-cn.html"><h3>Stock from China</h3><p class="small">Motorcycles and EVs.</p></a>
     <a class="card" href="calculator.html"><h3>Calculate duty</h3><p class="small">Motorcycle duty by engine size.</p></a>''')

article("guide-shipping.html", "Container shipping, RoRo and what your bill of lading tells you",
  "How vehicle shipping works: containers, RoRo, bills of lading, insurance and what happens when a vessel is delayed.",
  "Container shipping, RoRo and what your bill of lading tells you",
  '''<p>Most vehicles moving to East Africa travel either in a container or on a RoRo vessel. Each has trade-offs, and your bill of lading is the document that actually proves the shipment.</p>
  <h3>Container versus RoRo</h3>
  <p>A container protects the vehicle, allows spare parts to travel with it, and can be shared between two or three vehicles. RoRo is usually cheaper per unit for a single running vehicle but exposes the bodywork and cannot carry loose parts.</p>
  <h3>What the bill of lading proves</h3>
  <p>The BL is the contract between shipper and carrier. It records the vessel, the container or unit, the ports and the consignee. It is not proof of condition and it is not proof of payment, which is why we keep the inspection report separately on your order file.</p>
  <h3>Insurance from the yard, not the port</h3>
  <p>Marine insurance should start when the vehicle leaves the supplier's yard, not when it reaches the port. Inland damage between the two is common and uninsured if cover starts too late.</p>
  <h3>When a vessel is delayed</h3>
  <p>Delays happen. We post tracking events manually when a carrier has no API, and we tell you the new ETA rather than leaving a stale date on your order. Live vessel tracking is only shown when a carrier feed is actually connected and confirmed.</p>''',
  '''<a class="card" href="track.html"><h3>Track an order</h3><p class="small">See every stage of the chain.</p></a>
     <a class="card" href="guide-import-uganda.html"><h3>Duty on arrival</h3><p class="small">What clearance costs.</p></a>''')
