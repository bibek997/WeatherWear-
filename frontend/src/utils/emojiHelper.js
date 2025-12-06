// import { outfitEmoji } from "./emoji.map";

// export const getEmoji = (category) => outfitEmoji[category] || "👕";

// ../utils/emojiHelper.js
export const toEmoji = (text) => {
  if (!text) return '❓';
  text = text.toLowerCase();
  if (text.includes('shirt') || text.includes('tshirt')) return '👕';
  if (text.includes('pants') || text.includes('jeans')) return '👖';
  if (text.includes('shoes') || text.includes('sneakers')) return '👟';
  if (text.includes('hat')) return '🎩';
  if (text.includes('scarf')) return '🧣';
  if (text.includes('jacket') || text.includes('coat')) return '🧥';
  if (text.includes('shorts')) return '🩳';
  if (text.includes('skirt')) return '👗';
  if (text.includes('umbrella')) return '☂️';
  return '👚'; // fallback
};
