import * as React from "react";

export const LANGS = [
  { v: "uz", label: "O'zbekcha" },
  { v: "uzc", label: "Ўзбекча" },
  { v: "ru", label: "Русский" },
  { v: "en", label: "English" },
] as const;
export type Lang = (typeof LANGS)[number]["v"];

/** Persisted interface language (read after hydration to avoid SSR mismatch). */
export function useLang() {
  const [lang, setLangState] = React.useState<Lang>("uz");
  React.useEffect(() => {
    const s = window.localStorage.getItem("lang") as Lang | null;
    if (s && LANGS.some((l) => l.v === s)) setLangState(s);
  }, []);
  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("lang", l);
    document.documentElement.lang = l === "uzc" ? "uz-Cyrl" : l;
  }, []);
  return { lang, setLang };
}

type Item = { t: string; d: string };
export type LandingDict = {
  nav: { how: string; modules: string; pricing: string; faq: string; login: string };
  badge: string;
  h1a: string;
  h1b: string;
  sub: string;
  cta: string;
  ctaNote: string;
  secondary: string;
  proof: string;
  todayTitle: string;
  todayItems: [string, string, string];
  streak: string;
  problemTitle: string;
  problems: Item[];
  howTitle: string;
  how: Item[];
  modulesTitle: string;
  modulesSub: string;
  modules: Item[];
  voicesTitle: string;
  voicesNote: string;
  voices: { name: string; role: string; text: string }[];
  pricingTitle: string;
  pricingSub: string;
  free: { name: string; note: string; cta: string; items: string[] };
  premium: { name: string; note: string; cta: string; period: string; items: string[]; soon: string };
  best: string;
  guarantee: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalSub: string;
  footer: string;
};

