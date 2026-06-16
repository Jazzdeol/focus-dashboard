// Built-in calorie estimator. Matches free-text food entries against a database
// of common foods (per typical portion) and sums multiple items in one entry.
// Handles quantities like "2 eggs", "3 slices toast", "200g chicken".

type FoodEntry = { kcal: number; unit?: 'g' | 'ml' | 'item' };

// kcal values are per typical single portion unless unit is 'g'/'ml' (then per 100g/ml)
const FOODS: Record<string, FoodEntry> = {
  // eggs & breakfast
  egg: { kcal: 78, unit: 'item' }, eggs: { kcal: 78, unit: 'item' },
  'boiled egg': { kcal: 78, unit: 'item' }, 'fried egg': { kcal: 90, unit: 'item' },
  'scrambled egg': { kcal: 100, unit: 'item' }, omelette: { kcal: 220, unit: 'item' },
  toast: { kcal: 90, unit: 'item' }, 'slice of toast': { kcal: 90, unit: 'item' },
  bread: { kcal: 80, unit: 'item' }, 'slice of bread': { kcal: 80, unit: 'item' },
  bagel: { kcal: 250, unit: 'item' }, croissant: { kcal: 230, unit: 'item' },
  pancake: { kcal: 90, unit: 'item' }, pancakes: { kcal: 90, unit: 'item' },
  porridge: { kcal: 160, unit: 'item' }, oats: { kcal: 150, unit: 'item' },
  oatmeal: { kcal: 160, unit: 'item' }, cereal: { kcal: 200, unit: 'item' },
  granola: { kcal: 220, unit: 'item' }, muesli: { kcal: 180, unit: 'item' },
  butter: { kcal: 100, unit: 'item' }, jam: { kcal: 50, unit: 'item' },
  honey: { kcal: 64, unit: 'item' }, 'peanut butter': { kcal: 190, unit: 'item' },
  // fruit
  apple: { kcal: 95, unit: 'item' }, banana: { kcal: 105, unit: 'item' },
  orange: { kcal: 62, unit: 'item' }, pear: { kcal: 100, unit: 'item' },
  grapes: { kcal: 90, unit: 'item' }, strawberries: { kcal: 50, unit: 'item' },
  blueberries: { kcal: 85, unit: 'item' }, raspberries: { kcal: 64, unit: 'item' },
  mango: { kcal: 200, unit: 'item' }, pineapple: { kcal: 80, unit: 'item' },
  watermelon: { kcal: 85, unit: 'item' }, peach: { kcal: 59, unit: 'item' },
  kiwi: { kcal: 42, unit: 'item' }, avocado: { kcal: 240, unit: 'item' },
  // veg & salad
  salad: { kcal: 120, unit: 'item' }, 'side salad': { kcal: 80, unit: 'item' },
  tomato: { kcal: 22, unit: 'item' }, cucumber: { kcal: 16, unit: 'item' },
  carrot: { kcal: 41, unit: 'item' }, broccoli: { kcal: 55, unit: 'item' },
  spinach: { kcal: 23, unit: 'item' }, potato: { kcal: 160, unit: 'item' },
  'sweet potato': { kcal: 180, unit: 'item' }, 'mashed potato': { kcal: 210, unit: 'item' },
  'roast potatoes': { kcal: 250, unit: 'item' }, peas: { kcal: 80, unit: 'item' },
  corn: { kcal: 90, unit: 'item' }, mushrooms: { kcal: 35, unit: 'item' },
  onion: { kcal: 44, unit: 'item' }, pepper: { kcal: 30, unit: 'item' },
  // carbs
  rice: { kcal: 200, unit: 'item' }, 'white rice': { kcal: 205, unit: 'item' },
  'brown rice': { kcal: 215, unit: 'item' }, pasta: { kcal: 220, unit: 'item' },
  spaghetti: { kcal: 220, unit: 'item' }, noodles: { kcal: 220, unit: 'item' },
  couscous: { kcal: 180, unit: 'item' }, quinoa: { kcal: 220, unit: 'item' },
  chips: { kcal: 320, unit: 'item' }, fries: { kcal: 320, unit: 'item' },
  'naan': { kcal: 260, unit: 'item' }, tortilla: { kcal: 140, unit: 'item' },
  wrap: { kcal: 300, unit: 'item' }, 'pitta': { kcal: 160, unit: 'item' },
  // protein
  chicken: { kcal: 165, unit: 'g' }, 'chicken breast': { kcal: 165, unit: 'g' },
  beef: { kcal: 250, unit: 'g' }, steak: { kcal: 270, unit: 'g' },
  pork: { kcal: 240, unit: 'g' }, lamb: { kcal: 290, unit: 'g' },
  salmon: { kcal: 200, unit: 'g' }, tuna: { kcal: 130, unit: 'g' },
  cod: { kcal: 100, unit: 'g' }, prawns: { kcal: 99, unit: 'g' },
  fish: { kcal: 150, unit: 'g' }, turkey: { kcal: 170, unit: 'g' },
  bacon: { kcal: 45, unit: 'item' }, sausage: { kcal: 230, unit: 'item' },
  sausages: { kcal: 230, unit: 'item' }, mince: { kcal: 240, unit: 'g' },
  tofu: { kcal: 145, unit: 'g' }, beans: { kcal: 160, unit: 'item' },
  'baked beans': { kcal: 160, unit: 'item' }, chickpeas: { kcal: 180, unit: 'item' },
  lentils: { kcal: 180, unit: 'item' }, hummus: { kcal: 100, unit: 'item' },
  // dairy
  milk: { kcal: 60, unit: 'ml' }, cheese: { kcal: 110, unit: 'item' },
  yoghurt: { kcal: 120, unit: 'item' }, yogurt: { kcal: 120, unit: 'item' },
  'greek yoghurt': { kcal: 130, unit: 'item' }, cream: { kcal: 50, unit: 'item' },
  // meals & dishes
  sandwich: { kcal: 350, unit: 'item' }, burger: { kcal: 500, unit: 'item' },
  pizza: { kcal: 285, unit: 'item' }, 'pizza slice': { kcal: 285, unit: 'item' },
  curry: { kcal: 450, unit: 'item' }, 'chicken curry': { kcal: 490, unit: 'item' },
  'tikka masala': { kcal: 550, unit: 'item' }, soup: { kcal: 180, unit: 'item' },
  stew: { kcal: 320, unit: 'item' }, 'stir fry': { kcal: 400, unit: 'item' },
  lasagne: { kcal: 450, unit: 'item' }, risotto: { kcal: 450, unit: 'item' },
  'fish and chips': { kcal: 800, unit: 'item' }, 'roast dinner': { kcal: 700, unit: 'item' },
  'full english': { kcal: 800, unit: 'item' }, taco: { kcal: 200, unit: 'item' },
  burrito: { kcal: 600, unit: 'item' }, sushi: { kcal: 350, unit: 'item' },
  // snacks & sweet
  biscuit: { kcal: 70, unit: 'item' }, biscuits: { kcal: 70, unit: 'item' },
  cookie: { kcal: 150, unit: 'item' }, chocolate: { kcal: 230, unit: 'item' },
  'chocolate bar': { kcal: 230, unit: 'item' }, crisps: { kcal: 150, unit: 'item' },
  cake: { kcal: 350, unit: 'item' }, 'slice of cake': { kcal: 350, unit: 'item' },
  muffin: { kcal: 380, unit: 'item' }, donut: { kcal: 250, unit: 'item' },
  doughnut: { kcal: 250, unit: 'item' }, 'ice cream': { kcal: 200, unit: 'item' },
  nuts: { kcal: 180, unit: 'item' }, almonds: { kcal: 160, unit: 'item' },
  popcorn: { kcal: 120, unit: 'item' }, 'protein bar': { kcal: 220, unit: 'item' },
  'protein shake': { kcal: 200, unit: 'item' }, smoothie: { kcal: 250, unit: 'item' },
  // drinks
  coffee: { kcal: 5, unit: 'item' }, latte: { kcal: 120, unit: 'item' },
  cappuccino: { kcal: 90, unit: 'item' }, tea: { kcal: 2, unit: 'item' },
  juice: { kcal: 110, unit: 'item' }, 'orange juice': { kcal: 110, unit: 'item' },
  coke: { kcal: 140, unit: 'item' }, 'fizzy drink': { kcal: 140, unit: 'item' },
  beer: { kcal: 200, unit: 'item' }, wine: { kcal: 125, unit: 'item' },
  water: { kcal: 0, unit: 'item' },
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
  // try exact, then singular, then partial
  if (FOODS[name.toLowerCase()]) return FOODS[name.toLowerCase()];
  for (const key of Object.keys(FOODS)) {
    if (key === clean || key.replace(/s$/, '') === clean) return FOODS[key];
  }
  for (const key of Object.keys(FOODS)) {
    if (clean.includes(key) || key.includes(clean)) return FOODS[key];
  }
  return null;
}

export function estimateCalories(input: string): { calories: number; matched: boolean } {
  const items = input.split(/,|\band\b|\+|;/i).map(s => s.trim()).filter(Boolean);
  let total = 0; let anyMatch = false;
  for (const item of items) {
    const { qty, grams, rest } = parseQuantity(item);
    const food = matchFood(rest) || matchFood(item);
    if (!food) continue;
    anyMatch = true;
    if ((food.unit === 'g' || food.unit === 'ml') && grams) total += Math.round((food.kcal * grams) / 100);
    else if (food.unit === 'g' || food.unit === 'ml') total += Math.round((food.kcal * 150) / 100) * qty; // assume 150g portion
    else total += Math.round(food.kcal * qty);
  }
  return { calories: total, matched: anyMatch };
}
