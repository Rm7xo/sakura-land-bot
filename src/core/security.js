import { prisma } from '../db/prisma.js';
import { getRedis } from '../redis/client.js';
export async function addSecurityLog(eventType,reason,extra={}){ return prisma.securityLog.create({data:{telegramUserId:extra.telegramUserId?BigInt(extra.telegramUserId):null,orderId:extra.orderId?String(extra.orderId):null,eventType,reason,metadataJson:JSON.stringify(extra||{})}}); }
export const getSecurityLogs=(orderId=null)=>prisma.securityLog.findMany({where:orderId?{orderId:String(orderId)}:{},orderBy:{createdAt:'desc'},take:50});
export async function isBlocked(userId){ const row=await prisma.blockedUser.findUnique({where:{telegramUserId:BigInt(userId)}}); return row? Date.now()<new Date(row.blockedUntil).getTime() : false; }
export async function banUser(userId,reason='manual_admin',minutes=60){ const until=new Date(Date.now()+minutes*60000); return prisma.blockedUser.upsert({where:{telegramUserId:BigInt(userId)},update:{reason,blockedUntil:until},create:{telegramUserId:BigInt(userId),reason,blockedUntil:until}}); }
export const unbanUser=(userId)=>prisma.blockedUser.deleteMany({where:{telegramUserId:BigInt(userId)}});
export async function registerFailedAttempt(userId){ const redis=getRedis(); const key=`failed_attempts:${userId}`; const count=await redis.incr(key); if(count===1) await redis.expire(key,600); const max=Number(process.env.MAX_FAILED_ATTEMPTS||5); if(count>=max){ const minutes=Number(process.env.TEMPORARY_BLOCK_MINUTES||30); await banUser(userId,'too_many_failed_attempts',minutes); await redis.del(key); return {blocked:true,count}; } return {blocked:false,count}; }
export const clearFailedAttempts=(userId)=>getRedis().del(`failed_attempts:${userId}`);
