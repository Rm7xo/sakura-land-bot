import fs from "fs";
import path from "path";
import { generateFromShared } from "./src/steam/steam.js";

const filePath = path.resolve("./config/steamAccounts.json");

console.log("المسار:", filePath);

try {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  const account = data.steam_accounts.find(a => a.id === "steam_1");

  if (!account) {
    console.log("الحساب غير موجود");
    process.exit(1);
  }

  console.log("اسم الحساب:", account.name);
  console.log("الحالة:", account.status);
  console.log("الكود الحالي:", generateFromShared(account.shared_secret));

} catch (err) {
  console.error("خطأ:", err.message);
}