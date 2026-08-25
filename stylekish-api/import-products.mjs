import fs from "fs";

const file = fs.readFileSync("../assets/js/products-data.js", "utf8");

// استخراج آرایه DEFAULT_PRODUCTS
const match = file.match(/const DEFAULT_PRODUCTS = (\[[\s\S]*?\]);/);

if (!match) {
  console.log("Products array not found");
  process.exit(1);
}

const products = eval(match[1]);

console.log("Products found:", products.length);

const output = products.map(p => ({
  id: p.id,
  sku: p.sku || null,
  name: p.name,
  subtitle: p.subtitle || null,
  category: p.category || null,
  sub_category: p.subCategory || null,
  gender: p.gender || null,
  price: p.price || 0,
  original_price: p.originalPrice || null,
  discount_percent: p.discountPercent || 0,
  is_new: p.isNew ? 1 : 0,
  is_sale: p.isSale ? 1 : 0,
  in_stock: p.inStock ? 1 : 0,
  stock_count: p.stockCount || 0,
  image: p.image || null,
  description: p.description || null,
  care_instructions: p.careInstructions || null,
  sizes: JSON.stringify(p.sizes || []),
  colors: JSON.stringify(p.colors || [])
}));

fs.writeFileSync(
  "products-import.json",
  JSON.stringify(output, null, 2),
  "utf8"
);

console.log("Created products-import.json");