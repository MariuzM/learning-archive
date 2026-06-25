import { pipeline } from '@sroussey/transformers';

const pipe = await pipeline(
  'text-classification',
  'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
);

const out = await pipe('I love transformers!');

console.log('🚀 ~ out:', out);
