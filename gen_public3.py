# -*- coding: utf-8 -*-
exec(open("gen_public.py").read().split("# ─────────────────────────────── HOME")[0])

# ───────────────────────── LOGIN ─────────────────
login_body = '''
<section class="block" style="padding:60px 0"><div class="wrap" style="max-width:460px">
  <div class="card">
    <span class="eyebrow">Accounts</span><h2 style="margin-bottom:.3em">Sign in</h2>
    <p class="small">Access your saved vehicles, quotations, orders and tracking.</p>
    <form id="lf">
      <div class="field"><label class="f">Email</label><input id="lemail" type="email" required autocomplete="username"></div>
      <div class="field"><label class="f">Password</label><input id="lpass" type="password" required autocomplete="current-password"></div>
      <div id="lerr" class="notice hide"></div>
      <button class="btn primary block" type="submit">Sign in</button>
    </form>
    <p class="small" style="margin-top:14px">No account yet? <a href="register.html" style="color:#5AA0FF">Create one</a></p>
    <div class="notice info" style="margin-bottom:0">
      <b>Demonstration logins</b><br>
      Customer — customer@demo.com / Demo@2026<br>
      Administrator — admin@globalautodirect.com / Admin@2026<br>
      Sales — sales@… / Sales@2026 · Finance — finance@… / Finance@2026<br>
      Logistics — logistics@… / Logistics@2026 · Supplier — supplier@… / Supplier@2026
    </div>
  </div>
</div></section>
'''
login_js = r'''
(function () {
  const G = window.GAD;
  G.mount("");
  document.getElementById("lf").onsubmit = async (e) => {
    e.preventDefault();
    const r = await G.login(document.getElementById("lemail").value, document.getElementById("lpass").value);
    if (!r.ok) { const b = document.getElementById("lerr"); b.textContent = r.error; b.classList.remove("hide"); return; }
    const next = G.qs("next") || (r.user.role === "customer" ? "account.html" : r.user.role === "supplier" ? "supplier.html" : "admin.html");
    location.href = next;
  };
})();
'''
write("login.html", "Sign in — GLOBAL AUTO DIRECT", "Sign in to your GLOBAL AUTO DIRECT account to manage saved vehicles, quotations, orders and shipments.", login_body, login_js)

# ───────────────────────── REGISTER ─────────────────
reg_body = '''
<section class="block" style="padding:60px 0"><div class="wrap" style="max-width:560px">
  <div class="card">
    <span class="eyebrow">Accounts</span><h2 style="margin-bottom:.3em">Create your account</h2>
    <p class="small">Save vehicles, request imports and track shipments in one place.</p>
    <form id="rf2">
      <div class="form-grid">
        <div><label class="f">Full name *</label><input id="rname" required></div>
        <div><label class="f">Phone</label><input id="rphone" placeholder="+256..."></div>
        <div><label class="f">Email *</label><input id="remail" type="email" required></div>
        <div><label class="f">Country</label><select id="rcountry"></select></div>
        <div><label class="f">Currency</label><select id="rcur"></select></div>
        <div><label class="f">Password *</label><input id="rpass" type="password" required minlength="8"></div>
      </div>
      <div id="rerr" class="notice hide"></div>
      <p class="small">Passwords are stored as SHA-256 hashes in this browser for the demonstration build. Production uses Supabase authentication with server-side sessions.</p>
      <button class="btn primary block" type="submit">Create account</button>
    </form>
    <p class="small" style="margin-top:14px">Already registered? <a href="login.html" style="color:#5AA0FF">Sign in</a> · Supplying vehicles? <a href="suppliers-join.html" style="color:#5AA0FF">Apply as a supplier</a></p>
  </div>
</div></section>
'''
reg_js = r'''
(function () {
  const G = window.GAD;
  G.mount("");
  const d = G.db();
  document.getElementById("rcountry").innerHTML = d.countries.map(c => `<option value="${c.code}">${c.flag} ${c.name}</option>`).join("");
  document.getElementById("rcur").innerHTML = Object.keys(d.currencies).map(c => `<option>${c}</option>`).join("");
  document.getElementById("rcur").value = "UGX";
  document.getElementById("rf2").onsubmit = async (e) => {
    e.preventDefault();
    const r = await G.register({
      name: document.getElementById("rname").value, email: document.getElementById("remail").value,
      phone: document.getElementById("rphone").value, country: document.getElementById("rcountry").value,
      currency: document.getElementById("rcur").value, password: document.getElementById("rpass").value, role: "customer",
    });
    if (!r.ok) { const b = document.getElementById("rerr"); b.textContent = r.error; b.classList.remove("hide"); return; }
    location.href = "account.html";
  };
})();
'''
write("register.html", "Create an account — GLOBAL AUTO DIRECT", "Create a GLOBAL AUTO DIRECT account to save vehicles, request imports and track shipments.", reg_body, reg_js)

