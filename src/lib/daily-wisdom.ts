/** Original practical interpretations, not attributed verbatim quotations. */
const LESSONS = [
  { thinker: "Fridrix Nitshe", lesson: "O‘sish faqat qulaylikdan iborat emas; tanlangan qiyinchilik ham sizni shakllantirishi mumkin.", action: "Bugun kechiktirayotgan bitta ishni tanlang va unga 5 daqiqa ajrating." },
  { thinker: "Mark Avreliy", lesson: "Boshqalarning munosabatini emas, o‘z qaroringiz va harakatingizni boshqara olasiz.", action: "Bugungi eng muhim ishingizning o‘zingizga bog‘liq birinchi qadamini yozing." },
  { thinker: "Epiktet", lesson: "Vaziyat va unga bergan bahomiz bir xil narsa emas.", action: "Bir tashvishni yozing: qaysi qismi sizga bog‘liq, qaysi qismi bog‘liq emas?" },
  { thinker: "Seneka", lesson: "Vaqtni qadrlash har bir daqiqani ish bilan to‘ldirish degani emas.", action: "Bugun keraksiz bitta chalg‘ishni kamaytiring va dam olish uchun joy qoldiring." },
  { thinker: "Aristotel", lesson: "Takrorlanadigan kichik harakatlar xarakterimizga ta’sir qiladi.", action: "Mavjud odatingizdan keyin bajariladigan ikki daqiqalik foydali amal tanlang." },
  { thinker: "Fridrix Nitshe", lesson: "O‘z yo‘lingizni topish boshqalarning mezonlarini qayta ko‘rib chiqishni ham talab qiladi.", action: "Bitta maqsadingizni tekshiring: bu siz uchun muhimmi yoki faqat boshqalar kutgan narsami?" },
  { thinker: "Mark Avreliy", lesson: "Kechagi xato bugungi foydali harakatni bekor qilmaydi.", action: "Uzilib qolgan odatingizga eng kichik qadam bilan qayting." },
] as const;

export function dailyWisdom(dateISO: string) {
  const date = new Date(`${dateISO}T00:00:00Z`);
  const day = Number.isNaN(date.getTime()) ? 0 : Math.floor(date.getTime() / 86_400_000);
  return LESSONS[((day % LESSONS.length) + LESSONS.length) % LESSONS.length] ?? LESSONS[0];
}