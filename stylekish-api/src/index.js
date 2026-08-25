function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-password"
    }
  });
}
function checkAdmin(request, env) {
  const password = request.headers.get("x-admin-password");

  return password && password === env.ADMIN_PASSWORD;
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, x-admin-password"
        }
      });
    }

    // Health check
    if (url.pathname === "/") {
      return json({
        success: true,
        service: "StyleKish API"
      });
    }

    // GET /products
    if (url.pathname === "/products" && method === "GET") {
      try {
        const result = await env.DB
          .prepare(`
            SELECT *
            FROM products
            ORDER BY created_at DESC
          `)
          .all();

        return json({
          success: true,
          products: result.results
        });
      } catch (error) {
        return json(
          {
            success: false,
            error: error.message
          },
          500
        );
      }
    }

    // GET /products/:id
    if (url.pathname.startsWith("/products/") && method === "GET") {
      const id = url.pathname.split("/")[2];

      try {
        const product = await env.DB
          .prepare("SELECT * FROM products WHERE id = ?")
          .bind(id)
          .first();

        if (!product) {
          return json(
            {
              success: false,
              error: "Product not found"
            },
            404
          );
        }

        return json({
          success: true,
          product
        });
      } catch (error) {
        return json(
          {
            success: false,
            error: error.message
          },
          500
        );
      }
    }

    // POST /products
    if (url.pathname === "/products" && method === "POST") {
if (!checkAdmin(request, env)) {
  return json(
    {
      success: false,
      error: "Unauthorized"
    },
    401
  );
}
      try {
        const data = await request.json();

        if (!data.name) {
          return json(
            {
              success: false,
              error: "Product name is required"
            },
            400
          );
        }

        const id = data.id || crypto.randomUUID();

        await env.DB
          .prepare(`
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            id,
            data.sku || null,
            data.name,
            data.subtitle || null,
            data.category || null,
            data.sub_category || null,
            data.gender || null,
            Number(data.price || 0),
            data.original_price ?? null,
            Number(data.discount_percent || 0),
            Number(data.is_new || 0),
            Number(data.is_sale || 0),
            Number(data.in_stock ?? 1),
            Number(data.stock_count || 0),
            data.image || null,
            data.description || null,
            data.care_instructions || null,
            JSON.stringify(data.sizes || []),
            JSON.stringify(data.colors || [])
          )
          .run();

        const product = await env.DB
          .prepare("SELECT * FROM products WHERE id = ?")
          .bind(id)
          .first();

        return json(
          {
            success: true,
            product
          },
          201
        );
      } catch (error) {
        return json(
          {
            success: false,
            error: error.message
          },
          500
        );
      }
    }

// PUT /products/:id
if (url.pathname.startsWith("/products/") && method === "PUT") {
if (!checkAdmin(request, env)) {
  return json(
    {
      success: false,
      error: "Unauthorized"
    },
    401
  );
}
  const id = url.pathname.split("/")[2];

  try {
    const data = await request.json();

    const existing = await env.DB
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return json(
        {
          success: false,
          error: "Product not found"
        },
        404
      );
    }

    await env.DB
      .prepare(`
        UPDATE products SET
          sku = ?,
          name = ?,
          subtitle = ?,
          category = ?,
          sub_category = ?,
          gender = ?,
          price = ?,
          original_price = ?,
          discount_percent = ?,
          is_new = ?,
          is_sale = ?,
          in_stock = ?,
          stock_count = ?,
          image = ?,
          description = ?,
          care_instructions = ?,
          sizes = ?,
          colors = ?
        WHERE id = ?
      `)
      .bind(
        data.sku ?? existing.sku,
        data.name ?? existing.name,
        data.subtitle ?? existing.subtitle,
        data.category ?? existing.category,
        data.sub_category ?? existing.sub_category,
        data.gender ?? existing.gender,
        data.price ?? existing.price,
        data.original_price ?? existing.original_price,
        data.discount_percent ?? existing.discount_percent,
        data.is_new ?? existing.is_new,
        data.is_sale ?? existing.is_sale,
        data.in_stock ?? existing.in_stock,
        data.stock_count ?? existing.stock_count,
        data.image ?? existing.image,
        data.description ?? existing.description,
        data.care_instructions ?? existing.care_instructions,
        data.sizes ? JSON.stringify(data.sizes) : existing.sizes,
        data.colors ? JSON.stringify(data.colors) : existing.colors,
        id
      )
      .run();

    const product = await env.DB
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first();

    return json({
      success: true,
      product
    });

  } catch (error) {
    return json(
      {
        success: false,
        error: error.message
      },
      500
    );
  }
}


// DELETE /products/:id
if (url.pathname.startsWith("/products/") && method === "DELETE") {
if (!checkAdmin(request, env)) {
  return json(
    {
      success: false,
      error: "Unauthorized"
    },
    401
  );
}
  const id = url.pathname.split("/")[2];

  try {
    const existing = await env.DB
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return json(
        {
          success: false,
          error: "Product not found"
        },
        404
      );
    }

    await env.DB
      .prepare("DELETE FROM products WHERE id = ?")
      .bind(id)
      .run();

    return json({
      success: true,
      message: "Product deleted successfully",
      id
    });

  } catch (error) {
    return json(
      {
        success: false,
        error: error.message
      },
      500
    );
  }
}

    return json(
      {
        success: false,
        error: "Not Found"
      },
      404
    );
  }
};