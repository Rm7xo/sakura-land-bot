import { prisma } from '../db/prisma.js';
import { addMinutes } from '../utils/time.js';
export const getSession=(uid)=>prisma.userSession.findUnique({where:{telegramUserId:BigInt(uid)}});
export async function upsertSession(uid,patch){
 const now=new Date();
 return prisma.userSession.upsert({
   where:{telegramUserId:BigInt(uid)},
   update:{...patch,updatedAt:now},
   create:{telegramUserId:BigInt(uid),state:patch.state||'idle',selectedPlatform:patch.selectedPlatform||null,selectedAccount:patch.selectedAccount||null,flowMessageId:patch.flowMessageId?BigInt(patch.flowMessageId):null,expiresAt:patch.expiresAt||addMinutes(now,Number(process.env.ORDER_TIMEOUT_MINUTES||5))}
 });
}
export const clearSession=(uid)=>prisma.userSession.deleteMany({where:{telegramUserId:BigInt(uid)}});
export const isSessionExpired=(session)=>session?.expiresAt ? Date.now()>new Date(session.expiresAt).getTime() : false;