const uz: LandingDict = {
  nav: { how: "Qanday ishlaydi", modules: "Modullar", pricing: "Narxlar", faq: "Savollar", login: "Kirish" },
  badge: "Har kuni 3 ta qadam. Har kuni oldinga.",
  h1a: "Motivatsiya tugaydi.",
  h1b: "Tizim qoladi.",
  sub: "Life Order sizga ko'proq ma'lumot bermaydi — hayotingizni boshqarishga yordam beradi. Har kuni ertalab aynan siz uchun tuzilgan 3 ta aniq qadam.",
  cta: "Bepul boshlash",
  ctaNote: "2 daqiqa · Karta kerak emas",
  secondary: "Qanday ishlaydi?",
  proof: "To'liq o'zbek tilida · Ma'lumotlaringiz faqat sizniki",
  todayTitle: "Bugungi 3 qadam",
  todayItems: ["20 daqiqa mashq", "15 bet kitob", "23:00 da uyqu"],
  streak: "12 kun ketma-ket",
  problemTitle: "Tanish holatmi?",
  problems: [
    { t: "Dushanbadan boshlayman", d: "Har hafta yangi reja — va har hafta yana boshidan." },
    { t: "Ilovalar ko'p, natija yo'q", d: "Mashq, kitob, odat uchun alohida 5 ta ilova. Hech biri bir-birini bilmaydi." },
    { t: "Kun telefonga ketadi", d: "Kechqurun o'ylaysiz: bugun aslida nima qildim?" },
  ],
  howTitle: "Uch qadamda tizim",
  how: [
    { t: "2 daqiqalik tanishuv", d: "Maqsadingiz va to'siqlaringiz haqida bir necha savol." },
    { t: "Har kuni 3 ta qadam", d: "Tizim kun uchun eng muhim 3 ta ishni tanlaydi. Bir tegishda belgilaysiz." },
    { t: "Haftalik xulosa", d: "AI murabbiy nima ishlayotganini va nimani o'zgartirish kerakligini aytadi." },
  ],
  modulesTitle: "Bitta tizim — butun hayot",
  modulesSub: "Har bir soha alohida ilova emas, bir tizimning bo'lagi. Shuning uchun ular bir-birini kuchaytiradi.",
  modules: [
    { t: "Tana", d: "Mashq, ovqat, uyqu, suv — sizning vazn va maqsadingizga moslangan reja." },
    { t: "Bilim", d: "Kitob va kurslar, kunlik o'qish maqsadi va progress." },
    { t: "Odatlar", d: "Kichik odatlar, ketma-ketlik va haftalik bajarilish foizi." },
    { t: "Davra", d: "Maqsadi bir xil odamlar bilan guruh va o'zaro mas'uliyat." },
    { t: "Kundalik", d: "Fikrlar, kayfiyat va vaqtli eslatmalar." },
    { t: "AI murabbiy", d: "Raqamlaringizga qarab aniq keyingi qadamni aytadi." },
  ],
  voicesTitle: "Tizim bilan yashayotganlar",
  voicesNote: "Namuna fikrlar",
  voices: [
    { name: "Diyor, 24", role: "Dasturchi", text: "Birinchi marta 30 kundan oshiq mashqni tashlamadim. Sababi — har kuni nima qilishni o'ylab o'tirmayman." },
    { name: "Madina, 29", role: "O'qituvchi", text: "Telefonda kuniga 6 soat edi, hozir 3 soat. O'sha vaqtga 4 ta kitob o'qidim." },
    { name: "Sardor, 33", role: "Tadbirkor", text: "Davradagi do'stlarim bilan har kuni belgilaymiz. Uyalib ham tashlab bo'lmaydi." },
  ],
  pricingTitle: "Oddiy va ochiq narxlar",
  pricingSub: "Bepul boshlang. Tizim ishlayotganini his qilganingizda Premiumga o'ting.",
  free: {
    name: "Bepul",
    note: "Tizimni boshlash uchun hamma asosiy narsa.",
    cta: "Bepul boshlash",
    items: ["Barcha 5 modul", "3 tagacha faol odat", "Kaloriya va makro hisobi", "Kuniga 5 ta AI savol", "Sayt ichidagi eslatmalar"],
  },
  premium: {
    name: "Premium",
    note: "Hayotingizni to'liq boshqarish uchun shaxsiy tizim.",
    cta: "Premiumni tanlash",
    period: "so'm / oy",
    items: ["Cheksiz odat va maqsadlar", "Cheksiz AI murabbiy + haftalik tahlil", "AI tuzgan kun tartibi, ovqat va mashq rejasi", "Chuqur analitika va hisobotlar", "Telegram va email eslatmalar"],
    soon: "tez kunda",
  },
  best: "Eng foydali",
  guarantee: "Istalgan vaqtda bekor qilish · Yashirin to'lovlar yo'q",
  faqTitle: "Ko'p beriladigan savollar",
  faq: [
    { q: "Haqiqatan bepulmi?", a: "Ha. Bepul reja muddatsiz. Karta ma'lumotlari so'ralmaydi." },
    { q: "Kuniga qancha vaqt ketadi?", a: "Belgilash uchun 1–2 daqiqa. Qolgan vaqt — o'sha 3 ta qadamni bajarish." },
    { q: "Ma'lumotlarim xavfsizmi?", a: "Har bir foydalanuvchi faqat o'z ma'lumotini ko'radi. Biz ma'lumotlaringizni sotmaymiz va hech kimga bermaymiz." },
    { q: "AI murabbiy shifokor o'rnini bosadimi?", a: "Yo'q. U kundalik odat va reja bo'yicha yordamchi. Sog'liq muammolarida mutaxassisga murojaat qiling." },
    { q: "Telefonda ishlaydimi?", a: "Ha, sayt telefon uchun moslangan. Uni bosh ekranga qo'shib, ilova kabi ishlatish mumkin." },
  ],
  finalTitle: "Ertangi kuningiz bugun tuziladi",
  finalSub: "2 daqiqa — va birinchi 3 qadamingiz tayyor.",
  footer: "Motivatsiya tugaydi. Tizim qoladi.",
};

