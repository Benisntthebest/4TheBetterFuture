// ============================================================================
// FILE CẤU HÌNH ĐỒ HỌA RIÊNG (ĐÃ TÍCH HỢP SẴN ẢNH PNG TRONG THƯ MỤC assets/)
// ============================================================================

const GRAPHICS_ASSETS = {
  cars: [
    {
      id: "car_lv1",
      tier: 1,
      unlockAfterLevel: 0,
      name: "Xe Bình Thường",
      perk: "Tốc độ chuẩn (1.0x)",
      speedMultiplier: 1.0,
      image: "assets/car_lv1.png",
      scale: 0.90,
      rotationOffset: 0,
      fallbackColors: { body: "#f97316", dark: "#9a3412", glass: "#e0f2fe", glow: null }
    },
    {
      id: "car_lv2",
      tier: 2,
      unlockAfterLevel: 3,
      name: "Xe Sedan",
      perk: "Tốc độ +25% · Dáng trường êm ái",
      speedMultiplier: 1.25,
      image: "assets/car_lv2.png",
      scale: 0.94,
      rotationOffset: 0,
      fallbackColors: { body: "#0ea5e9", dark: "#0369a1", glass: "#fef08a", glow: "rgba(14,165,233,0.35)" }
    },
    {
      id: "car_lv3",
      tier: 3,
      unlockAfterLevel: 6,
      name: "Xe Xịn",
      perk: "Tốc độ +50% · Động cơ thể thao hạng sang",
      speedMultiplier: 1.5,
      image: "assets/car_lv3.png",
      scale: 0.96,
      rotationOffset: 0,
      fallbackColors: { body: "#8b5cf6", dark: "#4c1d95", glass: "#a5f3fc", glow: "rgba(139,92,246,0.4)" }
    },
    {
      id: "car_lv4",
      tier: 4,
      unlockAfterLevel: 9,
      name: "Siêu Xe",
      perk: "Siêu tốc (1.8x) · Cánh gió Carbon & Hào quang",
      speedMultiplier: 1.8,
      image: "assets/car_lv4.png",
      scale: 0.98,
      rotationOffset: 0,
      fallbackColors: { body: "#eab308", dark: "#854d0e", glass: "#ffffff", glow: "rgba(250,204,21,0.5)" }
    }
  ],
  objects: {
    home:   { image: "assets/home.png",   scale: 0.92 },
    star:   { image: "assets/star.png",   scale: 0.78 },
    rock:   { image: "assets/rock.png",   scale: 0.84 },
    puddle: { image: "assets/puddle.png", scale: 0.84 },
    bush:   { image: "assets/bush.png",   scale: 0.84 }
  },
  tiles: {
    lightImage: "",
    darkImage:  ""
  }
};

const LoadedSprites = {};

function loadAssetImage(key, src) {
  if (!src) return;
  const img = new Image();
  img.onload = () => { LoadedSprites[key] = img; };
  img.onerror = () => { delete LoadedSprites[key]; };
  img.src = src;
}

function initGraphicsAssets() {
  GRAPHICS_ASSETS.cars.forEach(car => loadAssetImage(car.id, car.image));
  Object.entries(GRAPHICS_ASSETS.objects).forEach(([key, cfg]) => {
    loadAssetImage(`obj_${key}`, cfg.image);
  });
  loadAssetImage("tile_light", GRAPHICS_ASSETS.tiles.lightImage);
  loadAssetImage("tile_dark", GRAPHICS_ASSETS.tiles.darkImage);
}
