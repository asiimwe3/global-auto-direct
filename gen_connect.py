# -*- coding: utf-8 -*-
exec(open("gen_public.py").read().split("# ─────────────────────────────── HOME")[0])

body = '''
<section class="block" style="padding-top:34px"><div class="wrap narrow">
  <span class="eyebrow">Data connection</span>
  <h1 style="margin:10px 0 6px">Connect your real database</h1>
  <p class="lead">This platform ships with a full production schema for Supabase (Postgres). Until a database is connected it runs on bundled demonstration data, clearly labelled. Connect it once and every visitor, order and listing lives in your own database.</p>

  <div class="card pad" style="margin:22px 0">
    <h3 style="margin-top:0">Status</h3>
    <div id="sbstatus" class="muted">Checking…</div>
  </div>

  <div class="card pad" style="margin:22px 0">
    <h3 style="margin-top:0">Step 1 — create the database</h3>
    <ol class="steps" style="margin:12px 0 6px">
      <li><b>Create a Supabase project</b> at supabase.com (free tier is fine to start).</li>
      <li>Open <b>SQL Editor</b> and run <code>supabase/schema.sql</code> from this repository. It creates 20 tables, 45 row-level-security policies, roles and triggers.</li>
      <li>Run <code>supabase/seed.sql</code> to load the starting catalogue, countries, tax rules and shipping routes as real rows you own and can edit.</li>
      <li>Create your staff accounts in <b>Authentication → Users</b>, then set each person's role in the <code>profiles</code> table (superadmin, sales, finance, logistics, agent, supplier, customer).</li>
    </ol>
    <p class="muted" style="margin:0">Both files live in the <code>supabase</code> folder of the repository. They are safe to re-run.</p>
  </div>

  <div class="card pad" style="margin:22px 0">
    <h3 style="margin-top:0">Step 2 — paste your connection details</h3>
    <p class="muted">Use the <b>publishable / anon</b> key only. Never paste a secret or service_role key into a browser: it bypasses every security rule.</p>
    <form id="sbf" style="margin-top:14px">
      <label class="fl">PROJECT URL</label>
      <input id="sburl" class="input" placeholder="https://your-project.supabase.co" autocomplete="off">
      <label class="fl" style="margin-top:12px">PUBLISHABLE (ANON) KEY</label>
      <input id="sbkey" class="input" placeholder="eyJhbGciOi..." autocomplete="off">
      <div id="sbmsg" class="muted" style="margin-top:12px"></div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <button class="btn" type="submit">Test and connect</button>
        <button class="btn ghost" type="button" id="sboff">Disconnect and use demo data</button>
      </div>
    </form>
  </div>

  <div class="card pad" style="margin:22px 0">
    <h3 style="margin-top:0">What changes once connected</h3>
    <div class="grid2" style="margin-top:12px">
      <div><h4>Real records</h4><p class="muted" style="margin:4px 0">Listings, requests, quotations, orders, payments and shipments are rows in Postgres, shared by everyone, not one browser's memory.</p></div>
      <div><h4>Real accounts</h4><p class="muted" style="margin:4px 0">Sign-in moves to Supabase Auth with server-side password hashing. Roles come from the profiles table.</p></div>
      <div><h4>Real security</h4><p class="muted" style="margin:4px 0">Row-level security enforces it in the database: a customer cannot read another customer's order even if they call the API directly.</p></div>
      <div><h4>Real files</h4><p class="muted" style="margin:4px 0">Inspection reports and customer documents go to a private storage bucket, readable only by the owner and staff.</p></div>
    </div>
  </div>
</div></section>
'''

script = '''
<script>
(async function(){
  const box = document.getElementById("sbstatus");
  const SB = window.GAD.sb;
  if (!SB) { box.textContent = "Connector not loaded."; return; }
  if (!SB.on) {
    box.innerHTML = '<span class="chip warn">Demo data</span> No database connected yet, so the site runs on bundled demonstration data.';
  } else {
    box.innerHTML = '<span class="chip">Checking…</span>';
    const st = await SB.status();
    box.innerHTML = st.reachable
      ? '<span class="chip ok">Live</span> Connected to <code>' + SB.config.url.replace(/^https:\\/\\//, "") + '</code>. Reads and writes go to your Postgres database.'
      : '<span class="chip warn">Not reachable</span> ' + (st.error || "The database did not answer.");
    document.getElementById("sburl").value = SB.config.url;
    document.getElementById("sbkey").value = SB.config.key;
  }
  document.getElementById("sbf").addEventListener("submit", async function(e){
    e.preventDefault();
    const url = document.getElementById("sburl").value.trim();
    const key = document.getElementById("sbkey").value.trim();
    const msg = document.getElementById("sbmsg");
    if (!/^https:\\/\\/[a-z0-9-]+\\.supabase\\.co$/i.test(url.replace(/\\/$/, ""))) {
      msg.innerHTML = '<span class="chip warn">Check the URL</span> It should look like https://your-project.supabase.co';
      return;
    }
    if (!key) { msg.textContent = "The publishable key is required."; return; }
    msg.textContent = "Testing the connection…";
    try {
      const r = await fetch(url.replace(/\\/$/, "") + "/rest/v1/vehicles?select=id&limit=1", { headers: { apikey: key, Authorization: "Bearer " + key } });
      if (!r.ok) {
        const t = await r.text();
        msg.innerHTML = '<span class="chip warn">Failed</span> ' + r.status + " " + t.slice(0, 120) + " — check the key and that schema.sql has been run.";
        return;
      }
      msg.innerHTML = '<span class="chip ok">Connected</span> Saving…';
      setTimeout(function(){ window.GAD.sb.saveConfig(url, key); }, 600);
    } catch (err) {
      msg.innerHTML = '<span class="chip warn">Failed</span> ' + err.message;
    }
  });
  document.getElementById("sboff").addEventListener("click", function(){ window.GAD.sb.disconnect(); });
})();
</script>
'''

page = HEAD.format(title="Connect your database — GLOBAL AUTO DIRECT",
  desc="Connect a Supabase Postgres database to GLOBAL AUTO DIRECT to replace demonstration data with real listings, orders and accounts.",
  url="https://asiimwe3.github.io/global-auto-direct/connect.html",
  jsonld='{"@context":"https://schema.org","@type":"WebPage","name":"Connect your database","isPartOf":{"@type":"WebSite","name":"GLOBAL AUTO DIRECT"}}',
  body=body, script=script)
open("connect.html", "w").write(page)
print("wrote connect.html", len(page))
