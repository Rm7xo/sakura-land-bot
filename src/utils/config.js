import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// نحدد مكان الملف الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// نطلع من utils → src → ثم ندخل config
const basePath = path.resolve(__dirname, '../config');

// قراءة ملف JSON
const readJson = (fileName) => {
  const fullPath = path.join(basePath, fileName);
  console.log('Loading config from:', fullPath); // عشان نتأكد باللوق
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

// الدوال
export const loadJsonFile = (fileName) => readJson(fileName);
export const loadAppConfig = () => readJson('app.config.json');
export const loadSteamAccountsConfig = () => readJson('steamAccounts.json');