# Life Order oqimlari va interfeysini tuzatish

## Maqsad
Ro'yxatdan o'tishdan onboarding orqali dashboardga o'tishni ishonchli qilish, navigatsiyani foydalanuvchi so'ragan besh asosiy bo'limga qaytarish, AI xatolarini tushunarli qilish va katta ekranlarda keng, professional ko'rinish yaratish.

## Amalga oshiriladigan ishlar

1. **Kirish va onboarding oqimi**
   - Yangi hisobni to'g'ridan-to'g'ri onboardingga yuborish; dashboardning oraliq ko'rinishini yo'qotish.
   - Mavjud hisob kirganda profil holatini tekshirib, onboarding tugagan bo'lsa dashboardga, tugamagan bo'lsa onboardingga yuborish.
   - “Boshlash” bosilganda profil javoblarini saqlash, saqlangan holatni darhol yangilash va qayta birinchi savolga tushish muammosini bartaraf etish.
   - Savollardan maqsad, to'siq, raqamli odatlar va tana ma'lumotlari asosida boshlang'ich shaxsiy reja ko'rsatkichlarini shakllantirish.

2. **Asosiy navigatsiya va katta ekran**
   - Pastki besh menyuni `Tana`, `Bilim`, `Asosiy`, `Odat`, `Davra` tartibiga qaytarish.
   - Hub sahifalaridagi yuqori hub almashtirgichni olib tashlash va eski hub havolalarini asosiy bo'limlarga yo'naltirish.
   - Telefon ko'rinishini saqlagan holda desktopda sahifa kengligidan samarali foydalanadigan kengroq dashboard va kontent joylashuvini yaratish.
   - FAB va menyularning tugmalar bilan ustma-ust tushmasligini tuzatish.

3. **Landing va auth**
   - Landing sarlavhasida Life Order brendini kuchaytirish, tema va til boshqaruvini ko'rinadigan joyga qo'yish.
   - Bepul imkoniyatlar, premiumda olinadigan qiymat va ishlash tartibini aniq ko'rsatish.
   - Animatsiyalarni mazmunni ochishga xizmat qiladigan, yengil va harakatni kamaytirish sozlamasiga mos holatda yaxshilash.
   - Auth sahifasini desktopda kengroq va izchil qilish; ro'yxatdan o'tish, kirish va parol tiklash holatlarini ravshanlashtirish.

4. **AI tajribasi va kredit xabari**
   - Kredit tugaganda foydalanuvchiga “ilova egasi to'ldirishi kerak” degan texnik xabarni ko'rsatmaslik.
   - AI vaqtincha mavjud bo'lmasa, foydalanuvchining mavjud ko'rsatkichlaridan mahalliy, amaliy tavsiya beradigan zaxira javobini ishlatish.
   - Chat yozish maydoni va yuborish tugmasini barqaror o'lchamlarda joylashtirib, AI/FAB belgisi bilan ustma-ust tushishni bartaraf etish.
   - Workspace AI sarfini tekshirish natijasini yakuniy hisobotda aniq tushuntirish.

5. **Tekshiruv**
   - TypeScript tekshiruvini ishga tushirish.
   - Ro'yxatdan o'tish → onboarding → dashboard oqimini haqiqiy brauzerda tekshirish.
   - Landing, auth, dashboard va AI oynasini desktop hamda mobil o'lchamlarda ko'rib chiqish.
   - O'zgartirilgan barcha sahifalarning metadata va asosiy boshqaruvlari saqlanganini tekshirish.

## Texnik tafsilotlar
- Profilning `onboarding_completed` holati bitta ishonchli yo'naltirish manbai bo'ladi; saqlashdan keyin profil keshi yangilanadi.
- AI uchun pullik xizmat ishlamasa ham statistikaga asoslangan zaxira tavsiya ishlaydi; bu haqiqiy generativ AI emasligi yashirilmaydi.
- Mavjud backend jadvali va xavfsizlik qoidalari saqlanadi; bu bosqich yangi tashqi SMS/Telegram xizmatlarini qo'shmaydi.
