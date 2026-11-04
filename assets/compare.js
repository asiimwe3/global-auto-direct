/* floating compare bar shown when vehicles are ticked */
(function () {
  const G = window.GAD;
  function paint() {
    const ids = G.compareIds();
    let bar = document.getElementById("cmpbar");
    if (!ids.length) { if (bar) bar.remove(); return; }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "cmpbar";
      bar.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:78px;z-index:90;background:#0F2036;border:1px solid rgba(46,125,255,.5);border-radius:14px;padding:10px 14px;display:flex;gap:12px;align-items:center;box-shadow:0 18px 50px rgba(0,0,0,.5);font-size:.86rem";
      document.body.appendChild(bar);
    }
    bar.innerHTML = `<span>${ids.length} selected</span><a class="btn primary sm" href="compare.html?ids=${ids.join(",")}">Compare</a><button class="btn ghost sm" id="cmpclear">Clear</button>`;
    bar.querySelector("#cmpclear").onclick = () => { sessionStorage.setItem("gad.compare", "[]"); document.querySelectorAll("input.cmp").forEach(c => c.checked = false); paint(); };
  }
  document.addEventListener("gad:compare", paint);
  document.addEventListener("change", (e) => {
    if (e.target && e.target.classList && e.target.classList.contains("cmp")) { G.toggleCompare(e.target.dataset.id); }
  });
  document.addEventListener("DOMContentLoaded", paint);
  setTimeout(paint, 300);
})();