const uzc: LandingDict = {
  nav: { how: "Қандай ишлайди", modules: "Модуллар", pricing: "Нархлар", faq: "Саволлар", login: "Кириш" },
  badge: "Ҳар куни 3 та қадам. Ҳар куни олдинга.",
  h1a: "Мотивация тугайди.",
  h1b: "Тизим қолади.",
  sub: "Life Order сизга кўпроқ маълумот бермайди — ҳаётингизни бошқаришга ёрдам беради. Ҳар куни эрталаб айнан сиз учун тузилган 3 та аниқ қадам.",
  cta: "Бепул бошлаш",
  ctaNote: "2 дақиқа · Карта керак эмас",
  secondary: "Қандай ишлайди?",
  proof: "Тўлиқ ўзбек тилида · Маълумотларингиз фақат сизники",
  todayTitle: "Бугунги 3 қадам",
  todayItems: ["20 дақиқа машқ", "15 бет китоб", "23:00 да уйқу"],
  streak: "12 кун кетма-кет",
  problemTitle: "Таниш ҳолатми?",
  problems: [
    { t: "Душанбадан бошлайман", d: "Ҳар ҳафта янги режа — ва ҳар ҳафта яна бошидан." },
    { t: "Иловалар кўп, натижа йўқ", d: "Машқ, китоб, одат учун алоҳида 5 та илова. Ҳеч бири бир-бирини билмайди." },
    { t: "Кун телефонга кетади", d: "Кечқурун ўйлайсиз: бугун аслида нима қилдим?" },
  ],
  howTitle: "Уч қадамда тизим",
  how: [
    { t: "2 дақиқалик танишув", d: "Мақсадингиз ва тўсиқларингиз ҳақида бир неча савол." },
    { t: "Ҳар куни 3 та қадам", d: "Тизим кун учун энг муҳим 3 та ишни танлайди. Бир тегишда белгилайсиз." },
    { t: "Ҳафталик хулоса", d: "AI мураббий нима ишлаётганини ва нимани ўзгартириш кераклигини айтади." },
  ],
  modulesTitle: "Битта тизим — бутун ҳаёт",
  modulesSub: "Ҳар бир соҳа алоҳида илова эмас, бир тизимнинг бўлаги. Шунинг учун улар бир-бирини кучайтиради.",
  modules: [
    { t: "Тана", d: "Машқ, овқат, уйқу, сув — вазн ва мақсадингизга мосланган режа." },
    { t: "Билим", d: "Китоб ва курслар, кунлик ўқиш мақсади ва прогресс." },
    { t: "Одатлар", d: "Кичик одатлар, кетма-кетлик ва ҳафталик бажарилиш фоизи." },
    { t: "Давра", d: "Мақсади бир хил одамлар билан гуруҳ ва ўзаро масъулият." },
    { t: "Кундалик", d: "Фикрлар, кайфият ва вақтли эслатмалар." },
    { t: "AI мураббий", d: "Рақамларингизга қараб аниқ кейинги қадамни айтади." },
  ],
  voicesTitle: "Тизим билан яшаётганлар",
  voicesNote: "Намуна фикрлар",
  voices: [
    { name: "Диёр, 24", role: "Дастурчи", text: "Биринчи марта 30 кундан ошиқ машқни ташламадим. Ҳар куни нима қилишни ўйлаб ўтирмайман." },
    { name: "Мадина, 29", role: "Ўқитувчи", text: "Телефонда кунига 6 соат эди, ҳозир 3 соат. Ўша вақтга 4 та китоб ўқидим." },
    { name: "Сардор, 33", role: "Тадбиркор", text: "Даврадаги дўстларим билан ҳар куни белгилаймиз. Уялиб ҳам ташлаб бўлмайди." },
  ],
  pricingTitle: "Оддий ва очиқ нархлар",
  pricingSub: "Бепул бошланг. Тизим ишлаётганини ҳис қилганингизда Премиумга ўтинг.",
  free: {
    name: "Бепул",
    note: "Тизимни бошлаш учун ҳамма асосий нарса.",
    cta: "Бепул бошлаш",
    items: ["Барча 5 модул", "3 тагача фаол одат", "Калория ва макро ҳисоби", "Кунига 5 та AI савол", "Сайт ичидаги эслатмалар"],
  },
  premium: {
    name: "Премиум",
    note: "Ҳаётингизни тўлиқ бошқариш учун шахсий тизим.",
    cta: "Премиумни танлаш",
    period: "сўм / ой",
    items: ["Чексиз одат ва мақсадлар", "Чексиз AI мураббий + ҳафталик таҳлил", "AI тузган кун тартиби, овқат ва машқ режаси", "Чуқур аналитика ва ҳисоботлар", "Telegram ва email эслатмалар"],
    soon: "тез кунда",
  },
  best: "Энг фойдали",
  guarantee: "Исталган вақтда бекор қилиш · Яширин тўловлар йўқ",
  faqTitle: "Кўп бериладиган саволлар",
  faq: [
    { q: "Ҳақиқатан бепулми?", a: "Ҳа. Бепул режа муддатсиз. Карта маълумотлари сўралмайди." },
    { q: "Кунига қанча вақт кетади?", a: "Белгилаш учун 1–2 дақиқа. Қолган вақт — ўша 3 та қадамни бажариш." },
    { q: "Маълумотларим хавфсизми?", a: "Ҳар бир фойдаланувчи фақат ўз маълумотини кўради. Биз маълумотларингизни сотмаймиз." },
    { q: "AI мураббий шифокор ўрнини босадими?", a: "Йўқ. У кундалик одат ва режа бўйича ёрдамчи. Соғлиқ муаммоларида мутахассисга мурожаат қилинг." },
    { q: "Телефонда ишлайдими?", a: "Ҳа, сайт телефон учун мосланган. Уни бош экранга қўшиб, илова каби ишлатиш мумкин." },
  ],
  finalTitle: "Эртанги кунингиз бугун тузилади",
  finalSub: "2 дақиқа — ва биринчи 3 қадамингиз тайёр.",
  footer: "Мотивация тугайди. Тизим қолади.",
};

