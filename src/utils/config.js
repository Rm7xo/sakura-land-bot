import fs from 'fs';
export const loadJsonFile=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
export const loadAppConfig=()=>loadJsonFile('config/app.config.json');
export const loadSteamAccountsConfig=()=>loadJsonFile('config/steamAccounts.json');
