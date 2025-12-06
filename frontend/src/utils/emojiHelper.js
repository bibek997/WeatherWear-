export const toEmoji = (text) => {
  if (!text) return "❓";
  const t = text.toLowerCase();

  // Tops
  if (t.includes("t-shirt") || t.includes("tshirt") || t.includes("shirt")) return "👕";
  if (t.includes("blouse")) return "👚";

  // Bottoms
  if (t.includes("jeans") || t.includes("chinos") || t.includes("pants")) return "👖";
  if (t.includes("shorts")) return "🩳";
  if (t.includes("skirt")) return "👗";

  // Outerwear
  if (t.includes("hoodie")) return "🧥";
  if (t.includes("jacket") || t.includes("coat") || t.includes("parka") || t.includes("puffer"))
    return "🧥";

  // Footwear
  if (t.includes("boots")) return "🥾";
  if (t.includes("sneakers") || t.includes("shoes")) return "👟";
  if (t.includes("sandals")) return "👡";
  if (t.includes("flip") || t.includes("flops")) return "🩴";

  // Accessories
  if (t.includes("umbrella")) return "☂️";
  if (t.includes("sunglasses")) return "🕶️";
  if (t.includes("beanie")) return "🧣";
  if (t.includes("scarf")) return "🧣";
  if (t.includes("hat")) return "🎩";
  if (t.includes("cap")) return "🧢";  

  return "❌"; 
};

