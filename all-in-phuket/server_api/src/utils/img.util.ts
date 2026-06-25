import { randomUUID } from 'crypto';

import sharp from 'sharp';

import { supaClient } from '../clients/supabase.client';

export async function uploadImg(
  clientImg: string | null,
  clientUserId: number,
  where: 'events' | 'places' | 'users',
) {
  if (!clientImg) return null;
  const bufferImg = Buffer.from(clientImg.replace('data:image/jpeg;base64,', ''), 'base64');
  const imgUrl = (
    await sharp(bufferImg)
      .avif({ quality: 80 })
      .resize(500, 500)
      .toBuffer()
      .then(async (buffer) => {
        const uuid = randomUUID();
        return await supaClient.storage
          .from('phuket-tourist')
          .upload(`${where}/${clientUserId}-${uuid}.avif`, buffer, { contentType: 'image/avif' });
      })
  ).data?.path;
  return imgUrl;
}
