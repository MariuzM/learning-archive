import { z } from "zod";
import type { Context } from "hono";

export const validateBody = z
  .object({
    username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
    email: z.string().max(100).regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
    age: z.number().int().min(13).max(120),
    password: z.string().min(8).max(100).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
    website: z.string().max(200).regex(/^https?:\/\//),
    country: z.enum(["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"]),
    tags: z.array(z.string().min(1).max(20)).min(1).max(10),
    items: z
      .array(
        z.object({
          sku: z.string().regex(/^[A-Z]{3}-[0-9]{3}$/),
          qty: z.number().int().min(1).max(999),
          price: z.number().min(0).max(100000),
        }),
      )
      .min(1)
      .max(50),
  })
  .strict();

export const validate = (c: Context) => c.json({ valid: true });
