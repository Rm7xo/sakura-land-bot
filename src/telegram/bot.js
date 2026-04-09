import fs from 'fs';
import { Telegraf } from 'telegraf';
import { prisma } from '../db/prisma.js';
import { messages } from './messages.js';
import { mainMenu, platformsMenu, steamAccountsMenu, reviewsMenu } from './keyboards.js';
import { loadAppConfig } from '../utils/config.js';
import { getSession, upsertSession, clearSession, isSessionExpired } from '../core/sessions.js';
import { getOrderById, isAcceptedOrderStatus } from '../salla/api.js';
import { bindOrderToUser } from '../core/bindings.js';
import { getUsageCount, incrementUsage } from '../core/usage.js';
import { addSecurityLog, isBlocked, registerFailedAttempt, clearFailedAttempts } from '../core/security.js';
import { addGenerationLog } from '../core/logs.js';
import { addReview, getLatestReviews } from '../core/reviews.js';
import { getSteamAccount, generateFromShared } from '../steam/steam.js';
import { registerAdminCommands } from './adminCommands.js';

let botInstance = null;

async function notifyAdmin(text){ if(!botInstance||!process.env.TELEGRAM_ADMIN_CHAT_ID) return; try{ await botInstance.telegram.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID,text); }catch{} }
function sendImageOrText(ctx,imagePath,text,extra){ if(imagePath&&fs.existsSync(imagePath)&&fs.statSync(imagePath).size>0) return ctx.replyWithPhoto({source:imagePath},{caption:text,...extra}); return ctx.reply(text,extra); }
async function getBindingForUser(userId){ return prisma.orderBinding.findFirst({where:{telegramUserId:BigInt(userId)},orderBy:{boundAt:'desc'}}); }

