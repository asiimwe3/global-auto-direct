#!/usr/bin/env python3
"""Harvest freely licensed vehicle photos from Wikimedia Commons into Supabase Storage.

Every image keeps its licence, author and source page so the site can credit it.
Resumable: progress is written to /tmp/photo_state.json and rows are skipped if
the storage path already exists.
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

REF = "hejyndudxtinigbvzolj"
BASE = f"https://{REF}.supabase.co"
SITE = "https://globalautodirect.vercel.app"
TOKEN = os.environ["SUPABASE_SERVICE_ROLE_KEY_2"].strip()
SVC = open("/tmp/svckey.txt").read().strip()
STATE = "/tmp/photo_state_repo.json"
UA = {"User-Agent": "GlobalAutoDirect/1.0 (vehicle catalogue; contact admin@globalautodirect.com)"}

# query, category, brand, model label, how many
MODELS = [
    ("farm tractor ploughing field", "tractors", "Generic", "Farm Tractor", 8),
    ("tractor with trailer harvest", "tractors", "Generic", "Utility Tractor", 6),
    ("forklift warehouse loading", "forklifts", "Generic", "Warehouse Forklift", 8),
    ("reach stacker container yard", "forklifts", "Generic", "Container Handler", 6),
    ("semi trailer truck highway", "trailers", "Generic", "Semi Trailer", 8),
    ("flatbed trailer cargo", "trailers", "Generic", "Flatbed Trailer", 6),
    ("coach bus highway travel", "buses", "Generic", "Coach Bus", 8),
    ("city bus passengers", "buses", "Generic", "City Bus", 6),
    ("minibus taxi africa", "minibuses", "Generic", "Minibus Taxi", 8),
    ("ambulance emergency vehicle", "ambulances", "Generic", "Ambulance", 8),
    ("tuk tuk street three wheeler", "three-wheelers", "Generic", "Tuk Tuk", 8),
    ("motor scooter city street", "scooters", "Generic", "City Scooter", 8),
    ("excavator construction site", "heavy-machinery", "Generic", "Excavator", 8),
    ("wheel loader quarry", "heavy-machinery", "Generic", "Wheel Loader", 6),
    ("dump truck construction", "heavy-trucks", "Generic", "Dump Truck", 8),
    ("cargo tricycle delivery", "electric-motorcycles", "Generic", "Cargo Tricycle", 6),
    ("delivery van city", "vans", "Generic", "Delivery Van", 8),
    ("box truck delivery", "light-trucks", "Generic", "Box Truck", 8),
]

OK_LICENSES = ("cc0", "public domain", "cc by", "cc-by", "cc by-sa", "cc-by-sa", "pd")


def load_state():
    try:
        return json.load(open(STATE))
    except Exception:
        return {"done": {}, "total": 0}


def save_state(s):
    json.dump(s, open(STATE, "w"))


def api(params):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def strip_html(v):
    return re.sub(r"<[^>]+>", "", v or "").strip()


def candidates(query, model, want):
    data = api({
        "action": "query", "format": "json", "generator": "search",
        "gsrnamespace": 6, "gsrlimit": 30, "gsrsearch": query,
        "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 640,
    })
    pages = list(data.get("query", {}).get("pages", {}).values())
    pages.sort(key=lambda p: p.get("index", 999))
    tokens = [t.lower() for t in (model.split() + query.split()) if len(t) > 2]
    out = []
    for p in pages:
        title = p.get("title", "")
        low = title.lower()
        if not any(t in low for t in tokens):
            continue
        if any(bad in low for bad in ("logo", "map", "diagram", "engine", "badge", "interior of building")):
            continue
        ii = (p.get("imageinfo") or [{}])[0]
        mime = ii.get("mime", "")
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            continue
        if (ii.get("width") or 0) < 800:
            continue
        md = ii.get("extmetadata", {})
        lic = (md.get("LicenseShortName", {}).get("value") or "").lower()
        if not any(k in lic for k in OK_LICENSES):
            continue
        out.append({
            "title": title,
            "thumb": ii.get("thumburl") or ii.get("url"),
            "source": ii.get("descriptionurl", ""),
            "credit": strip_html(md.get("Artist", {}).get("value"))[:120] or "Wikimedia Commons",
            "license": strip_html(md.get("LicenseShortName", {}).get("value")),
            "width": ii.get("width"),
            "height": ii.get("height"),
            "mime": mime,
        })
        if len(out) >= want:
            break
    return out


def upload_one(row, idx, category, slug):
    """Save the photo into the repo so Vercel serves it (storage API is timing out)."""
    ext = "png" if row["mime"] == "image/png" else "webp" if row["mime"] == "image/webp" else "jpg"
    rel = f"{category}/{slug}/{idx}.{ext}"
    dest = os.path.join("vehicle-photos-add", rel)
    try:
        req = urllib.request.Request(row["thumb"], headers=UA)
        with urllib.request.urlopen(req, timeout=45) as r:
            blob = r.read()
        if len(blob) < 8000 or len(blob) > 900000:
            return None
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as fh:
            fh.write(blob)
        return {
            "category": category, "brand": row["brand"], "model": row["model"],
            "storage_path": "repo:" + rel,
            "url": f"{SITE}/vehicle-photos-add/{rel}",
            "credit": row["credit"], "license": row["license"], "source_url": row["source"],
            "width": row["width"], "height": row["height"],
        }
    except Exception as e:
        print("  save fail", rel, str(e)[:80], flush=True)
        return None

def insert_rows(rows):
    if not rows:
        return
    data = json.dumps(rows).encode()
    req = urllib.request.Request(
        f"{BASE}/rest/v1/vehicle_photos", method="POST", data=data,
        headers={"apikey": SVC, "Authorization": "Bearer " + SVC,
                 "Content-Type": "application/json", "Content-Profile": "gad"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            print("  inserted", len(rows), "rows:", r.status, flush=True)
    except Exception as e:
        print("  insert error:", str(e)[:160], flush=True)



def main():
    state = load_state()
    budget = int(sys.argv[1]) if len(sys.argv) > 1 else 10_000
    started = time.time()
    harvested = 0
    for query, category, brand, model, want in MODELS:
        key = f"{category}|{model}"
        if state["done"].get(key):
            continue
        if harvested >= budget:
            break
        print(f"[{category}] {brand} {model}", flush=True)
        try:
            rows = candidates(query, model, want)
        except Exception as e:
            print("  search fail:", str(e)[:100], flush=True)
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", f"{brand}-{model}".lower()).strip("-")
        enriched = [dict(r, brand=brand, model=model) for r in rows]
        batch = []
        with ThreadPoolExecutor(max_workers=6) as pool:
            futs = [pool.submit(upload_one, row, i, category, slug) for i, row in enumerate(enriched)]
            for f in futs:
                got = f.result()
                if got:
                    batch.append(got)
        insert_rows(batch)
        state["done"][key] = len(batch)
        state["total"] = state.get("total", 0) + len(batch)
        save_state(state)
        harvested += len(batch)
        print(f"  -> {len(batch)} saved (running total {state['total']}), {int(time.time()-started)}s", flush=True)


if __name__ == "__main__":
    main()
