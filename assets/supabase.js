/* GLOBAL AUTO DIRECT — real database connector (Supabase/Postgres)
   Loaded before core.js. Two modes:
     • no config  → the app runs on its bundled demonstration data (banner shown)
     • configured → the app reads and writes the real Postgres tables, with Supabase Auth
   Only the publishable (anon) key ever reaches the browser. RLS does the guarding. */
(function () {
  const GAD = (window.GAD = window.GAD || {});
  const KEY = "gad.sb";
  const SB = (GAD.sb = {});

  SB.config = (() => {
    try {
      const own = JSON.parse(localStorage.getItem(KEY) || "null");
      if (own && own.url && own.key) return own;
    } catch (e) {}
    const shipped = window.GAD_SB_CFG;
    return shipped && shipped.url && shipped.key ? { url: String(shipped.url).replace(/\/+$/, ""), key: shipped.key, schema: shipped.schema || "gad" } : null;
  })();
  SB.on = !!(SB.config && SB.config.url && SB.config.key);
  SB.error = null;
  SB.session = (() => { try { return JSON.parse(localStorage.getItem("gad.sb.session") || "null"); } catch (e) { return null; } })();

  SB.saveConfig = function (url, key) {
    localStorage.setItem(KEY, JSON.stringify({ url: String(url).replace(/\/+$/, ""), key: String(key).trim(), schema: "gad" }));
    location.reload();
  };
  SB.disconnect = function () {
    localStorage.removeItem(KEY);
    localStorage.removeItem("gad.sb.session");
    location.reload();
  };

  function token() { return SB.session && SB.session.access_token ? SB.session.access_token : null; }
  function headers(extra) {
    const h = Object.assign({
      apikey: SB.config.key,
      "Content-Type": "application/json",
      "Accept-Profile": (SB.config && SB.config.schema) || "gad",
      "Content-Profile": (SB.config && SB.config.schema) || "gad",
    }, extra || {});
    const t = token() || SB.config.key;
    h.Authorization = "Bearer " + t;
    return h;
  }
  SB.rest = async function (path, opts) {
    const o = opts || {};
    const res = await fetch(SB.config.url + "/rest/v1/" + path, {
      method: o.method || "GET",
      headers: headers(o.headers),
      body: o.body ? JSON.stringify(o.body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new Error((o.method || "GET") + " " + path + " → " + res.status + " " + text.slice(0, 180));
    return text ? JSON.parse(text) : null;
  };

  /* ───────── auth (Supabase Auth, bcrypt on the server) ───────── */
  SB.signIn = async function (email, password) {
    const res = await fetch(SB.config.url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: SB.config.key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error_description || data.msg || "Sign in failed." };
    SB.session = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
    localStorage.setItem("gad.sb.session", JSON.stringify(SB.session));
    const prof = await SB.rest("profiles?select=*&id=eq." + data.user.id).then((r) => r[0]).catch(() => null);
    return { ok: true, user: mapProfile(prof, data.user), session: SB.session };
  };
  SB.signUp = async function (data) {
    const res = await fetch(SB.config.url + "/auth/v1/signup", {
      method: "POST",
      headers: { apikey: SB.config.key, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email, password: data.password,
        data: { full_name: data.name, phone: data.phone || "", role: data.role || "customer" },
      }),
    });
    const body = await res.json();
    if (!res.ok) return { ok: false, error: body.msg || body.error_description || "Could not create the account." };
    if (body.access_token) {
      SB.session = { access_token: body.access_token, user: body.user };
      localStorage.setItem("gad.sb.session", JSON.stringify(SB.session));
    }
    return { ok: true, needsConfirm: !body.access_token, user: body.user };
  };
  SB.signOut = function () {
    localStorage.removeItem("gad.sb.session");
    SB.session = null;
    location.href = "index.html";
  };
  function mapProfile(p, u) {
    if (!p) return { id: u.id, name: (u.user_metadata && u.user_metadata.full_name) || u.email, email: u.email, role: "customer", currency: "UGX" };
    return {
      id: p.id, name: p.full_name || u.email, email: p.email || u.email, phone: p.phone || "",
      role: p.role, status: p.status, country: p.country_code || "UG",
      currency: p.currency || "UGX", supplierId: p.supplier_id || null,
    };
  }

  /* ───────── column maps: app shape ⇄ Postgres ───────── */
  const M = {
    vehicles: {
      table: "vehicles",
      to: (v) => ({
        legacy_id: v.id, title: v.title, brand: v.brand, model: v.model, year: v.year || null,
        category: v.category, price_usd: v.priceUsd, currency: v.currency || "USD",
        mileage_km: v.mileageKm || null, engine_cc: v.engineCc || null, fuel: v.fuel,
        transmission: v.transmission, drivetrain: v.drivetrain, exterior: v.exterior,
        interior: v.interior, condition: v.condition, vin: v.vin,
        origin_code: v.origin || null, images: v.images || [], specifications: v.specs || {},
        video_url: v.videoUrl || null, export_available: !!v.exportAvailable,
        shipping_usd: v.shippingUsd || 0, delivery_days: v.deliveryDays || 0,
        destinations: v.destinations || ["UG"], featured: !!v.featured,
        is_demo: !!v.demo, status: v.status || "published",
      }),
      from: (r) => ({
        id: r.legacy_id || r.id, dbId: r.id, title: r.title, brand: r.brand, model: r.model,
        year: r.year, category: r.category, priceUsd: Number(r.price_usd), currency: r.currency,
        mileageKm: r.mileage_km, engineCc: r.engine_cc, fuel: r.fuel, transmission: r.transmission,
        drivetrain: r.drivetrain, exterior: r.exterior, interior: r.interior, condition: r.condition,
        vin: r.vin, origin: r.origin_code, images: r.images || [], specs: r.specifications || {},
        exportAvailable: r.export_available, shippingUsd: Number(r.shipping_usd || 0),
        deliveryDays: r.delivery_days, destinations: r.destinations || ["UG"],
        featured: r.featured, demo: r.is_demo, status: r.status, created_at: r.created_at,
        supplierId: r.supplier_id, art: (r.images || [])[0] || "",
        grade: (r.specifications || {}).grade || null,
      }),
    },
    suppliers: {
      table: "suppliers",
      to: (s) => ({
        legacy_id: s.id, name: s.name, country_code: s.country || null, city: s.city || null,
        contact_email: s.email || null, contact_phone: s.phone || null,
        status: String(s.status || "pending").replace(/-/g, "_"), rating: s.rating || 0,
      }),
      from: (r) => ({
        id: r.legacy_id || r.id, dbId: r.id, name: r.name, country: r.country_code, city: r.city,
        email: r.contact_email, phone: r.contact_phone, status: String(r.status).replace(/_/g, "-"),
        rating: Number(r.rating || 0), since: r.created_at,
      }),
    },
    requests: {
      table: "requests",
      to: (x) => ({
        code: x.code, full_name: x.fullName || x.name, email: x.email, phone: x.phone || null,
        dest_code: x.dest || x.destination || null, origin_code: x.origin || null,
        brand: x.brand, model: x.model, year: x.year || null, condition: x.condition,
        budget_usd: x.budgetUsd || x.budget || null, requirements: x.notes || x.requirements || null,
        status: x.status || "new",
      }),
      from: (r) => ({
        id: r.code, dbId: r.id, code: r.code, name: r.full_name, fullName: r.full_name,
        email: r.email, phone: r.phone, dest: r.dest_code, origin: r.origin_code, brand: r.brand,
        model: r.model, year: r.year, condition: r.condition, budgetUsd: Number(r.budget_usd || 0),
        notes: r.requirements, status: r.status, created_at: r.created_at, user_id: r.user_id,
      }),
    },
    orders: {
      table: "orders",
      to: (o) => ({
        code: o.code, vehicle_id: o.vehicleDbId || null, stage: o.stage,
        dest_code: o.dest || null, origin_code: o.origin || null,
        total_usd: o.totalUsd || null, currency: o.currency || "USD",
      }),
      from: (r) => ({
        id: r.code, dbId: r.id, code: r.code, vehicleId: r.vehicle_legacy_id || r.vehicle_id,
        stage: r.stage, dest: r.dest_code, origin: r.origin_code, totalUsd: Number(r.total_usd || 0),
        currency: r.currency, user_id: r.user_id, created_at: r.created_at,
      }),
    },
    quotations: {
      table: "quotations",
      to: (q) => ({
        code: q.code, breakdown: q.lines || q.breakdown || [], total_usd: q.totalUsd,
        currency: q.currency || "USD", status: q.status || "sent", valid_until: q.validUntil || null,
      }),
      from: (r) => ({
        id: r.code, dbId: r.id, code: r.code, lines: r.breakdown, totalUsd: Number(r.total_usd),
        currency: r.currency, status: r.status, validUntil: r.valid_until,
        created_at: r.created_at, user_id: r.user_id,
      }),
    },
    payments: {
      table: "payments",
      to: (p) => ({
        order_id: p.orderDbId || null, kind: p.kind || "deposit", amount: p.amountUsd || p.amount,
        currency: p.currency || "USD", method: p.method || null, reference: p.reference || null,
        status: p.status || "pending",
      }),
      from: (r) => ({
        id: r.id, orderId: r.order_id, kind: r.kind, amountUsd: Number(r.amount),
        currency: r.currency, method: r.method, reference: r.reference, status: r.status,
        confirmed_at: r.confirmed_at, created_at: r.created_at, user_id: r.user_id,
      }),
    },
    shipments: {
      table: "shipments",
      to: (s) => ({
        order_id: s.orderDbId || null, container_no: s.container || null, bl_reference: s.bl || null,
        vessel: s.vessel || null, origin_port: s.originPort || null, dest_port: s.destPort || null,
        shipping_company: s.carrier || null, etd: s.etd || null, eta: s.eta || null,
        status: s.status || "booked",
      }),
      from: (r) => ({
        id: r.id, orderId: r.order_id, container: r.container_no, bl: r.bl_reference,
        vessel: r.vessel, originPort: r.origin_port, destPort: r.dest_port, carrier: r.shipping_company,
        etd: r.etd, eta: r.eta, status: r.status, created_at: r.created_at,
        events: r.tracking_events || [],
      }),
    },
    notifications: {
      table: "notifications",
      to: (n) => ({ title: n.title, body: n.body || null, link: n.link || null, read: !!n.read }),
      from: (r) => ({ id: r.id, title: r.title, body: r.body, link: r.link, read: r.read, created_at: r.created_at }),
    },
    tickets: {
      table: "tickets",
      to: (t) => ({ subject: t.subject, body: t.body || null, status: t.status || "open", reply: t.reply || null }),
      from: (r) => ({ id: r.id, subject: r.subject, body: r.body, status: r.status, reply: r.reply, created_at: r.created_at }),
    },
    audits: {
      table: "audit_logs",
      to: (a) => ({ action: a.action, entity: a.entity || null, entity_id: a.entityId || null, actor_email: a.actor || null }),
      from: (r) => ({ id: r.id, actor: r.actor_email, action: r.action, entity: r.entity, entityId: r.entity_id, at: r.created_at }),
    },
    countries: {
      table: "countries",
      to: (c) => ({
        code: c.code, name: c.name, kind: c.kind || "destination",
        currency: c.currency || "USD", port: c.port || null, capital: c.capital || null, flag: c.flag || null,
        max_age_years: c.regs ? c.regs.maxAge || null : c.maxAgeYears || null,
        right_hand_drive: c.rightHand !== false,
        port_handling_usd: c.portHandling || 0, clearance_usd: c.clearance || 0,
        local_delivery_usd: c.localDelivery || 0, rules_verified: !!c.verified, notes: c.note || null,
      }),
      from: (r) => ({
        code: r.code, name: r.name, flag: r.flag, currency: r.currency, port: r.port,
        capital: r.capital, portHandling: Number(r.port_handling_usd || 0),
        clearance: Number(r.clearance_usd || 0), localDelivery: Number(r.local_delivery_usd || 0),
        rightHand: r.right_hand_drive, verified: r.rules_verified,
        regs: { maxAge: r.max_age_years, rightHand: r.right_hand_drive }, note: r.notes, kind: r.kind,
      }),
    },
    taxRules: {
      table: "tax_rules",
      mapperId: "id",
      to: (t) => ({
        id: t.id, country_code: t.country, duty_pct: t.dutyPct, vat_pct: t.vatPct,
        excise_tiers: t.exciseTiers || [], verified: !!t.verified, source_note: t.note || null,
      }),
      from: (r) => ({
        id: r.id, country: r.country_code, dutyPct: Number(r.duty_pct), vatPct: Number(r.vat_pct),
        exciseTiers: r.excise_tiers || [], verified: r.verified, note: r.source_note,
        effectiveFrom: r.effective_from,
      }),
    },
  };
  SB.map = M;

  /* ───────── hydrate the app from the real database ───────── */
  SB.load = async function () {
    const g = (q) => SB.rest(q).catch(() => []);
    const [countries, currencies, taxRules, routes, suppliers, vehicles] = await Promise.all([
      g("countries?select=*"), g("currencies?select=*"), g("tax_rules?select=*"),
      g("shipping_routes?select=*"), g("suppliers?select=*"), g("vehicles?select=*&order=created_at.desc"),
    ]);
    const dest = {}, origins = [];
    for (const r of countries) {
      const c = M.countries.from(r);
      if (r.kind === "origin") {
        const rt = routes.find((x) => x.origin_code === r.code && x.dest_code === "UG") || routes.find((x) => x.origin_code === r.code) || {};
        origins.push(Object.assign(c, {
          sea: Number(rt.sea_usd || 0), air: Number(rt.air_usd || 0),
          seaDays: rt.sea_days || 0, airDays: rt.air_days || 0,
          docs: Number(rt.export_docs_usd || 0), inland: Number(rt.inland_usd || 0),
          inspectionPct: Number(rt.inspection_pct || 0.02),
        }));
      } else {
        dest[r.code] = c;
      }
    }
    const cur = {};
    for (const r of currencies) cur[r.code] = { name: r.name, symbol: r.symbol, rate: Number(r.rate_to_usd) };
    return {
      countries: dest, origins, currencies: cur,
      taxRules: taxRules.map(M.taxRules.from),
      suppliers: suppliers.map(M.suppliers.from),
      vehicles: vehicles.map(M.vehicles.from),
      users: [], requests: [], orders: [], quotations: [], payments: [], shipments: [],
      notifications: [], tickets: [], documents: [], audits: [], settings: {},
    };
  };

  /* synchronous hydration used during page boot */
  SB.loadSync = function () {
    const xhr = function (path) {
      const x = new XMLHttpRequest();
      x.open("GET", SB.config.url + "/rest/v1/" + path, false);
      const h = headers();
      Object.keys(h).forEach((k) => x.setRequestHeader(k, h[k]));
      x.send(null);
      if (x.status >= 400) throw new Error(path + " → " + x.status + " " + String(x.responseText).slice(0, 140));
      return x.responseText ? JSON.parse(x.responseText) : [];
    };
    const countries = xhr("countries?select=*");
    const currencies = xhr("currencies?select=*");
    const taxRules = xhr("tax_rules?select=*");
    const routes = xhr("shipping_routes?select=*");
    const suppliers = xhr("suppliers?select=*");
    const vehicles = xhr("vehicles?select=*&order=created_at.desc");

    const dest = {}, origins = [];
    for (const r of countries) {
      const c = M.countries.from(r);
      if (r.kind === "origin") {
        const rt = routes.find((x) => x.origin_code === r.code && x.dest_code === "UG") || routes.find((x) => x.origin_code === r.code) || {};
        origins.push(Object.assign(c, {
          sea: Number(rt.sea_usd || 0), air: Number(rt.air_usd || 0),
          seaDays: rt.sea_days || 0, airDays: rt.air_days || 0,
          docs: Number(rt.export_docs_usd || 0), inland: Number(rt.inland_usd || 0),
          inspectionPct: Number(rt.inspection_pct || 0.02),
        }));
      } else {
        dest[r.code] = c;
      }
    }
    const cur = {};
    for (const r of currencies) cur[r.code] = { name: r.name, symbol: r.symbol, rate: Number(r.rate_to_usd) };
    SB.raw = { countries, suppliers, vehicles };
    return {
      countries: dest, origins, currencies: cur,
      taxRules: taxRules.map(M.taxRules.from),
      suppliers: suppliers.map(M.suppliers.from),
      vehicles: vehicles.map(M.vehicles.from),
      users: [], requests: [], orders: [], quotations: [], payments: [], shipments: [],
      notifications: [], tickets: [], documents: [], audits: [], settings: {},
    };
  };

  /* keep the demo dataset around so a fresh database can be seeded from the UI */
  SB.pushMissing = async function (appDb) {
    const out = { vehicles: 0, suppliers: 0, taxRules: 0, countries: 0 };
    for (const c of Object.values(appDb.countries || {})) {
      await SB.rest("countries?on_conflict=code", { method: "POST", body: M.countries.to(c),
        headers: { Prefer: "resolution=merge-duplicates" } }).catch(() => {});
      out.countries++;
    }
    for (const s of appDb.suppliers || []) {
      await SB.rest("suppliers?on_conflict=legacy_id", { method: "POST", body: M.suppliers.to(s),
        headers: { Prefer: "resolution=merge-duplicates" } }).catch(() => {});
      out.suppliers++;
    }
    for (const v of appDb.vehicles || []) {
      await SB.rest("vehicles?on_conflict=legacy_id", { method: "POST", body: M.vehicles.to(v),
        headers: { Prefer: "resolution=merge-duplicates" } }).catch(() => {});
      out.vehicles++;
    }
    for (const t of appDb.taxRules || []) {
      await SB.rest("tax_rules?on_conflict=id", { method: "POST", body: M.taxRules.to(t),
        headers: { Prefer: "resolution=merge-duplicates" } }).catch(() => {});
      out.taxRules++;
    }
    return out;
  };

  SB.status = async function () {
    if (!SB.on) return { mode: "demo" };
    try {
      const v = await SB.rest("vehicles?select=id&limit=1");
      return { mode: "live", reachable: true, count: (v || []).length };
    } catch (e) {
      return { mode: "live", reachable: false, error: String(e.message).slice(0, 160) };
    }
  };
})();