const ru: LandingDict = {
  nav: { how: "Как это работает", modules: "Модули", pricing: "Цены", faq: "Вопросы", login: "Войти" },
  badge: "3 шага в день. Каждый день вперёд.",
  h1a: "Мотивация заканчивается.",
  h1b: "Система остаётся.",
  sub: "Life Order не даёт вам больше информации — он помогает управлять жизнью. Каждое утро 3 конкретных шага, составленных именно для вас.",
  cta: "Начать бесплатно",
  ctaNote: "2 минуты · Без карты",
  secondary: "Как это работает?",
  proof: "На узбекском и русском · Ваши данные принадлежат только вам",
  todayTitle: "3 шага на сегодня",
  todayItems: ["20 минут тренировки", "15 страниц книги", "Сон в 23:00"],
  streak: "12 дней подряд",
  problemTitle: "Знакомо?",
  problems: [
    { t: "Начну с понедельника", d: "Каждую неделю новый план — и каждую неделю всё сначала." },
    { t: "Много приложений, нет результата", d: "5 отдельных приложений для спорта, книг и привычек. Ни одно не знает о другом." },
    { t: "День уходит в телефон", d: "Вечером думаете: а что я сегодня на самом деле сделал?" },
  ],
  howTitle: "Система в три шага",
  how: [
    { t: "Знакомство за 2 минуты", d: "Несколько вопросов о целях и препятствиях." },
    { t: "3 шага каждый день", d: "Система выбирает 3 главных дела. Отмечаете одним касанием." },
    { t: "Итоги недели", d: "AI-наставник показывает, что работает и что стоит изменить." },
  ],
  modulesTitle: "Одна система — вся жизнь",
  modulesSub: "Каждая сфера — не отдельное приложение, а часть одной системы. Поэтому они усиливают друг друга.",
  modules: [
    { t: "Тело", d: "Тренировки, питание, сон, вода — план под ваш вес и цель." },
    { t: "Знания", d: "Книги и курсы, ежедневная цель чтения и прогресс." },
    { t: "Привычки", d: "Маленькие привычки, серии и процент выполнения за неделю." },
    { t: "Круг", d: "Группы единомышленников и взаимная ответственность." },
    { t: "Дневник", d: "Мысли, настроение и напоминания по времени." },
    { t: "AI-наставник", d: "Смотрит на ваши цифры и называет следующий шаг." },
  ],
  voicesTitle: "Те, кто живёт по системе",
  voicesNote: "Примеры отзывов",
  voices: [
    { name: "Диёр, 24", role: "Программист", text: "Впервые не бросил тренировки больше 30 дней. Не нужно думать, что делать каждый день." },
    { name: "Мадина, 29", role: "Учитель", text: "Было 6 часов в телефоне, сейчас 3. За это время прочитала 4 книги." },
    { name: "Сардор, 33", role: "Предприниматель", text: "Отмечаемся каждый день с друзьями в круге. Бросить уже стыдно." },
  ],
  pricingTitle: "Простые и честные цены",
  pricingSub: "Начните бесплатно. Перейдите на Premium, когда почувствуете, что система работает.",
  free: {
    name: "Бесплатно",
    note: "Всё основное, чтобы начать.",
    cta: "Начать бесплатно",
    items: ["Все 5 модулей", "До 3 активных привычек", "Расчёт калорий и макросов", "5 вопросов AI в день", "Напоминания на сайте"],
  },
  premium: {
    name: "Premium",
    note: "Личная система для полного управления жизнью.",
    cta: "Выбрать Premium",
    period: "сум / мес",
    items: ["Безлимитные привычки и цели", "Безлимитный AI + недельный анализ", "Распорядок дня, питание и тренировки от AI", "Глубокая аналитика и отчёты", "Напоминания в Telegram и email"],
    soon: "скоро",
  },
  best: "Выгоднее всего",
  guarantee: "Отмена в любой момент · Без скрытых платежей",
  faqTitle: "Частые вопросы",
  faq: [
    { q: "Это правда бесплатно?", a: "Да. Бесплатный план бессрочный. Данные карты не нужны." },
    { q: "Сколько времени в день?", a: "1–2 минуты на отметки. Остальное — выполнить те самые 3 шага." },
    { q: "Мои данные в безопасности?", a: "Каждый пользователь видит только свои данные. Мы их не продаём и никому не передаём." },
    { q: "AI заменяет врача?", a: "Нет. Это помощник по привычкам и планам. По вопросам здоровья обращайтесь к специалисту." },
    { q: "Работает на телефоне?", a: "Да, сайт адаптирован под телефон. Его можно добавить на главный экран как приложение." },
  ],
  finalTitle: "Ваше завтра строится сегодня",
  finalSub: "2 минуты — и первые 3 шага готовы.",
  footer: "Мотивация заканчивается. Система остаётся.",
};

