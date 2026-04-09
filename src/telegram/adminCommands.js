import { prisma } from '../db/prisma.js';
import { unbindOrder, getBinding } from '../core/bindings.js';
import { getUsageCount, resetLimit } from '../core/usage.js';
import { banUser, unbanUser, getSecurityLogs } from '../core/security.js';
import { getGenerationLogs } from '../core/logs.js';
function isAdmin(ctx){ return String(ctx.from.id)===String(process.env.TELEGRAM_ADMIN_CHAT_ID); }
export function registerAdminCommands(bot){
 bot.command('admin',async ctx=>{ if(!isAdmin(ctx)) return; await ctx.reply('أوامر الأدمن:
/findorder 12345
/finduser 123456789
/unbind 12345
/resetlimit 12345
/ban 123456789
/unban 123456789
/logs 12345'); });
 bot.command('findorder',async ctx=>{ if(!isAdmin(ctx)) return; const orderId=ctx.message.text.split(' ')[1]; const binding=await getBinding(orderId); const used=await getUsageCount(orderId); if(!binding) return ctx.reply('لم يتم العثور على الطلب'); await ctx.reply(`معلومات الطلب
رقم الطلب: ${orderId}#
مرتبط مع: @${binding.telegramUsername||'-'}
Telegram ID: ${binding.telegramUserId}
المنصة: ${binding.platform}
الحساب: ${binding.accountId}
تاريخ الربط: ${binding.boundAt}
استخدام اليوم: ${used}/3
الحالة: ${binding.status}`); });
 bot.command('finduser',async ctx=>{ if(!isAdmin(ctx)) return; const userId=BigInt(ctx.message.text.split(' ')[1]); const bindings=await prisma.orderBinding.findMany({where:{telegramUserId:userId}}); await ctx.reply(JSON.stringify(bindings,null,2)); });
 bot.command('unbind',async ctx=>{ if(!isAdmin(ctx)) return; const orderId=ctx.message.text.split(' ')[1]; await unbindOrder(orderId); await ctx.reply(`تم فك ربط الطلب ${orderId}# بنجاح`); });
 bot.command('resetlimit',async ctx=>{ if(!isAdmin(ctx)) return; const orderId=ctx.message.text.split(' ')[1]; await resetLimit(orderId); await ctx.reply(`تم تصفير الحد اليومي للطلب ${orderId}#`); });
 bot.command('ban',async ctx=>{ if(!isAdmin(ctx)) return; const userId=Number(ctx.message.text.split(' ')[1]); await banUser(userId,'manual_admin',1440); await ctx.reply(`تم حظر المستخدم ${userId}`); });
 bot.command('unban',async ctx=>{ if(!isAdmin(ctx)) return; const userId=Number(ctx.message.text.split(' ')[1]); await unbanUser(userId); await ctx.reply(`تم فك حظر المستخدم ${userId}`); });
 bot.command('logs',async ctx=>{ if(!isAdmin(ctx)) return; const orderId=ctx.message.text.split(' ')[1]; const security=await getSecurityLogs(orderId); const generation=await getGenerationLogs(orderId); await ctx.reply(`Security Logs:
${JSON.stringify(security,null,2)}

Generation Logs:
${JSON.stringify(generation,null,2)}`); });
}
