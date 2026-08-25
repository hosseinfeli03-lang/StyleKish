import fs from "fs";

const products = JSON.parse(
  fs.readFileSync("./products-import.json", "utf8")
);

console.log(`Importing ${products.length} products...`);

const sql = products.map(p => {
  return `
INSERT INTO products (
  id,
  sku,
  name,
  subtitle,
  category,
  sub_category,
  gender,
  price,
  original_price,
  discount_percent,
  is_new,
  is_sale,
  in_stock,
  stock_count,
  image,
  description,
  care_instructions,
  sizes,
  colors
)
VALUES (
  '${p.id}',
  '${(p.sku || "").replaceAll("'", "''")}',
  '${p.name.replaceAll("'", "''")}',
  '${(p.subtitle || "").replaceAll("'", "''")}',
  '${p.category || ""}',
  '${p.sub_category || ""}',
  '${p.gender || ""}',
  ${p.price || 0},
  ${p.original_price || 0},
  ${p.discount_percent || 0},
  ${p.is_new},
  ${p.is_sale},
  ${p.in_stock},
  ${p.stock_count},
  '${(p.image || "").replaceAll("'", "''")}',
  '${(p.description || "").replaceAll("'", "''")}',
  '${(p.care_instructions || "").replaceAll("'", "''")}',
  '${(p.sizes || "[]").replaceAll("'", "''")}',
  '${(p.colors || "[]").replaceAll("'", "''")}'
);
`;
}).join("\n");

fs.writeFileSync("products-seed.sql", sql);

console.log("Created products-seed.sql");