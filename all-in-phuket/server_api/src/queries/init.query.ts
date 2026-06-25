import { sql } from 'drizzle-orm';

import { db } from '../clients/drizzle.client';
import type { ServicesT } from '../db/services.table';
import { services_table, svsTablesMap } from '../db/services.table';

export async function query_get_data() {
  const [svs] = await db
    .select({ services: sql`json_object_agg(services.name, json_build_object())` })
    .from(services_table);

  const promises = [];
  for (const sv of Object.keys(svs?.services as Record<string, any>) as ServicesT[]) {
    const c = svsTablesMap[sv];
    if (c) {
      promises.push(
        (async () => {
          const listings = await db
            .select({
              id: c.id,
              name: c.name,

              ...(c.images && { images: c.images }),
              ...(c.location && { location: c.location }),
              ...(c.price && { price: c.price }),
              ...(c.description && { description: c.description }),
              ...(c.amenities && { amenities: c.amenities }),
              ...(c.availabilityType && { availabilityType: c.availabilityType }),
              ...(c.contractDuration && { contractDuration: c.contractDuration }),
              ...(c.bedroomCount && { bedroomCount: c.bedroomCount }),
              ...(c.showerCount && { showerCount: c.showerCount }),
              ...(c.ownershipStatus && { ownershipStatus: c.ownershipStatus }),
              ...(c.propertyType && { propertyType: c.propertyType }),
            })
            .from(c);
          // .limit(5);
          return { service: sv, listings };
        })(),
      );
    }
  }
  type Result = { service: string; listings: any[] };
  const results: Result[] = await Promise.all(promises);

  return results;
}
