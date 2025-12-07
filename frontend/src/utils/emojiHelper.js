export const toEmoji = (text) => {
  if (!text) return "❓";
  const t = text.toLowerCase();

  // Tops
  if (t.includes("t-shirt") || t.includes("tshirt") || t.includes("shirt") || t.includes("tank_top") || t.includes("long_sleeve_tshirt") || t.includes("baby_tee"))
    return "👕";
  if (t.includes("blouse") || t.includes("sundresses"))
    return "👚";
  if (t.includes("sweater") || t.includes("wool_sweater"))
    return "🧶";
  if (t.includes("hoodie") || t.includes("jacket") || t.includes("coat") || t.includes("parka") || t.includes("puffer") || t.includes("quilted_jacket") || t.includes("insulated_jacket") || t.includes("down_jacket") || t.includes("fleece_jacket") || t.includes("light_jacket") || t.includes("light_cardigan") || t.includes("cardigan") || t.includes("windbreaker") || t.includes("trench_coat") || t.includes("medium_winter_jacket") || t.includes("winter_jacket") || t.includes("light_puffer_jacket") || t.includes("puffer_jacket") || t.includes("insulated_parka"))
    return "🧥";

  // Bottoms
  if (t.includes("jeans") || t.includes("chinos") || t.includes("pants") || t.includes("warm_pants") || t.includes("cotton_pants") || t.includes("sweatpants") || t.includes("pant") || t.includes("leggings") || t.includes("snow_pants"))
    return "👖";
  if (t.includes("shorts") || t.includes("knee_length_skirts") || t.includes("miniskirt"))
    return "🩳";
  if (t.includes("skirt") || t.includes("dress"))
    return "👗";

  // Footwear
  if (t.includes("boots") || t.includes("winter_boots") || t.includes("booties") || t.includes("gumboot") || t.includes("snow_boots") || t.includes("ankle_boots"))
    return "🥾";
  if (t.includes("sneakers") || t.includes("shoes"))
    return "👟";
  if (t.includes("sandals"))
    return "👡";
  if (t.includes("flip") || t.includes("flops"))
    return "🩴";

  // Accessories
  if (t.includes("umbrella") || t.includes("raincoat") || t.includes("waterproof_jacket"))
    return "☂️";
  if (t.includes("sunglasses"))
    return "🕶️";
  if (t.includes("beanie") || t.includes("warm_hat") || t.includes("thermal_hat") || t.includes("soft_cap") || t.includes("cap"))
    return "🧢";
  if (t.includes("scarf") || t.includes("gloves") || t.includes("insulated_gloves") || t.includes("warm_gloves"))
    return "🧣";
  if (t.includes("sherpa_topi"))
    return "🧢";
  if (t.includes("sun_hat"))
    return "👒";

  // Baby / onesie
  if (t.includes("onesie") || t.includes("short_sleeve_onesie") || t.includes("light_onesie") || t.includes("insulated_snowsuit") || t.includes("single_thin_layer"))
    return "👶";

  return "❌"; 
};
