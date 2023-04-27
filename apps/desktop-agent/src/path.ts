import { app } from 'electron';
import * as fs from 'fs';
import path from 'path';

try {
  fs.writeFileSync(path.resolve(__dirname, 'database.path'), app.getPath('userData'));
  process.exit(0);
} catch (error) {
  console.log(error);
}