# ───────────────────────── SUPPLIER APPLY ─────────────────
sup_body = '''
<section class="block" style="padding-top:38px"><div class="wrap" style="max-width:760px">
  <span class="eyebrow">Suppliers</span><h1 style="font-size:clamp(1.8rem,3.6vw,2.6rem)">Supply vehicles to a global buyer network</h1>
  <p>Exporters, dealers, inspection companies and freight partners can apply for a verified supplier account. Applications are reviewed by our supplier team; inventory cannot be published until verification is complete.</p>
  <div class="card">
    <form id="sf">
      <div class="form-grid">
        <div><label class="f">Business name *</label><input id="sname" required></div>
        <div><label class="f">Country *</label><select id="scountry"></select></div>
        <div><label class="f">City</label><input id="scity"></div>
        <div><label class="f">Years trading</label><input id="syears" type="number" min="0" placeholder="5"></div>
        <div><label class="f">Contact email *</label><input id="semail" type="email" required></div>
        <div><label class="f">Contact phone</label><input id="sphone"></div>
        <div><label class="f">Login password *</label><input id="spass" type="password" minlength="8" required></div>
        <div><label class="f">Verification documents</label><input id="sdocs" type="file" multiple></div>
      </div>
      <div class="field"><label class="f">What do you supply?</label><textarea id="snotes" rows="3" placeholder="Vehicle types, monthly volume, export experience..."></textarea></div>
      <p class="small">Uploading a document records its name and size in this demonstration build. Production stores documents in private object storage with signed access.</p>
      <button class="btn primary" type="submit">Apply for verification</button>
    </form>
    <div id="sdone" class="hide"></div>
  </div>
</div></section>
'''
sup_js = r'''
(function () {
  const G = window.GAD;
  G.mount("");
  const d = G.db();
  document.getElementById("scountry").innerHTML = d.origins.map(o => `<option value="${o.code}">${o.flag} ${o.name}</option>`).join("");
  document.getElementById("sf").onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("sname").value.trim();
    const email = document.getElementById("semail").value.trim();
    const pass = document.getElementById("spass").value;
    const supplier = {
      id: G.uid("sup"), name, country: document.getElementById("scountry").value, city: document.getElementById("scity").value.trim(),
      status: "pending", since: String(new Date().getFullYear() - Number(document.getElementById("syears").value || 0)), rating: null, vehicles: 0,
      docs: [...document.getElementById("sdocs").files].map(f => f.name), contact: email, notes: document.getElementById("snotes").value.trim(),
      appliedAt: G.now(),
    };
    const r = await G.register({ name, email, phone: document.getElementById("sphone").value, password: pass, role: "supplier", supplierId: supplier.id, country: supplier.country, currency: "USD" });
    if (!r.ok) { G.toast(r.error); return; }
    G.save(db => db.suppliers.unshift(supplier));
    G.audit(null, "Supplier application received: " + name, "supplier", supplier.id);
    document.getElementById("sf").classList.add("hide");
    const done = document.getElementById("sdone");
    done.classList.remove("hide");
    done.innerHTML = `<div style="text-align:center;padding:10px"><div style="font-size:2.2rem">📄</div>
      <h2>Application received</h2>
      <p>Your supplier account is <b>pending review</b>. You can sign in now, but you cannot publish inventory until an administrator verifies your documents.</p>
      <a class="btn primary" href="supplier.html">Open my supplier dashboard</a></div>`;
  };
})();
'''
write("suppliers-join.html", "Become a verified supplier — GLOBAL AUTO DIRECT", "Apply for a verified supplier account and reach international buyers with coordinated shipping and inspection.", sup_body, sup_js)

# ───────────────────────── TRACK ─────────────────
track_body = '''
<section class="block" style="padding-top:40px"><div class="wrap" style="max-width:820px">
  <span class="eyebrow">Tracking</span><h1 style="font-size:clamp(1.8rem,3.6vw,2.6rem)">Track a shipment</h1>
  <p>Enter your order number (for example GAD-2026-1001) to see the current stage, vessel details and the full history on file.</p>
  <form id="tf" class="card"><div class="field"><label class="f">Order number</label><input id="tcode" placeholder="GAD-2026-1001" required></div>
  <button class="btn primary" type="submit">Track order</button></form>
  <div id="tout"></div>
</div></section>
'''
track_js = r'''
(function () {
  const G = window.GAD;
  G.mount("track.html");
  const out = document.getElementById("tout");
  const show = (code) => {
    const d = G.db();
    const o = d.orders.find(x => x.code.toLowerCase() === String(code).toLowerCase().trim());
    if (!o) { out.innerHTML = '<div class="notice">No order found with that number. Check the number on your quotation email, or contact support.</div>'; return; }
    const v = d.vehicles.find(x => x.id === o.vehicleId);
    const ship = d.shipments.find(s => s.orderId === o.id);
    out.innerHTML = `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div><h3 style="margin:0">${o.code}</h3><p class="small" style="margin:4px 0 0">${v ? G.esc(v.title) : "Vehicle"} · ${G.when(o.createdAt)}</p></div>
        <span class="chip ${o.stage === "Completed" ? "ok" : "warn"}">${o.stage}</span>
      </div>
      <div style="margin:18px 0">${G.timeline(o)}</div>
      ${ship ? `<div class="table-wrap"><table><tbody>
        <tr><th>Vessel</th><td>${ship.vessel}</td></tr>
        <tr><th>Container</th><td>${ship.container}</td></tr>
        <tr><th>Bill of lading</th><td>${ship.billOfLading}</td></tr>
        <tr><th>Route</th><td>${ship.departurePort} → ${ship.arrivalPort}</td></tr>
        <tr><th>ETD / ETA</th><td>${ship.etd} / ${ship.eta}</td></tr>
        <tr><th>Shipping line</th><td>${ship.shippingCompany}</td></tr>
      </tbody></table></div>
      <p class="small" style="margin-top:10px">${ship.trackingNote}</p>` : '<div class="notice">No shipment has been booked for this order yet.</div>'}
      <p class="small">For your security, payment details and documents are only visible after signing in to your account.</p>
    </div>`;
  };
  document.getElementById("tf").onsubmit = (e) => { e.preventDefault(); show(document.getElementById("tcode").value); };
  if (G.qs("order")) show(G.qs("order"));
})();
'''
write("track.html", "Track your vehicle shipment — GLOBAL AUTO DIRECT", "Track your imported vehicle through all 16 order stages, from enquiry to local delivery.", track_body, track_js)
