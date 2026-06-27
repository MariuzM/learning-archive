import { t } from "elysia";

export const validateBody = t.Object(
  {
    username: t.String({ minLength: 3, maxLength: 30, pattern: "^[a-z0-9_]+$" }),
    email: t.String({ maxLength: 100, pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" }),
    age: t.Integer({ minimum: 13, maximum: 120 }),
    password: t.String({ minLength: 8, maxLength: 100, pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$" }),
    website: t.String({ maxLength: 200, pattern: "^https?://" }),
    country: t.Union(
      ["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"].map((c) => t.Literal(c)),
    ),
    tags: t.Array(t.String({ minLength: 1, maxLength: 20 }), { minItems: 1, maxItems: 10 }),
    items: t.Array(
      t.Object({
        sku: t.String({ pattern: "^[A-Z]{3}-[0-9]{3}$" }),
        qty: t.Integer({ minimum: 1, maximum: 999 }),
        price: t.Number({ minimum: 0, maximum: 100000 }),
      }),
      { minItems: 1, maxItems: 50 },
    ),
  },
  { additionalProperties: false },
);

export const validate = () => ({ valid: true });
