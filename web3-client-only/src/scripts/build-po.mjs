import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// msgattrib --no-obsolete --empty -o src/i18n/lt.po src/i18n/lt.po

(async () => {
  const filePot = 'src/i18n/_main.pot';
  const pathPo = 'src/i18n/';
  const dirPo = await fs.promises.opendir(pathPo);
  for await (const filePo of dirPo) {
    if (path.extname(filePo.name) === '.po') {
      const n = filePo.name;
      const cmd = `msgmerge --no-fuzzy -U src/i18n/${n} ${filePot} --backup=none`;
      await exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.log('🚀 ~ err', err);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
    }
  }
})();
