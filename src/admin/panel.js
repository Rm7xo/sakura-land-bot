import { prisma } from '../db/prisma.js';
export async function adminPanelHandler(req,res){
 const [bindings,usage,generationLogs,securityLogs,blocked,reviews]=await Promise.all([
  prisma.orderBinding.findMany({orderBy:{boundAt:'desc'},take:50}),
  prisma.orderUsageDaily.findMany({orderBy:{updatedAt:'desc'},take:50}),
  prisma.generationLog.findMany({orderBy:{createdAt:'desc'},take:50}),
  prisma.securityLog.findMany({orderBy:{createdAt:'desc'},take:50}),
  prisma.blockedUser.findMany({orderBy:{createdAt:'desc'},take:50}),
  prisma.review.findMany({orderBy:{createdAt:'desc'},take:50})
 ]);
 res.send(`<html lang="ar" dir="rtl"><head><meta charset="UTF-8"/><title>Sakura Land Admin</title><style>body{font-family:Arial;background:#0f172a;color:#fff;padding:24px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{background:#111827;border:1px solid #334155;border-radius:16px;padding:16px}pre{white-space:pre-wrap;word-break:break-word;background:#020617;padding:10px;border-radius:10px}</style></head><body><h1>لوحة إدارة Sakura Land</h1><div class="grid"><div class="card"><h2>الطلبات المربوطة</h2><pre>${JSON.stringify(bindings,null,2)}</pre></div><div class="card"><h2>الاستخدام اليومي</h2><pre>${JSON.stringify(usage,null,2)}</pre></div><div class="card"><h2>سجلات التوليد</h2><pre>${JSON.stringify(generationLogs,null,2)}</pre></div><div class="card"><h2>السجلات الأمنية</h2><pre>${JSON.stringify(securityLogs,null,2)}</pre></div><div class="card"><h2>المحظورون</h2><pre>${JSON.stringify(blocked,null,2)}</pre></div><div class="card"><h2>التقييمات</h2><pre>${JSON.stringify(reviews,null,2)}</pre></div></div></body></html>`);
}
