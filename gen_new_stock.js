// Emit idempotent SQL for the brand-new stock so the real database matches the bundled data.
global.window = {};
const path = process.argv[2];
require(path + "/assets/data.js");
const d = window.GAD_SEED();

const q = (v) => (v === null || v === undefined) ? "null"
  : typeof v === "number" ? String(v)
  : "'" + String(v).replace(/'/g, "''") + "'";
const arr = (a) => "'" + "{" + (a || []).map((x) => '"' + String(x).replace(/"/g, '') + '"').join(",") + "}" + "'::text[]";
const js = (o) => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";

const fresh = d.vehicles.filter((v) => Number(String(v.id).replace("v", "")) >= 25);
const rows = fresh.map((v) => `(
  ${q(v.id)}, ${q(v.title)}, ${q(v.brand)}, ${q(v.model)}, ${v.year},
  ${q(v.category)}, ${v.priceUsd}, ${q(v.currency || "USD")}, ${v.mileageKm},
  ${v.engineCc}, ${q(v.fuel)}, ${q(v.transmission)}, ${q(v.drivetrain)},
  ${q(v.exterior)}, ${q(v.interior)}, ${q(v.condition)}, ${q(v.vin)}, ${q(v.origin)},
  (select id from gad.suppliers where legacy_id = ${q(v.supplierId)}),
  ${js([v.art])}, ${js({ grade: v.grade || null, videoInspection: !!v.videoInspection })},
  null, ${v.exportAvailable ? "true" : "false"}, ${v.shipEstimateUsd}, ${v.deliveryDays},
  ${arr(v.destinations)}, ${v.featured ? "true" : "false"}, true, 'published'
)`).join(",\n");

const sql = `set search_path to gad, public;
insert into gad.vehicles
 (legacy_id,title,brand,model,year,category,price_usd,currency,mileage_km,engine_cc,fuel,
  transmission,drivetrain,exterior,interior,condition,vin,origin_code,supplier_id,images,
  specifications,video_url,export_available,shipping_usd,delivery_days,destinations,featured,is_demo,status)
values
${rows}
on conflict (legacy_id) do update set
  price_usd = excluded.price_usd, mileage_km = excluded.mileage_km,
  condition = excluded.condition, status = excluded.status, updated_at = now();
select count(*) as total,
       count(*) filter (where condition = 'New') as brand_new,
       count(*) filter (where condition <> 'New') as used
from gad.vehicles;`;

require("fs").writeFileSync(path + "/supabase/new-stock.sql", sql);
console.log("rows:", fresh.length, "| sql bytes:", sql.length);
