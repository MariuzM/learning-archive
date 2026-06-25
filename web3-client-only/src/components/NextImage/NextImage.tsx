import Image, { type StaticImageData } from 'next/image';

import { Box } from '../Box/Box';

export const NextImage = ({ src, alt, ...r }: { src: StaticImageData | string; alt: string }) => {
  return (
    <Box
      sx={{
        // minWidth: '100vw',
        width: '100%',
        // position: 'relative',
        // maxWidth: '500px',
        // height: 'auto',
        // maxHeight: '600px',
        // backgroundSize: 'contain',
        // backgroundRepeat: 'no-repeat',
        // backgroundPosition: 'center',
      }}
    >
      <Image
        src={src}
        alt={alt}
        // height="0"
        // width="0"
        // sizes="100vw"
        style={{ width: '100%', height: 'unset' }}
        {...r}
      />
    </Box>
  );
};
