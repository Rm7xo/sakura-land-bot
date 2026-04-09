import SteamTotp from 'steam-totp';
import { loadSteamAccountsConfig } from '../utils/config.js';
export const getSteamAccounts=()=> (loadSteamAccountsConfig().steam_accounts||[]).filter(x=>x.status==='active');
export const getSteamAccount=(id)=>getSteamAccounts().find(x=>x.id===id)||null;
export const generateFromShared=(sharedSecret)=>SteamTotp.generateAuthCode(sharedSecret);
