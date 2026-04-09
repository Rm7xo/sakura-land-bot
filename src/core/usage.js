import { prisma } from '../db/prisma.js';
import { todayKey } from '../utils/time.js';
export const getUsage=(orderId)=>prisma.orderUsageDaily.findUnique({where:{orderId_usageDate:{orderId:String(orderId),usageDate:todayKey()}}});
export const getUsageCount=async(orderId)=>(await getUsage(orderId))?.usageCount||0;
export async function incrementUsage(orderId,limit){
 const row=await prisma.orderUsageDaily.upsert({
   where:{orderId_usageDate:{orderId:String(orderId),usageDate:todayKey()}},
   update:{usageCount:{increment:1}},
   create:{orderId:String(orderId),usageDate:todayKey(),usageCount:1}
 });
 return {used:row.usageCount,left:Math.max(0,limit-row.usageCount),limit};
}
export const resetLimit=(orderId)=>prisma.orderUsageDaily.deleteMany({where:{orderId:String(orderId),usageDate:todayKey()}});
