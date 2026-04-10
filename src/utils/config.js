import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidateDirs = [
  path.join(__dirname, '..', 'config'),
  path.join(__dirname, '..', '..', 'config'),
  path.join(process.cwd(), 'config'),
  path.join(process.cwd(), 'src', 'config'),
];

const findConfigFile = (fileName) => {
  for (const dir of candidateDirs) {
    const fullPath = path.join(dir, fileName);
    if (fs.existsSync(fullPath)) {
      console.log('Loading config from:', fullPath);
      return fullPath;
    }
  }

  throw new Error(
    `Config file not found: ${fileName}\nTried:\n${candidateDirs
      .map((dir) => `- ${path.join(dir, fileName)}`)
      .join('\n')}`
  );
};

const readJson = (fileName) => {
  const fullPath = findConfigFile(fileName);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

export const loadJsonFile = (fileName) => readJson(fileName);
export const loadAppConfig = () => readJson('app.config.json');
export const loadSteamAccountsConfig = () => readJson('steamAccounts.json');
