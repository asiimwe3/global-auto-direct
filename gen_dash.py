# -*- coding: utf-8 -*-
exec(open("gen_public.py").read().split("# ─────────────────────────────── HOME")[0])

DASH_HEAD = '''
<section class="dash">
  <aside class="side" id="side"></aside>
  <div class="pane" id="pane"></div>
</section>
'''

account_js = r'''
(function () {
  const G = window.GAD;
  G.mount("");
  const u = G.requireLogin();
  if (!u) return;
  const pane = document.getElementById("pane");
  const side = document.getElementById("side");
  const TABS = [["overview","Overview","◍"],["saved","Saved vehicles","♡"],["requests","Import requests","✎"],["orders","Orders","❏"],["quotes","Quotations","₤"],["payments","Payments","∑"],["shipping","Shipping & tracking","⚓"],["documents","Documents","🗎"],["support","Support","?"],["profile","My profile","☺"],["notifications","Notifications","⌁"]];
  let tab = G.qs("tab") || "overview";

  function mine() {
    const d = G.db();
    return {
      d,
      saved: (d.saved || []).filter(s => s.userId === u.id).map(s => d.vehicles.find(v => v.id === s.vehicleId)).filter(Boolean),
      requests: d.requests.filter(r => r.userId === u.id || r.email === u.email),
      orders: d.orders.filter(o => o.customerId === u.id),
      quotes: d.quotes.filter(q => q.customerId === u.id),
      notes: d.notifications.filter(n => n.userId === u.id),
      docs: d.documents.filter(doc => d.orders.some(o => o.id === doc.orderId && o.customerId === u.id)),
      tickets: d.tickets.filter(t => t.userId === u.id),
      payments: (d.payments || []).filter(p => d.orders.some(o => o.id === p.orderId && o.customerId === u.id)),
    };
  }

  function nav() {
    side.innerHTML = `<div class="grp">My account</div>` + TABS.map(([k, label, ico]) =>
      `<a href="#${k}" class="${k === tab ? "on" : ""}" data-tab="${k}">${ico} ${label}</a>`).join("")
      + `<div class="grp">Session</div><a href="#" id="out">⎋ Sign out</a>`;
    side.querySelectorAll("[data-tab]").forEach(a => a.onclick = (e) => { e.preventDefault(); tab = a.dataset.tab; location.hash = tab; nav(); view(); });
    side.querySelector("#out").onclick = (e) => { e.preventDefault(); G.logout(); };
  }

  function view() {
    const m = mine();
    if (tab === "overview") {
      pane.innerHTML = `<h1 style="font-size:1.9rem">Welcome, ${G.esc(u.name.split(" ")[0])}</h1>
        <p>Your import activity at a glance.</p>
        <div class="kpis">
          <div class="kpi"><div class="label">Active orders</div><div class="val">${m.orders.filter(o => o.stage !== "Completed").length}</div></div>
          <div class="kpi"><div class="label">Saved vehicles</div><div class="val">${m.saved.length}</div></div>
          <div class="kpi"><div class="label">Open requests</div><div class="val">${m.requests.filter(r => r.status !== "quoted" && r.status !== "closed").length}</div></div>
          <div class="kpi"><div class="label">Notifications</div><div class="val">${m.notes.filter(n => !n.read).length}</div></div>
        </div>
        <div class="card"><h3 style="margin-top:0">Current shipment</h3>${m.orders.length ? G.timeline(m.orders[0]) : '<p class="small">No orders yet. Your first import starts with a request.</p>'}
        <a class="btn primary sm" href="import-request.html">Start an import request</a></div>
        <div class="card"><h3 style="margin-top:0">Recent activity</h3>
        ${(m.orders[0] ? m.orders[0].log.slice(-5).reverse() : []).map(l => `<p class="small" style="margin:0 0 8px"><b style="color:#fff">${G.when(l.at)}</b> — ${G.esc(l.text)}</p>`).join("") || '<p class="small">Nothing yet.</p>'}</div>`;
    }
    if (tab === "saved") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">Saved vehicles</h1><p>Vehicles you kept for later.</p><div class="grid g3" id="sv"></div>`;
      const el = document.getElementById("sv");
      el.innerHTML = m.saved.length ? m.saved.map(G.card).join("") : '<div class="card"><p>You have not saved any vehicles yet.</p><a class="btn ghost sm" href="vehicles.html">Browse inventory</a></div>';
    }
    if (tab === "requests") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">Import requests</h1><p>Custom vehicles you asked us to find.</p>
        <div class="table-wrap"><table><thead><tr><th>ID</th><th>Vehicle wanted</th><th>Route</th><th>Budget</th><th>Status</th><th>Sent</th></tr></thead><tbody>
        ${m.requests.map(r => `<tr><td><b>${r.code}</b></td><td>${G.esc(r.brand)} ${G.esc(r.model)} ${G.esc(r.year)}</td><td>${r.origin === "any" ? "Any" : G.origin(r.origin).name} → ${G.country(r.destCountry).name}</td><td>${r.budgetUsd ? G.price(r.budgetUsd) : "—"}</td><td><span class="chip ${r.status === "quoted" ? "ok" : "warn"}">${r.status}</span></td><td>${G.when(r.createdAt)}</td></tr>`).join("") || '<tr><td colspan="6">No requests yet.</td></tr>'}
        </tbody></table></div><p class="small" style="margin-top:12px">Need another vehicle? <a href="import-request.html" style="color:#5AA0FF">Send a new request</a></p>`;
    }
    if (tab === "orders") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">Orders</h1><p>Each order shows the stage it has reached in the import chain.</p>
      ${m.orders.map(o => { const v = m.d.vehicles.find(x => x.id === o.vehicleId) || {}; return `<div class="card">
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h3 style="margin:0">${o.code}</h3><p class="small" style="margin:4px 0 0">${G.esc(v.title || "")} · ${G.price(o.totalUsd)}</p></div><span class="chip ${o.stage === "Completed" ? "ok" : "warn"}">${o.stage}</span></div>
        <div style="margin-top:14px">${G.timeline(o)}</div>
        <a class="btn ghost sm" href="track.html?order=${o.code}">Open tracking view</a>
      </div>`; }).join("") || '<div class="card"><p>No orders yet.</p></div>'}`;
    }
    if (tab === "quotes") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">Quotations</h1><p>Every quotation we have issued to you.</p>
        <div class="table-wrap"><table><thead><tr><th>Quote</th><th>Vehicle</th><th>Landed cost</th><th>Status</th><th>Valid until</th></tr></thead><tbody>
        ${m.quotes.map(q => { const v = m.d.vehicles.find(x => x.id === q.vehicleId) || {}; return `<tr><td>${q.id.toUpperCase()}</td><td>${G.esc(v.title || "")}</td><td>${G.price(q.totalUsd)}</td><td><span class="chip ${q.status === "approved" ? "ok" : "warn"}">${q.status}</span></td><td>${q.validUntil}</td></tr>`; }).join("") || '<tr><td colspan="5">No quotations yet.</td></tr>'}
        </tbody></table></div>`;
    }
    if (tab === "payments") {
      const paid = m.payments.reduce((s, p) => s + p.amountUsd, 0);
      pane.innerHTML = `<h1 style="font-size:1.8rem">Payments</h1><p>Deposits and milestone payments recorded against your orders.</p>
        <div class="kpis"><div class="kpi"><div class="label">Total paid</div><div class="val">${G.price(paid)}</div></div>
        <div class="kpi"><div class="label">Outstanding</div><div class="val">${G.price(Math.max(0, m.orders.reduce((s, o) => s + o.totalUsd, 0) - paid))}</div></div>
        <div class="kpi"><div class="label">Payment method</div><div class="val" style="font-size:1rem">Bank transfer</div></div>
        <div class="kpi"><div class="label">Next step</div><div class="val" style="font-size:1rem">Awaiting quotation</div></div></div>
        <div class="table-wrap"><table><thead><tr><th>Date</th><th>Order</th><th>Type</th><th>Reference</th><th>Amount</th></tr></thead><tbody>
        ${m.payments.map(p => `<tr><td>${G.when(p.at)}</td><td>${(m.d.orders.find(o => o.id === p.orderId) || {}).code || p.orderId}</td><td>${p.type}</td><td>${G.esc(p.reference)}</td><td>${G.price(p.amountUsd)}</td></tr>`).join("") || '<tr><td colspan="5">No payment recorded yet.</td></tr>'}
        </tbody></table></div>
        <div class="notice">Card payments and mobile money are not connected in this build. Production connects a licensed gateway and confirms each payment by verified webhook before an order stage advances.</div>`;
    }
    if (tab === "shipping") {
      const ships = m.d.shipments.filter(s => m.orders.some(o => o.id === s.orderId));
      pane.innerHTML = `<h1 style="font-size:1.8rem">Shipping & tracking</h1><p>Vessel, container and port details for your orders.</p>
      ${ships.map(s => `<div class="card"><h3 style="margin-top:0">${s.vessel} <span class="chip">${s.status}</span></h3>
        <div class="table-wrap"><table><tbody>
          <tr><th>Container</th><td>${s.container}</td></tr><tr><th>Bill of lading</th><td>${s.billOfLading}</td></tr>
          <tr><th>Route</th><td>${s.departurePort} → ${s.arrivalPort}</td></tr><tr><th>ETD / ETA</th><td>${s.etd} / ${s.eta}</td></tr>
          <tr><th>Shipping line</th><td>${s.shippingCompany}</td></tr></tbody></table></div>
        <h4 style="margin:16px 0 8px">Tracking events</h4>
        <ul class="timeline">${s.events.map(e => `<li class="done"><b>${e.at}</b><span>${G.esc(e.text)}</span></li>`).join("")}</ul>
        <p class="small">${s.trackingNote}</p></div>`).join("") || '<div class="card"><p>No shipment booked yet.</p></div>'}`;
    }
    if (tab === "documents") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">Documents</h1><p>Invoices, inspection reports, bills of lading and customs paperwork.</p>
        <div class="table-wrap"><table><thead><tr><th>Document</th><th>Order</th><th>Type</th><th>Uploaded</th><th>Size</th></tr></thead><tbody>
        ${m.docs.map(doc => `<tr><td>${G.esc(doc.name)}</td><td>${(m.d.orders.find(o => o.id === doc.orderId) || {}).code || ""}</td><td>${doc.type}</td><td>${G.when(doc.at)}</td><td>${doc.size}</td></tr>`).join("") || '<tr><td colspan="5">No documents on file yet.</td></tr>'}
        </tbody></table></div>`;
    }
    if (tab === "support") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">Support</h1><p>Send a question and our team replies on your account and by email.</p>
        <div class="card"><form id="tf2"><div class="field"><label class="f">Subject</label><input id="tsub" required></div>
        <div class="field"><label class="f">Message</label><textarea id="tmsg" rows="4" required></textarea></div>
        <button class="btn primary" type="submit">Send message</button></form></div>
        <div class="card"><h3 style="margin-top:0">Your conversations</h3>
        ${m.tickets.map(t => `<div style="border-bottom:1px solid rgba(255,255,255,.08);padding:10px 0"><b>${G.esc(t.subject)}</b> <span class="chip ${t.status === "open" ? "warn" : "ok"}">${t.status}</span><p class="small" style="margin:6px 0 0">${G.esc(t.message)}</p>${t.reply ? `<p class="small" style="margin:6px 0 0;color:#2ED47A">Reply: ${G.esc(t.reply)}</p>` : ""}</div>`).join("") || '<p class="small">No conversations yet.</p>'}</div>`;
      document.getElementById("tf2").onsubmit = (e) => {
        e.preventDefault();
        G.save(db => db.tickets.unshift({ id: G.uid("tk"), userId: u.id, subject: document.getElementById("tsub").value, message: document.getElementById("tmsg").value, status: "open", at: G.now() }));
        G.toast("Message sent. Our team will reply.");
        view();
      };
    }
    if (tab === "profile") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">My profile</h1><p>These details appear on your quotations.</p>
        <div class="card"><form id="pf" class="form-grid">
          <div><label class="f">Full name</label><input id="pn" value="${G.esc(u.name)}"></div>
          <div><label class="f">Phone</label><input id="pp" value="${G.esc(u.phone || "")}"></div>
          <div><label class="f">Email</label><input id="pe" value="${G.esc(u.email)}" disabled></div>
          <div><label class="f">Country</label><select id="pc">${m.d.countries.map(c => `<option value="${c.code}" ${c.code === u.country ? "selected" : ""}>${c.name}</option>`).join("")}</select></div>
          <div><label class="f">Preferred currency</label><select id="pcur">${Object.keys(m.d.currencies).map(c => `<option ${c === u.currency ? "selected" : ""}>${c}</option>`).join("")}</select></div>
        </form><button class="btn primary" id="psave" style="margin-top:8px">Save changes</button></div>`;
      document.getElementById("psave").onclick = () => {
        G.save(db => { const x = db.users.find(y => y.id === u.id); x.name = document.getElementById("pn").value; x.phone = document.getElementById("pp").value; x.country = document.getElementById("pc").value; x.currency = document.getElementById("pcur").value; });
        localStorage.setItem("gad.cur", document.getElementById("pcur").value);
        G.toast("Profile saved.");
        G.mount("");
      };
    }
    if (tab === "notifications") {
      pane.innerHTML = `<h1 style="font-size:1.8rem">Notifications</h1><p>Order and shipment updates.</p>
      ${m.notes.map(n => `<div class="card" style="padding:14px"><p class="small" style="margin:0;color:#fff">${G.esc(n.text)}</p><p class="small" style="margin:4px 0 0">${G.when(n.at)}</p></div>`).join("") || '<div class="card"><p>No notifications yet.</p></div>'}`;
      G.save(db => db.notifications.filter(n => n.userId === u.id).forEach(n => n.read = true));
    }
  }
  nav(); view();
})();
'''
write("account.html", "My account — GLOBAL AUTO DIRECT", "Manage saved vehicles, import requests, orders, quotations, payments, shipping and documents.", DASH_HEAD, account_js)
