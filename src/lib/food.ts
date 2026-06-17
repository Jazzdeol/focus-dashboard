// Built-in calorie + protein estimator. Matches free-text food entries against
// a database of common foods and sums multiple items in one entry.

type FoodEntry = { kcal: number; p: number; unit?: 'g' | 'ml' | 'item' };
// kcal & p (protein g) per typical portion, unless unit is 'g'/'ml' (then per 100g/ml)

const FOODS: Record<string, FoodEntry> = {
  egg: { kcal: 78, p: 6, unit: 'item' }, eggs: { kcal: 78, p: 6, unit: 'item' },
  'boiled egg': { kcal: 78, p: 6, unit: 'item' }, 'fried egg': { kcal: 90, p: 6, unit: 'item' },
  'scrambled egg': { kcal: 100, p: 7, unit: 'item' }, omelette: { kcal: 220, p: 15, unit: 'item' },
  toast: { kcal: 90, p: 3, unit: 'item' }, 'slice of toast': { kcal: 90, p: 3, unit: 'item' },
  bread: { kcal: 80, p: 3, unit: 'item' }, 'slice of bread': { kcal: 80, p: 3, unit: 'item' },
  bagel: { kcal: 250, p: 10, unit: 'item' }, croissant: { kcal: 230, p: 5, unit: 'item' },
  pancake: { kcal: 90, p: 2, unit: 'item' }, pancakes: { kcal: 90, p: 2, unit: 'item' },
  porridge: { kcal: 160, p: 5, unit: 'item' }, oats: { kcal: 150, p: 5, unit: 'item' },
  oatmeal: { kcal: 160, p: 5, unit: 'item' }, cereal: { kcal: 200, p: 6, unit: 'item' },
  granola: { kcal: 220, p: 5, unit: 'item' }, muesli: { kcal: 180, p: 5, unit: 'item' },
  butter: { kcal: 100, p: 0, unit: 'item' }, jam: { kcal: 50, p: 0, unit: 'item' },
  honey: { kcal: 64, p: 0, unit: 'item' }, 'peanut butter': { kcal: 190, p: 8, unit: 'item' },
  apple: { kcal: 95, p: 0, unit: 'item' }, banana: { kcal: 105, p: 1, unit: 'item' },
  orange: { kcal: 62, p: 1, unit: 'item' }, pear: { kcal: 100, p: 1, unit: 'item' },
  grapes: { kcal: 90, p: 1, unit: 'item' }, strawberries: { kcal: 50, p: 1, unit: 'item' },
  blueberries: { kcal: 85, p: 1, unit: 'item' }, raspberries: { kcal: 64, p: 1, unit: 'item' },
  mango: { kcal: 200, p: 3, unit: 'item' }, pineapple: { kcal: 80, p: 1, unit: 'item' },
  watermelon: { kcal: 85, p: 2, unit: 'item' }, peach: { kcal: 59, p: 1, unit: 'item' },
  kiwi: { kcal: 42, p: 1, unit: 'item' }, avocado: { kcal: 240, p: 3, unit: 'item' },
  salad: { kcal: 120, p: 3, unit: 'item' }, 'side salad': { kcal: 80, p: 2, unit: 'item' },
  tomato: { kcal: 22, p: 1, unit: 'item' }, cucumber: { kcal: 16, p: 1, unit: 'item' },
  carrot: { kcal: 41, p: 1, unit: 'item' }, broccoli: { kcal: 55, p: 4, unit: 'item' },
  spinach: { kcal: 23, p: 3, unit: 'item' }, potato: { kcal: 160, p: 4, unit: 'item' },
  'sweet potato': { kcal: 180, p: 4, unit: 'item' }, 'mashed potato': { kcal: 210, p: 4, unit: 'item' },
  'roast potatoes': { kcal: 250, p: 5, unit: 'item' }, peas: { kcal: 80, p: 5, unit: 'item' },
  corn: { kcal: 90, p: 3, unit: 'item' }, mushrooms: { kcal: 35, p: 3, unit: 'item' },
  onion: { kcal: 44, p: 1, unit: 'item' }, pepper: { kcal: 30, p: 1, unit: 'item' },
  rice: { kcal: 200, p: 4, unit: 'item' }, 'white rice': { kcal: 205, p: 4, unit: 'item' },
  'brown rice': { kcal: 215, p: 5, unit: 'item' }, pasta: { kcal: 220, p: 8, unit: 'item' },
  spaghetti: { kcal: 220, p: 8, unit: 'item' }, noodles: { kcal: 220, p: 7, unit: 'item' },
  couscous: { kcal: 180, p: 6, unit: 'item' }, quinoa: { kcal: 220, p: 8, unit: 'item' },
  chips: { kcal: 320, p: 4, unit: 'item' }, fries: { kcal: 320, p: 4, unit: 'item' },
  naan: { kcal: 260, p: 8, unit: 'item' }, tortilla: { kcal: 140, p: 4, unit: 'item' },
  wrap: { kcal: 300, p: 12, unit: 'item' }, pitta: { kcal: 160, p: 5, unit: 'item' },
  chicken: { kcal: 165, p: 31, unit: 'g' }, 'chicken breast': { kcal: 165, p: 31, unit: 'g' },
  beef: { kcal: 250, p: 26, unit: 'g' }, steak: { kcal: 270, p: 25, unit: 'g' },
  pork: { kcal: 240, p: 27, unit: 'g' }, lamb: { kcal: 290, p: 25, unit: 'g' },
  salmon: { kcal: 200, p: 20, unit: 'g' }, tuna: { kcal: 130, p: 28, unit: 'g' },
  cod: { kcal: 100, p: 23, unit: 'g' }, prawns: { kcal: 99, p: 24, unit: 'g' },
  fish: { kcal: 150, p: 22, unit: 'g' }, turkey: { kcal: 170, p: 29, unit: 'g' },
  bacon: { kcal: 45, p: 4, unit: 'item' }, sausage: { kcal: 230, p: 12, unit: 'item' },
  sausages: { kcal: 230, p: 12, unit: 'item' }, mince: { kcal: 240, p: 26, unit: 'g' },
  tofu: { kcal: 145, p: 16, unit: 'g' }, beans: { kcal: 160, p: 9, unit: 'item' },
  'baked beans': { kcal: 160, p: 9, unit: 'item' }, chickpeas: { kcal: 180, p: 9, unit: 'item' },
  lentils: { kcal: 180, p: 12, unit: 'item' }, hummus: { kcal: 100, p: 3, unit: 'item' },
  milk: { kcal: 60, p: 3.4, unit: 'ml' }, cheese: { kcal: 110, p: 7, unit: 'item' },
  yoghurt: { kcal: 120, p: 6, unit: 'item' }, yogurt: { kcal: 120, p: 6, unit: 'item' },
  'greek yoghurt': { kcal: 130, p: 10, unit: 'item' }, cream: { kcal: 50, p: 0, unit: 'item' },
  sandwich: { kcal: 350, p: 15, unit: 'item' }, burger: { kcal: 500, p: 25, unit: 'item' },
  pizza: { kcal: 285, p: 12, unit: 'item' }, 'pizza slice': { kcal: 285, p: 12, unit: 'item' },
  curry: { kcal: 450, p: 20, unit: 'item' }, 'chicken curry': { kcal: 490, p: 30, unit: 'item' },
  'tikka masala': { kcal: 550, p: 32, unit: 'item' }, soup: { kcal: 180, p: 6, unit: 'item' },
  stew: { kcal: 320, p: 22, unit: 'item' }, 'stir fry': { kcal: 400, p: 22, unit: 'item' },
  lasagne: { kcal: 450, p: 24, unit: 'item' }, risotto: { kcal: 450, p: 12, unit: 'item' },
  'fish and chips': { kcal: 800, p: 35, unit: 'item' }, 'roast dinner': { kcal: 700, p: 40, unit: 'item' },
  'full english': { kcal: 800, p: 35, unit: 'item' }, taco: { kcal: 200, p: 9, unit: 'item' },
  burrito: { kcal: 600, p: 26, unit: 'item' }, sushi: { kcal: 350, p: 16, unit: 'item' },
  biscuit: { kcal: 70, p: 1, unit: 'item' }, biscuits: { kcal: 70, p: 1, unit: 'item' },
  cookie: { kcal: 150, p: 2, unit: 'item' }, chocolate: { kcal: 230, p: 3, unit: 'item' },
  'chocolate bar': { kcal: 230, p: 3, unit: 'item' }, crisps: { kcal: 150, p: 2, unit: 'item' },
  cake: { kcal: 350, p: 4, unit: 'item' }, 'slice of cake': { kcal: 350, p: 4, unit: 'item' },
  muffin: { kcal: 380, p: 6, unit: 'item' }, donut: { kcal: 250, p: 3, unit: 'item' },
  doughnut: { kcal: 250, p: 3, unit: 'item' }, 'ice cream': { kcal: 200, p: 4, unit: 'item' },
  nuts: { kcal: 180, p: 6, unit: 'item' }, almonds: { kcal: 160, p: 6, unit: 'item' },
  popcorn: { kcal: 120, p: 2, unit: 'item' }, 'protein bar': { kcal: 220, p: 20, unit: 'item' },
  'protein shake': { kcal: 200, p: 30, unit: 'item' }, smoothie: { kcal: 250, p: 5, unit: 'item' },
  coffee: { kcal: 5, p: 0, unit: 'item' }, latte: { kcal: 120, p: 8, unit: 'item' },
  cappuccino: { kcal: 90, p: 6, unit: 'item' }, tea: { kcal: 2, p: 0, unit: 'item' },
  juice: { kcal: 110, p: 1, unit: 'item' }, 'orange juice': { kcal: 110, p: 2, unit: 'item' },
  coke: { kcal: 140, p: 0, unit: 'item' }, 'fizzy drink': { kcal: 140, p: 0, unit: 'item' },
  beer: { kcal: 200, p: 2, unit: 'item' }, wine: { kcal: 125, p: 0, unit: 'item' },
  water: { kcal: 0, p: 0, unit: 'item' },
};

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5,
};

