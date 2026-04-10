import fs from 'fs';
import path from 'path';

const readJson = (relativePath) => {
  const fullPath = path.resolve(process.cwd(), relativePath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
};

export const loadJsonFile = (relativePath) => {
  return readJson(relativePath);
};

export const loadAppConfig = () => {
  return readJson('config/app.config.json');
};

export const loadSteamAccountsConfig = () => {
  return readJson('config/steamAccounts.json');
};