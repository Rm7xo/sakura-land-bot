import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// هذا يرجع من src/utils إلى src ثم يدخل config
const basePath = path.join(__dirname, '..', 'config');

const readJson = (fileName) => {
  const fullPath = path.join(basePath, fileName);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
};

export const loadJsonFile = (fileName) => {
  return readJson(fileName);
};

export const loadAppConfig = () => {
  return readJson('app.config.json');
};

export const loadSteamAccountsConfig = () => {
  return readJson('steamAccounts.json');
};