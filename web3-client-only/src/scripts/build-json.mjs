import fs from 'fs';
import { gettextToI18next } from 'i18next-conv';
import path from 'path';

(async () => {
  try {
    const pathPo = './src/i18n/';
    const dirPo = await fs.promises.opendir(pathPo);
    for await (const filePo of dirPo) {
      if (path.extname(filePo.name) === '.po') {
        const n = filePo.name.split('.po')[0];
        await gettextToI18next(n, fs.readFileSync(`${pathPo}${filePo.name}`))
          .then((r) => {
            fs.writeFileSync(`public/locales/${n}/common.json`, r);
          })
          .catch((err) => {
            console.log('🚀 ~ err', err);
          });
      }
    }
  } catch (error) {
    console.log('🚀 ~ Err', JSON.stringify(error, null, 2));
  }
})();
