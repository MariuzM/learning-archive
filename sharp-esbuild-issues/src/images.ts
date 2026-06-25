import sharp from 'sharp';

export const resize = (input: Buffer, width: number, height: number) =>
  sharp(input).resize(width, height, { fit: 'cover' }).toBuffer();

export const toWebp = (input: Buffer, quality = 80) =>
  sharp(input).webp({ quality }).toBuffer();

export const grayscale = (input: Buffer) => sharp(input).grayscale().toBuffer();

export const thumbnail = (input: Buffer) =>
  sharp(input).resize(128, 128, { fit: 'inside' }).png().toBuffer();

export const metadata = (input: Buffer) => sharp(input).metadata();

export const watermark = (input: Buffer, overlay: Buffer) =>
  sharp(input)
    .composite([{ input: overlay, gravity: 'southeast' }])
    .toBuffer();

export const gradient = (width: number, height: number) =>
  sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 30, g: 90, b: 200 },
    },
  })
    .png()
    .toBuffer();
