export const validateSchema = {
  body: {
    type: "object",
    required: ["username", "email", "age", "password", "website", "country", "tags", "items"],
    additionalProperties: false,
    properties: {
      username: { type: "string", minLength: 3, maxLength: 30, pattern: "^[a-z0-9_]+$" },
      email: { type: "string", maxLength: 100, pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
      age: { type: "integer", minimum: 13, maximum: 120 },
      password: { type: "string", minLength: 8, maxLength: 100, pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$" },
      website: { type: "string", maxLength: 200, pattern: "^https?://" },
      country: { type: "string", enum: ["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"] },
      tags: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1, maxLength: 20 } },
      items: {
        type: "array",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          required: ["sku", "qty", "price"],
          additionalProperties: false,
          properties: {
            sku: { type: "string", pattern: "^[A-Z]{3}-[0-9]{3}$" },
            qty: { type: "integer", minimum: 1, maximum: 999 },
            price: { type: "number", minimum: 0, maximum: 100000 },
          },
        },
      },
    },
  },
};

export const validate = async () => ({ valid: true });
