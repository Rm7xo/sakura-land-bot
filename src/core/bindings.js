import { prisma } from '../db/prisma.js';
export const getBinding=(orderId)=>prisma.orderBinding.findUnique({where:{orderId:String(orderId)}});
export async function bindOrderToUser(orderId,user,platform,accountId){
 const current=await getBinding(orderId);
 if(!current){
   const binding=await prisma.orderBinding.create({data:{orderId:String(orderId),telegramUserId:BigInt(user.id),telegramUsername:user.username||null,telegramFirstName:user.first_name||null,telegramLastName:user.last_name||null,platform,accountId}});
   return {ok:true,created:true,binding};
 }
 if(String(current.telegramUserId)!==String(user.id)) return {ok:false,reason:'bound_to_another',binding:current};
 return {ok:true,created:false,binding:current};
}
export const unbindOrder=(orderId)=>prisma.orderBinding.deleteMany({where:{orderId:String(orderId)}});
