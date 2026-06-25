import { Type as t } from '@sinclair/typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { db } from '../clients/drizzle.client';
import type { ServicesT } from '../db/services.table';
import { services_table, ServicesE, svsTablesMap } from '../db/services.table';
import { arrToObj } from '../utils/obj.util';

// ==================================================================

export const addCategoriesS = {
  schema: {
    body: t.Object({
      categories: t.Array(t.Enum(arrToObj(ServicesE)), {
        minItems: 1,
        maxItems: ServicesE.length,
      }),
    }),
  },
};

export async function addCategories(
  req: FastifyRequest<{ Body: typeof addCategoriesS.schema.body.static }>,
  res: FastifyReply,
) {
  const arr = req.body.categories.map((name) => ({ name }));
  await db.insert(services_table).values(arr as { name: ServicesT }[]);
}

// ==================================================================

export const addDataS = {
  schema: {
    body: t.Object({
      services: t.Array(
        t.Object({
          name: t.Enum(arrToObj<ServicesT>(ServicesE)),
          listings: t.Optional(
            t.Array(
              t.Object({
                name: t.String(),
                price: t.Number(),
              }),
            ),
          ),
        }),
        {
          minItems: 1,
          maxItems: ServicesE.length,
        },
      ),
    }),
  },
};

export async function addData(
  req: FastifyRequest<{ Body: typeof addDataS.schema.body.static }>,
  res: FastifyReply,
) {
  const bodyCatsNames = req.body.services.map((sv) => ({ name: sv.name as ServicesT }));

  const insertedSvs = await db.insert(services_table).values(bodyCatsNames).returning({
    id: services_table.id,
    name: services_table.name,
  });

  for (const svsItem of req.body.services) {
    if (svsItem.listings) {
      for (const subSv of svsItem.listings) {
        const svId = insertedSvs.find((sv) => sv.name === svsItem.name)?.id;
        if (svId) {
          await db.insert(svsTablesMap[svsItem.name]).values({
            serviceId: svId,
            ...subSv,
          });
        }
      }
    }
  }
}