const en: LandingDict = {
  nav: { how: "How it works", modules: "Modules", pricing: "Pricing", faq: "FAQ", login: "Sign in" },
  badge: "3 steps a day. Forward every day.",
  h1a: "Motivation fades.",
  h1b: "Systems stay.",
  sub: "Life Order doesn't give you more information — it helps you run your life. Every morning, 3 clear steps built just for you.",
  cta: "Start free",
  ctaNote: "2 minutes · No card needed",
  secondary: "How does it work?",
  proof: "Built for Uzbekistan · Your data stays yours",
  todayTitle: "Today's 3 steps",
  todayItems: ["20-minute workout", "15 pages of reading", "Sleep at 23:00"],
  streak: "12-day streak",
  problemTitle: "Sound familiar?",
  problems: [
    { t: "I'll start on Monday", d: "A new plan every week — and every week starting over." },
    { t: "Many apps, no results", d: "Five separate apps for workouts, books and habits. None talk to each other." },
    { t: "The day disappears into the phone", d: "At night you wonder: what did I actually do today?" },
  ],
  howTitle: "A system in three steps",
  how: [
    { t: "2-minute intro", d: "A few questions about your goals and obstacles." },
    { t: "3 steps every day", d: "The system picks the 3 most important things. One tap to check them off." },
    { t: "Weekly review", d: "The AI coach shows what's working and what to change." },
  ],
  modulesTitle: "One system — your whole life",
  modulesSub: "Each area isn't a separate app but part of one system, so they reinforce each other.",
  modules: [
    { t: "Body", d: "Workouts, food, sleep, water — a plan tuned to your weight and goal." },
    { t: "Knowledge", d: "Books and courses, a daily reading goal and progress." },
    { t: "Habits", d: "Small habits, streaks and weekly completion rate." },
    { t: "Circle", d: "Groups of like-minded people and mutual accountability." },
    { t: "Journal", d: "Thoughts, mood and timed reminders." },
    { t: "AI coach", d: "Reads your numbers and names your next step." },
  ],
  voicesTitle: "People living by the system",
  voicesNote: "Sample reviews",
  voices: [
    { name: "Diyor, 24", role: "Developer", text: "For the first time I didn't quit training after 30 days. I don't have to decide what to do each day." },
    { name: "Madina, 29", role: "Teacher", text: "I used to spend 6 hours a day on my phone, now 3. I read 4 books with that time." },
    { name: "Sardor, 33", role: "Founder", text: "We check in daily with friends in our circle. Quitting would be embarrassing." },
  ],
  pricingTitle: "Simple, honest pricing",
  pricingSub: "Start free. Move to Premium once you feel the system working.",
  free: {
    name: "Free",
    note: "Everything essential to get started.",
    cta: "Start free",
    items: ["All 5 modules", "Up to 3 active habits", "Calorie and macro targets", "5 AI questions a day", "In-app reminders"],
  },
  premium: {
    name: "Premium",
    note: "A personal system to fully run your life.",
    cta: "Choose Premium",
    period: "UZS / month",
    items: ["Unlimited habits and goals", "Unlimited AI coach + weekly review", "AI-built schedule, meal and workout plan", "Deep analytics and reports", "Telegram and email reminders"],
    soon: "soon",
  },
  best: "Best value",
  guarantee: "Cancel anytime · No hidden fees",
  faqTitle: "Frequently asked questions",
  faq: [
    { q: "Is it really free?", a: "Yes. The free plan has no time limit and no card is required." },
    { q: "How much time per day?", a: "1–2 minutes to check in. The rest is doing those 3 steps." },
    { q: "Is my data safe?", a: "Each user sees only their own data. We never sell or share it." },
    { q: "Does the AI replace a doctor?", a: "No. It helps with habits and plans. For health issues, see a professional." },
    { q: "Does it work on my phone?", a: "Yes, it's built for phones and can be added to your home screen like an app." },
  ],
  finalTitle: "Tomorrow is built today",
  finalSub: "2 minutes — and your first 3 steps are ready.",
  footer: "Motivation fades. Systems stay.",
};

export const LANDING: Record<Lang, LandingDict> = { uz, uzc, ru, en };
