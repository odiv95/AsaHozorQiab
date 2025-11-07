// generate-keys.js
const webPush = require('web-push');

// تولید کلیدهای VAPID
const vapidKeys = webPush.generateVAPIDKeys();

console.log('🎯 کلیدهای VAPID تولید شد:');
console.log('=================================');
console.log('Public Key (کلید عمومی):');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key (کلید خصوصی - محرمانه):');
console.log(vapidKeys.privateKey);
console.log('=================================');

// ذخیره در فایل (اختیاری)
const fs = require('fs');
fs.writeFileSync('vapid-keys.json', JSON.stringify(vapidKeys, null, 2));
console.log('✅ کلیدها در فایل vapid-keys.json ذخیره شد');