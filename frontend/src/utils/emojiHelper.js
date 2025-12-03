import { garmentEmoji } from './emoji.map';

export function toEmoji(garment = '') {
  const key = garment.toLowerCase().trim();
  if (key === 'none') return '';      
  return garmentEmoji[key] || '🧥';       
}
export function emojifyOutfit(outfit) {
  return {
    topwear:    toEmoji(outfit.topwear),
    bottomwear: toEmoji(outfit.bottomwear),
    footwear:   toEmoji(outfit.footwear),
    accessory:  toEmoji(outfit.accessory),
  };
}