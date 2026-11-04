/* GLOBAL AUTO DIRECT — seed data (all inventory is clearly labelled demonstration data) */
window.GAD_SEED = function () {
  /* representative artwork: clean vector vehicle cards, no fake photography */
  function art(kind, seed) {
    const pal = [["#0B1B33", "#123E8F"], ["#101B2E", "#1D5FD1"], ["#0A1424", "#2E7DFF"], ["#0F1A2B", "#3B4B70"]];
    const p = pal[seed % pal.length];
    const glyph = {
      car: '<path d="M60 300 L110 235 Q125 215 155 213 L305 213 Q335 215 350 235 L400 300" fill="none" stroke="#DCE6F7" stroke-width="9" stroke-linejoin="round"/><path d="M60 300 L400 300" stroke="#DCE6F7" stroke-width="9"/><circle cx="125" cy="305" r="30" fill="none" stroke="#9DB4D6" stroke-width="9"/><circle cx="335" cy="305" r="30" fill="none" stroke="#9DB4D6" stroke-width="9"/><path d="M150 240 L200 240 L200 265 L135 265" stroke="#7EA6E0" stroke-width="7" fill="none"/>',
      suv: '<path d="M55 305 L100 225 Q115 205 150 203 L320 203 Q352 205 366 228 L405 300" fill="none" stroke="#DCE6F7" stroke-width="9" stroke-linejoin="round"/><path d="M55 305 L405 305" stroke="#DCE6F7" stroke-width="9"/><circle cx="122" cy="310" r="33" fill="none" stroke="#9DB4D6" stroke-width="9"/><circle cx="342" cy="310" r="33" fill="none" stroke="#9DB4D6" stroke-width="9"/><path d="M120 250 L200 232 L330 232 L330 268 L120 268 Z" fill="none" stroke="#7EA6E0" stroke-width="6"/>',
      pickup: '<path d="M55 305 L95 235 Q108 220 140 219 L245 219 L265 200 L370 200 L392 240 L410 300" fill="none" stroke="#DCE6F7" stroke-width="9" stroke-linejoin="round"/><path d="M55 305 L410 305" stroke="#DCE6F7" stroke-width="9"/><circle cx="120" cy="310" r="32" fill="none" stroke="#9DB4D6" stroke-width="9"/><circle cx="345" cy="310" r="32" fill="none" stroke="#9DB4D6" stroke-width="9"/>',
      moto: '<circle cx="130" cy="300" r="44" fill="none" stroke="#DCE6F7" stroke-width="9"/><circle cx="350" cy="300" r="44" fill="none" stroke="#DCE6F7" stroke-width="9"/><path d="M130 300 L215 235 L300 235 L350 300 M215 235 L250 300 L330 300" fill="none" stroke="#9DB4D6" stroke-width="8" stroke-linejoin="round"/><path d="M300 235 L335 196 L372 205" fill="none" stroke="#7EA6E0" stroke-width="8"/>',
      bus: '<rect x="70" y="175" width="330" height="130" rx="16" fill="none" stroke="#DCE6F7" stroke-width="9"/><path d="M100 205 L200 205 L200 250 L100 250 Z M220 205 L330 205 L330 250 L220 250 Z" fill="none" stroke="#7EA6E0" stroke-width="6"/><circle cx="130" cy="312" r="30" fill="none" stroke="#9DB4D6" stroke-width="9"/><circle cx="345" cy="312" r="30" fill="none" stroke="#9DB4D6" stroke-width="9"/>',
      machine: '<rect x="90" y="230" width="150" height="90" rx="10" fill="none" stroke="#DCE6F7" stroke-width="9"/><path d="M240 250 L330 210 L370 250 L300 280" fill="none" stroke="#9DB4D6" stroke-width="9" stroke-linejoin="round"/><circle cx="140" cy="330" r="34" fill="none" stroke="#9DB4D6" stroke-width="9"/><circle cx="320" cy="330" r="30" fill="none" stroke="#9DB4D6" stroke-width="9"/>',
      part: '<circle cx="230" cy="250" r="70" fill="none" stroke="#DCE6F7" stroke-width="10"/><circle cx="230" cy="250" r="26" fill="none" stroke="#7EA6E0" stroke-width="8"/><path d="M230 180 L230 150 M230 350 L230 320 M160 250 L130 250 M300 250 L330 250 M181 201 L159 179 M301 321 L279 299 M279 201 L301 179 M159 321 L181 299" stroke="#9DB4D6" stroke-width="8"/>',
    }[kind] || "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 380"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs><rect width="460" height="380" fill="url(#g)"/><circle cx="392" cy="66" r="120" fill="rgba(255,255,255,.05)"/><circle cx="58" cy="330" r="90" fill="rgba(0,0,0,.18)"/><g opacity=".95">${glyph}</g><text x="26" y="44" fill="rgba(255,255,255,.5)" font-family="Inter,system-ui" font-size="15" font-weight="600" letter-spacing="3">GLOBAL AUTO DIRECT</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  const currencies = {
    USD: { rate: 1, symbol: "$", name: "US Dollar" },
    UGX: { rate: 3800, symbol: "UGX", name: "Ugandan Shilling" },
    EUR: { rate: 0.92, symbol: "€", name: "Euro" },
    GBP: { rate: 0.79, symbol: "£", name: "Pound" },
    JPY: { rate: 157, symbol: "¥", name: "Japanese Yen" },
    AED: { rate: 3.67, symbol: "AED", name: "UAE Dirham" },
    CNY: { rate: 7.2, symbol: "CNY", name: "Chinese Yuan" },
    KRW: { rate: 1380, symbol: "₩", name: "Korean Won" },
  };

  const origins = [
    { code: "JP", name: "Japan", flag: "🇯🇵", port: "Yokohama", inland: 260, docs: 220, sea: 1250, air: 4800, seaDays: 44, airDays: 8, inspectionPct: 0.02, note: "Largest used-vehicle export market; auction grades and inspection reports available." },
    { code: "CN", name: "China", flag: "🇨🇳", port: "Shanghai", inland: 180, docs: 200, sea: 980, air: 4200, seaDays: 38, airDays: 7, inspectionPct: 0.02, note: "Strong on new EVs, motorcycles and commercial vehicles. CCC certification required for some units." },
    { code: "DE", name: "Germany", flag: "🇩🇪", port: "Hamburg", inland: 320, docs: 240, sea: 1380, air: 5300, seaDays: 48, airDays: 8, inspectionPct: 0.025, note: "Premium European brands with full service history; TÜV reports supplied where available." },
    { code: "KR", name: "South Korea", flag: "🇰🇷", port: "Busan", inland: 220, docs: 210, sea: 1150, air: 4600, seaDays: 42, airDays: 8, inspectionPct: 0.02, note: "Well-maintained domestic vehicles, strong on Hyundai and Kia." },
    { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", port: "Jebel Ali", inland: 160, docs: 190, sea: 820, air: 3600, seaDays: 26, airDays: 5, inspectionPct: 0.02, note: "Gulf-spec vehicles, fastest sea route to East Africa." },
    { code: "US", name: "United States", flag: "🇺🇸", port: "Baltimore", inland: 360, docs: 260, sea: 1520, air: 5700, seaDays: 55, airDays: 9, inspectionPct: 0.025, note: "Pickups and heavy vehicles; mileage in miles, left-hand drive." },
  ];

  const countries = [
    { code: "UG", name: "Uganda", flag: "🇺🇬", currency: "UGX", capital: "Kampala", port: "Mombasa", portHandling: 380, clearance: 420, localDelivery: 450, rightHand: true, verified: true,
      regs: "Vehicles must be right-hand drive. Used vehicles over 15 years from year of manufacture are restricted. URA valuation applies to the CIF value.",
      ports: ["Mombasa", "Dar es Salaam"], routes: ["Japan → Mombasa", "China → Mombasa", "UAE → Mombasa", "Germany → Mombasa", "Korea → Mombasa", "USA → Mombasa"] },
    { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "USD", capital: "Nairobi", port: "Mombasa", portHandling: 340, clearance: 380, localDelivery: 300, rightHand: true, verified: false,
      regs: "Right-hand drive only. KEBS pre-export verification required. Used vehicle age limit 8 years. Rates here are indicative and unverified — confirm with a licensed clearing agent.",
      ports: ["Mombasa"], routes: ["Japan → Mombasa", "UAE → Mombasa"] },
    { code: "TZ", name: "Tanzania", flag: "🇹🇿", currency: "USD", capital: "Dar es Salaam", port: "Dar es Salaam", portHandling: 320, clearance: 360, localDelivery: 280, rightHand: true, verified: false,
      regs: "Right-hand drive. TBS standards apply. Used vehicle age limit 10 years. Rates indicative and unverified.",
      ports: ["Dar es Salaam"], routes: ["Japan → Dar es Salaam", "China → Dar es Salaam"] },
    { code: "RW", name: "Rwanda", flag: "🇷🇼", currency: "USD", capital: "Kigali", port: "Dar es Salaam", portHandling: 300, clearance: 340, localDelivery: 420, rightHand: true, verified: false,
      regs: "Right-hand drive. Rwanda Revenue Authority valuation applies. Rates indicative and unverified.",
      ports: ["Dar es Salaam", "Mombasa"], routes: ["Japan → Dar es Salaam", "China → Dar es Salaam"] },
  ];

  const taxRules = [
    { id: "tax_ug", country: "UG", origin: "JP", dutyPct: 25, vatPct: 18, exciseTiers: [{ maxCc: 1000, pct: 10 }, { maxCc: 1500, pct: 20 }, { maxCc: 3000, pct: 30 }, { maxCc: 99999, pct: 35 }], maxAgeYears: 15, effectiveFrom: "2026-07-01", verified: true,
      note: "Uganda: 25% import duty, excise by engine size (10–35%), 18% VAT on CIF + duty + excise. Confirm current URA rates with a licensed clearing agent before issuing a final quotation." },
    { id: "tax_ug_cn", country: "UG", origin: "CN", dutyPct: 25, vatPct: 18, exciseTiers: [{ maxCc: 1000, pct: 10 }, { maxCc: 1500, pct: 20 }, { maxCc: 3000, pct: 30 }, { maxCc: 99999, pct: 35 }], maxAgeYears: 15, effectiveFrom: "2026-07-01", verified: true,
      note: "Same Uganda tariff schedule applies to Chinese-origin units." },
    { id: "tax_ke", country: "KE", origin: "JP", dutyPct: 25, vatPct: 16, exciseTiers: [{ maxCc: 1500, pct: 20 }, { maxCc: 3000, pct: 30 }, { maxCc: 99999, pct: 35 }], maxAgeYears: 8, effectiveFrom: "2026-07-01", verified: false,
      note: "Kenya rates are indicative and unverified. CRSP and KEBS requirements apply." },
    { id: "tax_tz", country: "TZ", origin: "JP", dutyPct: 25, vatPct: 18, exciseTiers: [{ maxCc: 1000, pct: 5 }, { maxCc: 2000, pct: 10 }, { maxCc: 99999, pct: 20 }], maxAgeYears: 10, effectiveFrom: "2026-07-01", verified: false,
      note: "Tanzania rates are indicative and unverified." },
    { id: "tax_rw", country: "RW", origin: "JP", dutyPct: 25, vatPct: 18, exciseTiers: [{ maxCc: 1000, pct: 5 }, { maxCc: 3000, pct: 15 }, { maxCc: 99999, pct: 20 }], maxAgeYears: 10, effectiveFrom: "2026-07-01", verified: false,
      note: "Rwanda rates are indicative and unverified." },
  ];

  const suppliers = [
    { id: "sup_jp1", name: "Sakura Auto Export", country: "JP", city: "Yokohama", status: "verified", since: "2019", rating: 4.8, vehicles: 0, docs: ["Export licence", "JEVIC inspection"], contact: "export@sakuraauto.example" },
    { id: "sup_cn1", name: "Shenzhen Global Motors", country: "CN", city: "Shenzhen", status: "verified", since: "2020", rating: 4.6, vehicles: 0, docs: ["Export licence", "CCC certificates"], contact: "sales@shenzhenglobal.example" },
    { id: "sup_de1", name: "Rhein Fahrzeughandel", country: "DE", city: "Hamburg", status: "verified", since: "2017", rating: 4.7, vehicles: 0, docs: ["Handelsregister", "TÜV reports"], contact: "export@rheinfahrzeug.example" },
    { id: "sup_kr1", name: "Hanul Trading", country: "KR", city: "Busan", status: "under-review", since: "2021", rating: 4.2, vehicles: 0, docs: ["Export licence"], contact: "trade@hanul.example" },
    { id: "sup_ae1", name: "Gulf Star Motors", country: "AE", city: "Dubai", status: "verified", since: "2018", rating: 4.5, vehicles: 0, docs: ["Trade licence", "RTA export clearance"], contact: "sales@gulfstar.example" },
    { id: "sup_us1", name: "Atlantic Auto Exports", country: "US", city: "Baltimore", status: "pending", since: "2022", rating: 4.1, vehicles: 0, docs: ["State dealer licence"], contact: "export@atlanticauto.example" },
  ];

  const V = (o) => Object.assign({ demo: true, status: "published", currency: "USD", images: [], exportAvailable: true, videoInspection: true }, o);
  const vehicles = [
    V({ id: "v1", title: "Toyota Land Cruiser Prado TX-L", brand: "Toyota", model: "Prado TX-L", year: 2019, mileageKm: 64500, engineCc: 2700, fuel: "Petrol", transmission: "Automatic", drivetrain: "4WD", exterior: "Pearl White", interior: "Black leather", condition: "Used — excellent", vin: "JTEBH9FJ0KK000101", origin: "JP", supplierId: "sup_jp1", priceUsd: 34500, category: "suvs", featured: true, shipEstimateUsd: 1250, deliveryDays: 50, destinations: ["UG", "KE"], art: art("suv", 1), grade: "4.5 / JEVIC inspected" }),
    V({ id: "v2", title: "Toyota Vitz",
      brand: "Toyota", model: "Vitz", year: 2017, mileageKm: 89000, engineCc: 1000, fuel: "Petrol", transmission: "Automatic", drivetrain: "2WD", exterior: "Silver", interior: "Grey cloth", condition: "Used — good", vin: "KSP130-0099112", origin: "JP", supplierId: "sup_jp1", priceUsd: 6300, category: "cars", featured: true, shipEstimateUsd: 1250, deliveryDays: 48, destinations: ["UG"], art: art("car", 2), grade: "4.0 / JEVIC inspected" }),
    V({ id: "v3", title: "Nissan X-Trail 20X", brand: "Nissan", model: "X-Trail 20X", year: 2018, mileageKm: 78200, engineCc: 2000, fuel: "Petrol", transmission: "Automatic", drivetrain: "4WD", exterior: "Diamond Black", interior: "Black half leather", condition: "Used — very good", vin: "NT32-233418", origin: "JP", supplierId: "sup_jp1", priceUsd: 15800, category: "suvs", featured: true, shipEstimateUsd: 1250, deliveryDays: 50, destinations: ["UG", "RW"], art: art("suv", 3), grade: "4.5 / JEVIC inspected" }),
    V({ id: "v4", title: "Toyota Hilux Double Cab", brand: "Toyota", model: "Hilux Revo", year: 2020, mileageKm: 52000, engineCc: 2400, fuel: "Diesel", transmission: "Automatic", drivetrain: "4WD", exterior: "Attitude Black", interior: "Black fabric", condition: "Used — excellent", vin: "MR0HA8CD400998877", origin: "AE", supplierId: "sup_ae1", priceUsd: 28900, category: "pickups", featured: true, shipEstimateUsd: 820, deliveryDays: 30, destinations: ["UG", "KE", "TZ"], art: art("pickup", 4), grade: "Gulf spec, accident free" }),
    V({ id: "v5", title: "Zongshen RX3 Adventure 250", brand: "Zongshen", model: "RX3 250", year: 2025, mileageKm: 0, engineCc: 250, fuel: "Petrol", transmission: "Manual", drivetrain: "Chain", exterior: "Matte Black", interior: "—", condition: "New", vin: "ZS250RX3000911", origin: "CN", supplierId: "sup_cn1", priceUsd: 2450, category: "zongshen", featured: true, shipEstimateUsd: 980, deliveryDays: 42, destinations: ["UG", "KE", "TZ", "RW"], art: art("moto", 5), grade: "Factory new, crate packed" }),
    V({ id: "v6", title: "Zongshen Cyclone 400", brand: "Zongshen", model: "Cyclone 400", year: 2025, mileageKm: 0, engineCc: 400, fuel: "Petrol", transmission: "Manual", drivetrain: "Chain", exterior: "Racing Red", interior: "—", condition: "New", vin: "ZS400CY000341", origin: "CN", supplierId: "sup_cn1", priceUsd: 3180, category: "zongshen", shipEstimateUsd: 980, deliveryDays: 42, destinations: ["UG", "KE"], art: art("moto", 6) }),
    V({ id: "v7", title: "BYD Seal 550km Electric", brand: "BYD", model: "Seal", year: 2025, mileageKm: 1200, engineCc: 0, fuel: "Electric", transmission: "Automatic", drivetrain: "RWD", exterior: "Atlantis Grey", interior: "White vegan leather", condition: "New", vin: "LC0C74C45P0011223", origin: "CN", supplierId: "sup_cn1", priceUsd: 26800, category: "electric-cars", featured: true, shipEstimateUsd: 980, deliveryDays: 42, destinations: ["UG"], art: art("car", 7), grade: "82.5 kWh battery, 150 kW motor" }),
    V({ id: "v8", title: "Tesla Model 3 Long Range", brand: "Tesla", model: "Model 3", year: 2021, mileageKm: 41000, engineCc: 0, fuel: "Electric", transmission: "Automatic", drivetrain: "AWD", exterior: "Deep Blue", interior: "Black", condition: "Used — very good", vin: "5YJ3E1EB6MF000812", origin: "US", supplierId: "sup_us1", priceUsd: 23400, category: "electric-cars", shipEstimateUsd: 1520, deliveryDays: 58, destinations: ["UG"], art: art("car", 8) }),
    V({ id: "v9", title: "Mercedes-Benz C200 AMG Line", brand: "Mercedes-Benz", model: "C200", year: 2019, mileageKm: 58000, engineCc: 1500, fuel: "Petrol", transmission: "Automatic", drivetrain: "RWD", exterior: "Obsidian Black", interior: "Black Artico", condition: "Used — excellent", vin: "WDD2050801A556677", origin: "DE", supplierId: "sup_de1", priceUsd: 27600, category: "cars", featured: true, shipEstimateUsd: 1380, deliveryDays: 52, destinations: ["UG", "KE"], art: art("car", 9), grade: "Full service history, TÜV to 2027" }),
    V({ id: "v10", title: "Volkswagen Golf 8 1.4 TSI", brand: "Volkswagen", model: "Golf 8", year: 2021, mileageKm: 34000, engineCc: 1400, fuel: "Petrol", transmission: "Automatic", drivetrain: "FWD", exterior: "Pure White", interior: "Grey", condition: "Used — excellent", vin: "WVWZZZAUZMW334455", origin: "DE", supplierId: "sup_de1", priceUsd: 19950, category: "cars", shipEstimateUsd: 1380, deliveryDays: 52, destinations: ["UG"], art: art("car", 10) }),
    V({ id: "v11", title: "BMW X5 xDrive40i", brand: "BMW", model: "X5", year: 2020, mileageKm: 49000, engineCc: 3000, fuel: "Petrol", transmission: "Automatic", drivetrain: "AWD", exterior: "Mineral White", interior: "Cognac leather", condition: "Used — excellent", vin: "WBAJV210X0B123456", origin: "AE", supplierId: "sup_ae1", priceUsd: 41200, category: "suvs", shipEstimateUsd: 820, deliveryDays: 30, destinations: ["UG"], art: art("suv", 11) }),
    V({ id: "v12", title: "Hyundai Tucson 1.6 T-GDi", brand: "Hyundai", model: "Tucson", year: 2021, mileageKm: 38000, engineCc: 1600, fuel: "Petrol", transmission: "Automatic", drivetrain: "AWD", exterior: "Shimmering Silver", interior: "Black cloth", condition: "Used — very good", vin: "KMHJ3817BMU112233", origin: "KR", supplierId: "sup_kr1", priceUsd: 18700, category: "suvs", shipEstimateUsd: 1150, deliveryDays: 46, destinations: ["UG"], art: art("suv", 12) }),
    V({ id: "v13", title: "Kia Sportage 2.0 CRDi", brand: "Kia", model: "Sportage", year: 2020, mileageKm: 61000, engineCc: 2000, fuel: "Diesel", transmission: "Automatic", drivetrain: "AWD", exterior: "Gravity Grey", interior: "Black", condition: "Used — good", vin: "KNAPM81ABLK223344", origin: "KR", supplierId: "sup_kr1", priceUsd: 16400, category: "suvs", shipEstimateUsd: 1150, deliveryDays: 46, destinations: ["UG", "TZ"], art: art("suv", 13) }),
    V({ id: "v14", title: "Toyota Hiace Super GL 14-seater", brand: "Toyota", model: "Hiace", year: 2018, mileageKm: 143000, engineCc: 3000, fuel: "Diesel", transmission: "Manual", drivetrain: "RWD", exterior: "White", interior: "Grey vinyl", condition: "Used — good", vin: "KDF-KDH201-0099887", origin: "JP", supplierId: "sup_jp1", priceUsd: 17200, category: "buses", shipEstimateUsd: 1250, deliveryDays: 50, destinations: ["UG"], art: art("bus", 14) }),
    V({ id: "v15", title: "Yutong ZK6722 32-seater", brand: "Yutong", model: "ZK6722", year: 2024, mileageKm: 8000, engineCc: 4000, fuel: "Diesel", transmission: "Manual", drivetrain: "RWD", exterior: "White / Blue", interior: "Cloth", condition: "New", vin: "LZYTCB2Z3R1000567", origin: "CN", supplierId: "sup_cn1", priceUsd: 46800, category: "buses", shipEstimateUsd: 980, deliveryDays: 42, destinations: ["UG", "KE"], art: art("bus", 15) }),
    V({ id: "v16", title: "Isuzu NQR 75 Service Truck", brand: "Isuzu", model: "NQR 75", year: 2019, mileageKm: 198000, engineCc: 5200, fuel: "Diesel", transmission: "Manual", drivetrain: "RWD", exterior: "White", interior: "Grey", condition: "Used — fair", vin: "JAANQR75LJ7001122", origin: "AE", supplierId: "sup_ae1", priceUsd: 21800, category: "commercial", shipEstimateUsd: 820, deliveryDays: 30, destinations: ["UG"], art: art("pickup", 16) }),
    V({ id: "v17", title: "Ford F-150 XLT 4x4", brand: "Ford", model: "F-150", year: 2019, mileageKm: 96000, engineCc: 3500, fuel: "Petrol", transmission: "Automatic", drivetrain: "4WD", exterior: "Magnetic Grey", interior: "Black cloth", condition: "Used — good", vin: "1FTEW1EP4KFA12345", origin: "US", supplierId: "sup_us1", priceUsd: 24700, category: "pickups", shipEstimateUsd: 1520, deliveryDays: 58, destinations: ["UG"], art: art("pickup", 17), grade: "Left-hand drive — check destination rules" }),
    V({ id: "v18", title: "Komatsu PC200-8 Excavator", brand: "Komatsu", model: "PC200-8", year: 2016, mileageKm: 9200, engineCc: 6500, fuel: "Diesel", transmission: "Hydraulic", drivetrain: "Tracked", exterior: "Yellow", interior: "Cab", condition: "Used — working", vin: "KMTPC200K8C077788", origin: "JP", supplierId: "sup_jp1", priceUsd: 38500, category: "heavy-machinery", shipEstimateUsd: 2400, deliveryDays: 55, destinations: ["UG"], art: art("machine", 18) }),
    V({ id: "v19", title: "JCB 3CX Backhoe Loader", brand: "JCB", model: "3CX", year: 2018, mileageKm: 5400, engineCc: 4400, fuel: "Diesel", transmission: "Manual", drivetrain: "4WD", exterior: "Yellow", interior: "Cab", condition: "Used — working", vin: "JCB3CX4WS0123456", origin: "AE", supplierId: "sup_ae1", priceUsd: 29800, category: "heavy-machinery", shipEstimateUsd: 1800, deliveryDays: 34, destinations: ["UG"], art: art("machine", 19) }),
    V({ id: "v20", title: "Bajaj Boxer 150", brand: "Bajaj", model: "Boxer 150", year: 2025, mileageKm: 0, engineCc: 150, fuel: "Petrol", transmission: "Manual", drivetrain: "Chain", exterior: "Black / Red", interior: "—", condition: "New", vin: "MD2A11CZ5RWA12345", origin: "AE", supplierId: "sup_ae1", priceUsd: 1180, category: "motorcycles", shipEstimateUsd: 640, deliveryDays: 28, destinations: ["UG", "KE", "TZ"], art: art("moto", 20) }),
    V({ id: "v21", title: "Electric Moto 3000W Cargo", brand: "Volt Motors", model: "EM-3000", year: 2025, mileageKm: 0, engineCc: 0, fuel: "Electric", transmission: "Automatic", drivetrain: "Hub motor", exterior: "White", interior: "—", condition: "New", vin: "VM3000EM000765", origin: "CN", supplierId: "sup_cn1", priceUsd: 1290, category: "electric-motorcycles", shipEstimateUsd: 780, deliveryDays: 42, destinations: ["UG"], art: art("moto", 21) }),
    V({ id: "v22", title: "Haval H6 2.0T AWD", brand: "Haval", model: "H6", year: 2024, mileageKm: 6200, engineCc: 2000, fuel: "Petrol", transmission: "Automatic", drivetrain: "AWD", exterior: "Hamilton White", interior: "Black leather", condition: "New", vin: "LGWEF6A55RH123456", origin: "CN", supplierId: "sup_cn1", priceUsd: 22400, category: "suvs", shipEstimateUsd: 980, deliveryDays: 42, destinations: ["UG"], art: art("suv", 22) }),
    V({ id: "v23", title: "Toyota Coaster 30-seater", brand: "Toyota", model: "Coaster", year: 2017, mileageKm: 168000, engineCc: 4200, fuel: "Diesel", transmission: "Manual", drivetrain: "RWD", exterior: "White", interior: "Grey", condition: "Used — good", vin: "BZB70-0011223", origin: "JP", supplierId: "sup_jp1", priceUsd: 26400, category: "buses", shipEstimateUsd: 1250, deliveryDays: 50, destinations: ["UG"], art: art("bus", 23) }),
    V({ id: "v24", title: "Genuine Toyota Brake Pad Set (Prado 150)", brand: "Toyota", model: "Prado 150 pads", year: 2026, mileageKm: 0, engineCc: 0, fuel: "—", transmission: "—", drivetrain: "—", exterior: "—", interior: "—", condition: "New", vin: "—", origin: "AE", supplierId: "sup_ae1", priceUsd: 78, category: "spare-parts", shipEstimateUsd: 120, deliveryDays: 20, destinations: ["UG"], art: art("part", 24), express: true }),
  ];

  vehicles.forEach((v) => { const s = suppliers.find((x) => x.id === v.supplierId); if (s) s.vehicles += 1; });

  const users = [
    { id: "usr_admin", name: "Platform Administrator", email: "admin@globalautodirect.com", phone: "+256700000001", role: "superadmin", status: "active", country: "UG", currency: "UGX", passwordHash: "c5bd4096188234bac4fbb4b85fc4eff581a3bef25fef6d9843dc96713e3ec37f", created_at: "2026-09-01T08:00:00.000Z" },
    { id: "usr_sales", name: "Sales Manager", email: "sales@globalautodirect.com", phone: "+256700000002", role: "sales", status: "active", country: "UG", currency: "UGX", passwordHash: "1548dbda3b0f73db726809d1789395fc25fd4ecdd3842268b65b6864d04de597", created_at: "2026-09-01T08:05:00.000Z" },
    { id: "usr_fin", name: "Finance Officer", email: "finance@globalautodirect.com", phone: "+256700000003", role: "finance", status: "active", country: "UG", currency: "UGX", passwordHash: "056c3e6fda6c2c7ad5b764562e07563a98d8c89af93b819bb51747cfad3afd18", created_at: "2026-09-01T08:06:00.000Z" },
    { id: "usr_log", name: "Logistics Manager", email: "logistics@globalautodirect.com", phone: "+256700000004", role: "logistics", status: "active", country: "UG", currency: "UGX", passwordHash: "0eabce1082ce63602d53bb60e0f21ace95f26090c576acd3f370d31395dfebc3", created_at: "2026-09-01T08:07:00.000Z" },
    { id: "usr_supplier", name: "Sakura Auto Export", email: "supplier@globalautodirect.com", phone: "+81900000000", role: "supplier", status: "active", country: "JP", currency: "USD", supplierId: "sup_jp1", passwordHash: "848c4ffa17345ca1ea12759a6c2c34134eb0309151f32cfaf4d8323ba12acc4a", created_at: "2026-09-02T09:00:00.000Z" },
    { id: "usr_customer", name: "Amina Kobusingye", email: "customer@demo.com", phone: "+256762306675", role: "customer", status: "active", country: "UG", currency: "UGX", passwordHash: "23f8cd0692212234d9fa39dccc27c28be00bafc54c899af941fbe90b1476632c", created_at: "2026-09-10T10:00:00.000Z" },
  ];

  const orders = [
    {
      id: "ord_1001", code: "GAD-2026-1001", customerId: "usr_customer", vehicleId: "v1", stage: "In transit", currency: "UGX",
      totalUsd: 48210, depositUsd: 14463, createdAt: "2026-09-14T09:00:00.000Z",
      log: [
        { at: "2026-09-14T09:00:00.000Z", by: "usr_customer", text: "Enquiry received for Toyota Land Cruiser Prado TX-L" },
        { at: "2026-09-14T14:20:00.000Z", by: "usr_sales", text: "Availability confirmed with Sakura Auto Export" },
        { at: "2026-09-15T10:10:00.000Z", by: "usr_sales", text: "Supplier verified — licence and JEVIC inspection on file" },
        { at: "2026-09-15T16:00:00.000Z", by: "usr_sales", text: "Quotation GAD-Q-5521 prepared and sent" },
        { at: "2026-09-16T08:30:00.000Z", by: "usr_customer", text: "Customer approved quotation" },
        { at: "2026-09-17T11:00:00.000Z", by: "usr_fin", text: "Deposit received — bank reference BT-99331 (30%)" },
        { at: "2026-09-18T09:00:00.000Z", by: "usr_sales", text: "Vehicle purchased from supplier" },
        { at: "2026-09-21T13:00:00.000Z", by: "usr_log", text: "Third-party inspection completed — JEVIC grade 4.5" },
        { at: "2026-09-25T09:00:00.000Z", by: "usr_log", text: "Export documentation completed" },
        { at: "2026-09-28T09:00:00.000Z", by: "usr_log", text: "Shipment booked on vessel GRAND DAWN V.214" },
        { at: "2026-10-02T06:00:00.000Z", by: "usr_log", text: "Vessel departed Yokohama" },
        { at: "2026-10-20T12:00:00.000Z", by: "usr_log", text: "In transit — Indian Ocean, ETA Mombasa 12 Nov" },
      ],
    },
    {
      id: "ord_1002", code: "GAD-2026-1002", customerId: "usr_customer", vehicleId: "v5", stage: "Quotation prepared", currency: "UGX",
      totalUsd: 3720, depositUsd: 0, createdAt: "2026-10-21T11:00:00.000Z",
      log: [
        { at: "2026-10-21T11:00:00.000Z", by: "usr_customer", text: "Enquiry received for Zongshen RX3 Adventure 250" },
        { at: "2026-10-21T15:00:00.000Z", by: "usr_sales", text: "Availability confirmed with Shenzhen Global Motors" },
        { at: "2026-10-22T09:00:00.000Z", by: "usr_sales", text: "Supplier verified" },
        { at: "2026-10-22T17:00:00.000Z", by: "usr_sales", text: "Quotation GAD-Q-5534 prepared and sent" },
      ],
    },
  ];

  const quotes = [
    { id: "q_5521", orderId: "ord_1001", customerId: "usr_customer", vehicleId: "v1", origin: "JP", dest: "UG", totalUsd: 48210, currency: "UGX", status: "approved", createdAt: "2026-09-15T16:00:00.000Z", validUntil: "2026-10-15" },
    { id: "q_5534", orderId: "ord_1002", customerId: "usr_customer", vehicleId: "v5", origin: "CN", dest: "UG", totalUsd: 3720, currency: "UGX", status: "sent", createdAt: "2026-10-22T17:00:00.000Z", validUntil: "2026-11-22" },
  ];

  const shipments = [
    { id: "shp_1", orderId: "ord_1001", shippingCompany: "Grand Dawn Shipping", container: "GESU-4471220", billOfLading: "GDS-2026-8871", vessel: "GRAND DAWN V.214", departurePort: "Yokohama", arrivalPort: "Mombasa", etd: "2026-10-02", eta: "2026-11-12", status: "In transit",
      events: [
        { at: "2026-09-28", text: "Container stuffed and sealed at Yokohama export yard" },
        { at: "2026-10-02", text: "Vessel departed Yokohama" },
        { at: "2026-10-20", text: "Reported in transit — Indian Ocean" },
      ],
      trackingNote: "Manual updates by our logistics team. Live vessel API not connected yet." },
  ];

  const requests = [
    { id: "req_8801", code: "GAD-REQ-8801", userId: "usr_customer", name: "Amina Kobusingye", email: "customer@demo.com", phone: "+256762306675", destCountry: "UG", origin: "JP", brand: "Subaru", model: "Forester XT", year: 2020, condition: "Used", budgetUsd: 18000, notes: "Prefer white, sunroof if possible.", files: [], status: "quoted", createdAt: "2026-10-18T10:00:00.000Z" },
  ];

  const notifications = [
    { id: "nt1", userId: "usr_customer", text: "Your shipment GAD-2026-1001 is in transit. ETA Mombasa 12 Nov 2026.", read: false, at: "2026-10-20T12:05:00.000Z" },
  ];

  const audits = [
    { id: "aud_1", actor: "usr_admin", action: "Seeded demonstration data", entity: "platform", entityId: "-", at: "2026-11-01T08:00:00.000Z" },
  ];

  /* ── brand new 2026 stock: factory-fresh, zero mileage, manufacturer warranty ── */
  const brandNew = [
    V({ id: "v25", title: "Toyota Land Cruiser 300 VX", brand: "Toyota", model: "Land Cruiser 300 VX", year: 2026, mileageKm: 0, engineCc: 3500, fuel: "Petrol", transmission: "Automatic", drivetrain: "4WD", exterior: "Precious White", interior: "Black leather", condition: "New", vin: "JTMHV05J204000125", origin: "JP", supplierId: "sup_jp1", priceUsd: 96500, category: "suvs", featured: true, shipEstimateUsd: 1450, deliveryDays: 55, destinations: ["UG", "KE", "TZ"], art: art("suv", 25), grade: "Factory new, 3 year warranty" }),
    V({ id: "v26", title: "Toyota Hilux Double Cab 2.8 Legend", brand: "Toyota", model: "Hilux Legend", year: 2026, mileageKm: 0, engineCc: 2800, fuel: "Diesel", transmission: "Automatic", drivetrain: "4WD", exterior: "Attitude Black", interior: "Black leather", condition: "New", vin: "AHTKB3CD502600811", origin: "JP", supplierId: "sup_jp1", priceUsd: 48900, category: "pickups", featured: true, shipEstimateUsd: 1450, deliveryDays: 55, destinations: ["UG", "KE", "RW"], art: art("pickup", 26), grade: "Factory new, 3 year warranty" }),
    V({ id: "v27", title: "Toyota Hiace Super GL 13 Seater", brand: "Toyota", model: "Hiace Super GL", year: 2026, mileageKm: 0, engineCc: 2800, fuel: "Diesel", transmission: "Automatic", drivetrain: "RWD", exterior: "Super White", interior: "Grey fabric", condition: "New", vin: "TRH2002601177", origin: "JP", supplierId: "sup_jp1", priceUsd: 42700, category: "buses", featured: false, shipEstimateUsd: 1450, deliveryDays: 58, destinations: ["UG", "KE"], art: art("bus", 27), grade: "Factory new, 3 year warranty" }),
    V({ id: "v28", title: "Isuzu D-Max 3.0 LSE Double Cab", brand: "Isuzu", model: "D-Max LSE", year: 2026, mileageKm: 0, engineCc: 3000, fuel: "Diesel", transmission: "Automatic", drivetrain: "4WD", exterior: "Sapphire Blue", interior: "Black leather", condition: "New", vin: "MPATFS40JRT600042", origin: "AE", supplierId: "sup_ae1", priceUsd: 37200, category: "pickups", featured: false, shipEstimateUsd: 900, deliveryDays: 30, destinations: ["UG", "TZ"], art: art("pickup", 28), grade: "Factory new, 3 year warranty" }),
    V({ id: "v29", title: "Isuzu FRR 90 Cargo Truck", brand: "Isuzu", model: "FRR 90", year: 2026, mileageKm: 0, engineCc: 5190, fuel: "Diesel", transmission: "Manual", drivetrain: "RWD", exterior: "White", interior: "Grey", condition: "New", vin: "JAANPR75LR7002211", origin: "JP", supplierId: "sup_jp1", priceUsd: 51800, category: "commercial", featured: false, shipEstimateUsd: 1750, deliveryDays: 60, destinations: ["UG", "KE"], art: art("machine", 29), grade: "Factory new" }),
    V({ id: "v30", title: "BYD Seal 5 EV Luxury", brand: "BYD", model: "Seal 5", year: 2026, mileageKm: 0, engineCc: 0, fuel: "Electric", transmission: "Automatic", drivetrain: "RWD", exterior: "Atlantis Grey", interior: "Black vegan leather", condition: "New", vin: "LC0CE4CC1S0117766", origin: "CN", supplierId: "sup_cn1", priceUsd: 28400, category: "electric-cars", featured: true, shipEstimateUsd: 1150, deliveryDays: 45, destinations: ["UG", "KE", "TZ"], art: art("car", 30), grade: "Factory new, 8 year battery warranty" }),
    V({ id: "v31", title: "BYD Atto 3 Extended Range", brand: "BYD", model: "Atto 3", year: 2026, mileageKm: 0, engineCc: 0, fuel: "Electric", transmission: "Automatic", drivetrain: "FWD", exterior: "Forest Green", interior: "Black leather", condition: "New", vin: "LC0C74C47S0099121", origin: "CN", supplierId: "sup_cn1", priceUsd: 26700, category: "electric-cars", featured: false, shipEstimateUsd: 1150, deliveryDays: 45, destinations: ["UG", "RW"], art: art("suv", 31), grade: "Factory new, 8 year battery warranty" }),
    V({ id: "v32", title: "Chery Tiggo 8 Pro Max", brand: "Chery", model: "Tiggo 8 Pro", year: 2026, mileageKm: 0, engineCc: 2000, fuel: "Petrol", transmission: "Automatic", drivetrain: "FWD", exterior: "Meteor Grey", interior: "Brown leather", condition: "New", vin: "LVVDB21B6SD003311", origin: "CN", supplierId: "sup_cn1", priceUsd: 24900, category: "suvs", featured: false, shipEstimateUsd: 1150, deliveryDays: 45, destinations: ["UG"], art: art("suv", 32), grade: "Factory new, 5 year warranty" }),
    V({ id: "v33", title: "Haval Jolion HEV Premium", brand: "Haval", model: "Jolion HEV", year: 2026, mileageKm: 0, engineCc: 1500, fuel: "Hybrid", transmission: "Automatic", drivetrain: "FWD", exterior: "Hamilton White", interior: "Black leather", condition: "New", vin: "LGWEE4A41SD208844", origin: "CN", supplierId: "sup_cn1", priceUsd: 19800, category: "suvs", featured: false, shipEstimateUsd: 1150, deliveryDays: 45, destinations: ["UG", "KE"], art: art("suv", 33), grade: "Factory new, 5 year warranty" }),
    V({ id: "v34", title: "Hyundai Tucson 1.6T Premium", brand: "Hyundai", model: "Tucson", year: 2026, mileageKm: 0, engineCc: 1600, fuel: "Petrol", transmission: "Automatic", drivetrain: "AWD", exterior: "Amazon Grey", interior: "Black leather", condition: "New", vin: "KMHJB81DMSU112233", origin: "KR", supplierId: "sup_kr1", priceUsd: 31200, category: "suvs", featured: false, shipEstimateUsd: 1200, deliveryDays: 42, destinations: ["UG"], art: art("suv", 34), grade: "Factory new, 5 year warranty" }),
    V({ id: "v35", title: "Kia Sportage GT-Line", brand: "Kia", model: "Sportage GT-Line", year: 2026, mileageKm: 0, engineCc: 1600, fuel: "Petrol", transmission: "Automatic", drivetrain: "AWD", exterior: "Snow White Pearl", interior: "Black suede", condition: "New", vin: "KNAPU81BDS7441120", origin: "KR", supplierId: "sup_kr1", priceUsd: 29800, category: "suvs", featured: false, shipEstimateUsd: 1200, deliveryDays: 42, destinations: ["UG", "RW"], art: art("suv", 35), grade: "Factory new, 5 year warranty" }),
    V({ id: "v36", title: "Mercedes-Benz C200 AMG Line", brand: "Mercedes-Benz", model: "C200 AMG Line", year: 2026, mileageKm: 0, engineCc: 2000, fuel: "Petrol", transmission: "Automatic", drivetrain: "RWD", exterior: "Obsidian Black", interior: "Black Artico", condition: "New", vin: "W1KAF4HB1SR203344", origin: "DE", supplierId: "sup_de1", priceUsd: 58900, category: "cars", featured: true, shipEstimateUsd: 1550, deliveryDays: 60, destinations: ["UG", "KE"], art: art("car", 36), grade: "Factory new, 2 year warranty" }),
    V({ id: "v37", title: "BMW 320i M Sport", brand: "BMW", model: "320i M Sport", year: 2026, mileageKm: 0, engineCc: 2000, fuel: "Petrol", transmission: "Automatic", drivetrain: "RWD", exterior: "Alpine White", interior: "Black Sensatec", condition: "New", vin: "WBA5R1C09SFJ88901", origin: "DE", supplierId: "sup_de1", priceUsd: 52400, category: "cars", featured: false, shipEstimateUsd: 1550, deliveryDays: 60, destinations: ["UG"], art: art("car", 37), grade: "Factory new, 2 year warranty" }),
    V({ id: "v38", title: "Volkswagen Polo 1.0 TSI", brand: "Volkswagen", model: "Polo TSI", year: 2026, mileageKm: 0, engineCc: 1000, fuel: "Petrol", transmission: "Automatic", drivetrain: "FWD", exterior: "Kings Red", interior: "Grey cloth", condition: "New", vin: "WVWZZZAWZSY002211", origin: "DE", supplierId: "sup_de1", priceUsd: 19600, category: "cars", featured: false, shipEstimateUsd: 1550, deliveryDays: 60, destinations: ["UG"], art: art("car", 38), grade: "Factory new, 2 year warranty" }),
    V({ id: "v39", title: "Ford Ranger Wildtrak 2.0 BiTurbo", brand: "Ford", model: "Ranger Wildtrak", year: 2026, mileageKm: 0, engineCc: 2000, fuel: "Diesel", transmission: "Automatic", drivetrain: "4WD", exterior: "Luxe Yellow", interior: "Black leather", condition: "New", vin: "AFAPXXMJ2PSW12009", origin: "US", supplierId: "sup_us1", priceUsd: 44300, category: "pickups", featured: false, shipEstimateUsd: 1600, deliveryDays: 62, destinations: ["UG", "KE"], art: art("pickup", 39), grade: "Factory new, 3 year warranty" }),
    V({ id: "v40", title: "Zongshen RX6 600 Adventure", brand: "Zongshen", model: "RX6 600", year: 2026, mileageKm: 0, engineCc: 600, fuel: "Petrol", transmission: "Manual", drivetrain: "Chain", exterior: "Desert Tan", interior: "—", condition: "New", vin: "ZS600RX6S0012277", origin: "CN", supplierId: "sup_cn1", priceUsd: 6450, category: "zongshen", featured: true, shipEstimateUsd: 980, deliveryDays: 40, destinations: ["UG", "KE", "TZ", "RW"], art: art("moto", 40), grade: "Factory new, 2 year warranty" }),
    V({ id: "v41", title: "Zongshen ZS150 Cargo Tricycle", brand: "Zongshen", model: "ZS150 Tricycle", year: 2026, mileageKm: 0, engineCc: 150, fuel: "Petrol", transmission: "Manual", drivetrain: "Chain", exterior: "Blue", interior: "—", condition: "New", vin: "ZS150TRS0266118", origin: "CN", supplierId: "sup_cn1", priceUsd: 1780, category: "zongshen", featured: false, shipEstimateUsd: 940, deliveryDays: 40, destinations: ["UG", "TZ"], art: art("moto", 41), grade: "Factory new, 1 year warranty" }),
    V({ id: "v42", title: "Komatsu PC130-8 Excavator", brand: "Komatsu", model: "PC130-8", year: 2026, mileageKm: 0, engineCc: 4400, fuel: "Diesel", transmission: "Automatic", drivetrain: "Tracked", exterior: "Komatsu Yellow", interior: "Grey", condition: "New", vin: "KMTPC130CS000455", origin: "JP", supplierId: "sup_jp1", priceUsd: 128000, category: "heavy-machinery", featured: false, shipEstimateUsd: 2600, deliveryDays: 70, destinations: ["UG"], art: art("machine", 42), grade: "Factory new" })
  ];
  vehicles.push(...brandNew);

  return {
    version: 1,
    seededAt: new Date().toISOString(),
    currencies, origins, countries, taxRules, suppliers, vehicles, users, orders, quotes, shipments, requests, notifications, audits,
    documents: [
      { id: "doc_1", orderId: "ord_1001", name: "Commercial invoice.pdf", type: "Export document", uploadedBy: "usr_log", at: "2026-09-25T09:05:00.000Z", size: "142 KB" },
      { id: "doc_2", orderId: "ord_1001", name: "Bill of lading.pdf", type: "Shipping", uploadedBy: "usr_log", at: "2026-09-28T09:10:00.000Z", size: "98 KB" },
      { id: "doc_3", orderId: "ord_1001", name: "JEVIC inspection report.pdf", type: "Inspection", uploadedBy: "usr_log", at: "2026-09-21T13:10:00.000Z", size: "310 KB" },
    ],
    tickets: [
      { id: "tk_1", userId: "usr_customer", subject: "Port charges question", message: "Is the Mombasa port handling fee included in my quotation?", status: "open", at: "2026-10-23T09:00:00.000Z" },
    ],
    settings: {
      company: "GLOBAL AUTO DIRECT",
      tagline: "BUY ANYWHERE. DELIVERED WORLDWIDE.",
      supportEmail: "desk@globalautodirect.example",
      supportPhone: "+256 700 000 001",
      platformFeePct: 3,
      demoMode: true,
      currenciesEnabled: ["USD", "UGX", "EUR", "GBP", "AED"],
      integrations: {
        payments: "not connected — architecture ready",
        shippingApi: "not connected — manual updates in use",
        fxRates: "manual admin rates (updated 1 Nov 2026)",
        email: "not connected",
        whatsapp: "manual via support number",
      },
    },
  };
};
