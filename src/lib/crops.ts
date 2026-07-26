export const KNOWN_CROPS = [
  "wheat","rice","maize","corn","barley","oats","rye","sorghum","millet",
  "cotton","sugarcane","sugar cane","soybean","soybeans","peanut","peanuts","groundnut",
  "potato","potatoes","tomato","tomatoes","onion","onions","garlic","carrot","carrots",
  "cabbage","cauliflower","broccoli","spinach","lettuce","kale","cucumber","cucumbers",
  "pumpkin","squash","zucchini","eggplant","brinjal","okra","bell pepper","pepper","chili","chilli","chile",
  "apple","apples","banana","bananas","mango","mangoes","orange","oranges","lemon","lime","grape","grapes",
  "strawberry","strawberries","blueberry","blueberries","raspberry","watermelon","melon","papaya","pineapple",
  "coffee","tea","cocoa","tobacco","chickpea","chickpeas","gram","lentil","lentils","bean","beans","pea","peas",
  "mustard","canola","sunflower","sesame","flax","alfalfa","clover","hay",
  "coconut","olive","olives","date","dates","fig","figs","cherry","peach","plum","pear","apricot",
  "avocado","almond","cashew","walnut","pistachio","hazelnut","turmeric","ginger","cardamom","cinnamon","clove",
  "quinoa","buckwheat","yam","cassava","taro","sweet potato","sweetpotato","radish","beet","beetroot","turnip",
];

export function isValidCrop(input: string): boolean {
  const s = input.trim().toLowerCase();
  if (s.length < 3) return false;
  if (!/^[a-z][a-z\s-]{2,}$/.test(s)) return false;
  if (KNOWN_CROPS.includes(s)) return true;
  // partial match: any known crop contains or is contained
  return KNOWN_CROPS.some((c) => c === s || c.includes(s) || s.includes(c));
}
