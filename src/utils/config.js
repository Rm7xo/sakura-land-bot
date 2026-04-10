import fs from 'fs';
import path from 'path';

const findConfigFile = (fileName) => {
  const possiblePaths = [
    path.join(process.cwd(), 'config', fileName),
    path.join(process.cwd(), fileName)
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log('Loading config from:', p);
      return p;
    }
  }

  throw new Error(`Config file not found: ${fileName}`);
};

const readJson = (fileName) => {
  const fullPath = findConfigFile(fileName);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

export const loadAppConfig = () => readJson('app.config.json');
export const loadSteamAccountsConfig = () => readJson('steamAccounts.json');
