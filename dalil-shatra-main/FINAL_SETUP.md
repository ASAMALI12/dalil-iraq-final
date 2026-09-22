# دليل العراق — النسخة النهائية

## نظام الإعلان المدفوع

الإعلان المدفوع يعمل بهذا التسلسل:

1. صاحب المتجر الموثق يفتح إنشاء الإعلان.
2. يختار متجره الموثق.
3. يكتب العنوان والوصف والشارة.
4. يختار لون الخلفية ولون النص والخط.
5. يرفع صورة واحدة أو عدة صور لعرضها بالتتابع.
6. يضغط متابعة للدفع.
7. يحول المبلغ عبر زين كاش أو Mastercard.
8. يدخل رقم عملية التحويل ويرفق الوصل.
9. الطلب يصبح `pending`.
10. المدير يراجع الوصل من لوحة الإعلانات.
11. عند الموافقة يُنشأ الإعلان ويبدأ احتساب مدة الإعلان من وقت الموافقة.
12. عند الرفض لا يتم نشر الإعلان.

## إعداد الأسرار

يجب ضبط هذه القيم على الخادم / Supabase Edge Function، وليس داخل APK:

- `IRAQ_ADMIN_PHONE` — رقم زين كاش الذي يستقبل الدفع.
- `IRAQ_ADMIN_USERNAME` — اسم مستخدم المدير.
- `IRAQ_ADMIN_PASSWORD` — كلمة مرور المدير.
- `ADMIN_TOKEN_SECRET` — سر طويل عشوائي.
- `IRAQ_MASTER_CARD_ACCOUNT` — رقم/حساب Mastercard الذي يستقبل التحويل.
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_API_PHONE_NUMBER_ID`
- `WHATSAPP_API_URL`

لا تضع `SUPABASE_SERVICE_ROLE_KEY` داخل التطبيق.

## GitHub

بعد فك الضغط:

```bash
cd dalil-shatra-main
git init
git add .
git commit -m "feat: finalize Dalil Iraq app"
git branch -M main
git remote add origin https://github.com/ASAMALI12/dalil-iraq.git
git push -u origin main
```

إذا كان المستودع يحتوي على ملفات أحدث لا تريد استبدالها، لا تنفذ `push --force`. ارفع النسخة إلى فرع جديد أولاً:

```bash
git checkout -b final-security-and-ads
git push -u origin final-security-and-ads
```

ثم راجع التغييرات قبل دمجها إلى `main`.