export async function startTelegramBot(){
 if(botInstance) return botInstance;
 if(!process.env.TELEGRAM_BOT_TOKEN){ console.log('Telegram token missing, bot skipped'); return null; }
 const cfg=loadAppConfig();
 botInstance=new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
 botInstance.start(async ctx=>{ await sendImageOrText(ctx,cfg.images?.welcome,messages.welcome,mainMenu()); });
 botInstance.command('help',async ctx=>ctx.reply(messages.howToUse,mainMenu()));
 botInstance.command('cancel',async ctx=>{ await clearSession(ctx.from.id); await ctx.reply(messages.cancel); });
 registerAdminCommands(botInstance);
 botInstance.action('back_main',async ctx=>{ await ctx.answerCbQuery(); await ctx.reply(messages.welcome,mainMenu()); });
 botInstance.action('platforms',async ctx=>{ await ctx.answerCbQuery(); await sendImageOrText(ctx,cfg.images?.platforms,messages.platforms,platformsMenu()); });
 botInstance.action('platform_steam',async ctx=>{ await ctx.answerCbQuery(); await upsertSession(ctx.from.id,{state:'selecting_account'}); await sendImageOrText(ctx,cfg.images?.steam,'اختر حساب Steam المطلوب',steamAccountsMenu()); });
 botInstance.action(/account_.+/,async ctx=>{ await ctx.answerCbQuery(); const accountId=ctx.match[0].replace('account_',''); await upsertSession(ctx.from.id,{state:'waiting_for_order_number',selectedPlatform:'steam',selectedAccount:accountId}); await ctx.reply(messages.askOrder); });
 botInstance.action('cancel_flow',async ctx=>{ await ctx.answerCbQuery(); await clearSession(ctx.from.id); await ctx.reply(messages.cancel); });
 botInstance.action('track_order',async ctx=>{ await ctx.answerCbQuery(); await upsertSession(ctx.from.id,{state:'waiting_track_order_number'}); await ctx.reply(messages.trackOrder); });
 botInstance.action('working_hours',async ctx=>{ await ctx.answerCbQuery(); await ctx.reply(messages.workingHours); });
 botInstance.action('terms',async ctx=>{ await ctx.answerCbQuery(); await ctx.reply(messages.terms); });
 botInstance.action('how_to_use',async ctx=>{ await ctx.answerCbQuery(); await ctx.reply(messages.howToUse); });
 botInstance.action('support',async ctx=>{ await ctx.answerCbQuery(); await ctx.reply(messages.support); });
 botInstance.action('reviews', async ctx => {
  await ctx.answerCbQuery();

  const latest = await getLatestReviews(5);

  const lines = latest.length
    ? latest.map((r, i) => `${i + 1}- ${r.rating}/5 | ${r.reviewText}`).join('\n')
    : 'لا توجد تقييمات بعد';

  await sendImageOrText(
    ctx,
    cfg.images?.reviews,
    `آخر 5 تقييمات:\n\n${lines}`,
    reviewsMenu()
  );
});

 botInstance.action('add_review',async ctx=>{ await ctx.answerCbQuery(); await upsertSession(ctx.from.id,{state:'waiting_review_text'}); await ctx.reply('أرسل نص التقييم الآن'); });
 botInstance.action('my_order_info',async ctx=>{ await ctx.answerCbQuery(); const binding=await getBindingForUser(ctx.from.id); if(!binding) return ctx.reply('لا يوجد طلب مرتبط بك حاليًا'); const used=await getUsageCount(binding.orderId); await ctx.reply(`معلومات طلبك
رقم الطلب: ${binding.orderId}#
المنصة: ${binding.platform}
الحساب: ${binding.accountId}
الاستخدام اليوم: ${used} / 3`); });
 botInstance.action('request_help',async ctx=>{ await ctx.answerCbQuery(); await notifyAdmin(`🆘 طلب مساعدة
User: ${ctx.from.id}
Username: @${ctx.from.username||'-'}`); await ctx.reply('تم إرسال طلب المساعدة للإدارة'); });
 botInstance.on('text',async ctx=>{
   if(await isBlocked(ctx.from.id)) return ctx.reply('أنت محظور مؤقتًا بسبب كثرة المحاولات');
   const session=await getSession(ctx.from.id); if(!session) return;
   if(isSessionExpired(session)){ await clearSession(ctx.from.id); return ctx.reply(messages.timeout); }
   const text=ctx.message.text.trim();
   if(session.state==='waiting_track_order_number'){ await clearSession(ctx.from.id); const result=await getOrderById(text); if(!result.ok) return ctx.reply('تعذر التحقق من حالة الطلب'); return ctx.reply(`تم العثور على الطلب ✅
الحالة: ${result.data.status||'غير معروف'}`); }
   if(session.state==='waiting_review_text'){ await clearSession(ctx.from.id); await addReview({telegramUserId:BigInt(ctx.from.id),orderId:(await getBindingForUser(ctx.from.id))?.orderId||null,rating:5,reviewText:text}); return ctx.reply('تم حفظ التقييم بنجاح'); }
   if(session.state!=='waiting_for_order_number') return;
   const orderId=text; const account=getSteamAccount(session.selectedAccount); if(!account){ await clearSession(ctx.from.id); return ctx.reply('الحساب المحدد غير موجود'); }
   const orderCheck=await getOrderById(orderId);
   if(!orderCheck.ok || !isAcceptedOrderStatus(orderCheck.data)){ const failed=await registerFailedAttempt(ctx.from.id); await clearSession(ctx.from.id); await addSecurityLog('invalid_order','order_not_paid_or_missing',{telegramUserId:ctx.from.id,orderId}); await notifyAdmin(`❌ فشل تحقق الطلب
رقم الطلب: ${orderId}#
ID: ${ctx.from.id}`); return ctx.reply(failed.blocked?'تم حظرك مؤقتًا بسبب كثرة المحاولات الخاطئة.':messages.invalidOrder); }
   const binding=await bindOrderToUser(orderId,ctx.from,'steam',session.selectedAccount);
   if(!binding.ok){ await clearSession(ctx.from.id); await addSecurityLog('bound_to_another','order_already_bound',{telegramUserId:ctx.from.id,orderId}); await notifyAdmin(`🚫 محاولة مرفوضة
رقم الطلب: ${orderId}#
السبب: الطلب مرتبط مسبقًا بحساب آخر
ID: ${ctx.from.id}`); return ctx.reply(messages.boundToAnother); }
   const dailyLimit=account.daily_limit || Number(process.env.DEFAULT_DAILY_LIMIT||3); const used=await getUsageCount(orderId);
   if(used>=dailyLimit){ await clearSession(ctx.from.id); await addSecurityLog('daily_limit_reached','daily_limit',{telegramUserId:ctx.from.id,orderId}); await notifyAdmin(`⚠️ تجاوز الحد اليومي
رقم الطلب: ${orderId}#
ID: ${ctx.from.id}`); return ctx.reply(messages.reachedLimit); }
   const code=generateFromShared(account.shared_secret); const usage=await incrementUsage(orderId,dailyLimit); await clearFailedAttempts(ctx.from.id);
   await addGenerationLog({orderId:String(orderId),telegramUserId:BigInt(ctx.from.id),platform:'steam',accountId:session.selectedAccount,result:'success',codeMaskedOrHash:`***${String(code).slice(-2)}`});
   await notifyAdmin(`✅ توليد كود ناجح
رقم الطلب: ${orderId}#
المنصة: Steam
الحساب: ${account.name}
المستخدم: ${ctx.from.first_name||'-'}
ID: ${ctx.from.id}
الاستخدام اليوم: ${usage.used}/${usage.limit}`);
   await clearSession(ctx.from.id);
   return ctx.reply(`تم التحقق من الطلب بنجاح ✅

الكود الخاص بك:
${code}

عدد مرات الاستخدام اليوم: ${usage.used}/${usage.limit}
المتبقي لك اليوم: ${usage.left}

هذا الكود خاص بطلبك فقط، وأي إساءة استخدام قد تؤدي إلى إيقاف الخدمة`);
 });
 await botInstance.launch(); console.log('Telegram bot started'); return botInstance;
}