function parseQuantity(text: string): { qty: number; grams: number | null; rest: string } {
  let qty = 1; let grams: number | null = null; let rest = text;
  const gMatch = text.match(/(\d+)\s*(g|grams|gram|ml)\b/i);
  if (gMatch) { grams = parseInt(gMatch[1]); rest = text.replace(gMatch[0], '').trim(); return { qty, grams, rest }; }
  const numMatch = text.match(/^(\d+(?:\.\d+)?)\s+/);
  if (numMatch) { qty = parseFloat(numMatch[1]); rest = text.replace(numMatch[0], '').trim(); return { qty, grams, rest }; }
  const firstWord = text.split(/\s+/)[0]?.toLowerCase();
  if (firstWord in NUMBER_WORDS) { qty = NUMBER_WORDS[firstWord]; rest = text.split(/\s+/).slice(1).join(' '); }
  return { qty, grams, rest };
}

function matchFood(name: string): FoodEntry | null {
  const clean = name.toLowerCase().replace(/\b(of|some|a|the|with|and|fresh|grilled|baked|raw|cooked)\b/g, ' ').replace(/s\b/g, '').trim();
  if (FOODS[name.toLowerCase()]) return FOODS[name.toLowerCase()];
  for (const key of Object.keys(FOODS)) {
    if (key === clean || key.replace(/s$/, '') === clean) return FOODS[key];
  }
  for (const key of Object.keys(FOODS)) {
    if (clean.includes(key) || key.includes(clean)) return FOODS[key];
  }
  return null;
}

export function estimateCalories(input: string): { calories: number; protein: number; matched: boolean } {
  const items = input.split(/,|\band\b|\+|;/i).map(s => s.trim()).filter(Boolean);
  let total = 0; let protein = 0; let anyMatch = false;
  for (const item of items) {
    const { qty, grams, rest } = parseQuantity(item);
    const food = matchFood(rest) || matchFood(item);
    if (!food) continue;
    anyMatch = true;
    if ((food.unit === 'g' || food.unit === 'ml') && grams) {
      total += Math.round((food.kcal * grams) / 100);
      protein += Math.round((food.p * grams) / 100);
    } else if (food.unit === 'g' || food.unit === 'ml') {
      total += Math.round((food.kcal * 150) / 100) * qty;
      protein += Math.round((food.p * 150) / 100) * qty;
    } else {
      total += Math.round(food.kcal * qty);
      protein += Math.round(food.p * qty);
    }
  }
  return { calories: total, protein, matched: anyMatch };
}
