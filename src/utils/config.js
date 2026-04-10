import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// عشان نحدد المسار الصحيح
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// نطلع خطوة لفوق (من utils → src) ثم ندخل config
const basePath = path.join(__dirname, '..', 'config');

export const loadJsonFile = (file) => {
  const fullPath = path.join(basePath, file);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

export const loadAppConfig = () => loadJsonFile('app.config.json');

export const loadSteamAccountsConfig = () => loadJsonFile('steamAccounts.json');