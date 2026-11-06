import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Maxfiylik siyosati — Life Order";
const DESC = "Life Order qanday ma'lumot to'playdi, qanday saqlaydi va siz uni qanday o'chira olasiz.";

export const Route = createFileRoute("/maxfiylik")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const SECTIONS: [string, string][] = [
  ["Qanday ma’lumot yig‘amiz", "Email, ism, onboarding javoblaringiz, yosh, bo‘y, vazn, rejalar, odatlar, kundalik yozuvlari, Davra xabarlari va AI suhbatlari. Telefoningizdagi boshqa ilovalar faoliyatini avtomatik o‘lchamaymiz."],
  ["Nima uchun", "Faqat kunlik rejangizni tuzish, eslatma yuborish va AI maslahatini sizning ma’lumotlaringizga moslash uchun. Ma’lumotlaringizni sotmaymiz va reklama uchun bermaymiz."],
  ["AI", "AI so‘rovlaringiz javob olish uchun AI modeliga yuboriladi. Sog‘liq yoki ruhiy holat bo‘yicha AI tibbiy maslahat o‘rnini bosmaydi."],
  ["Telegram", "Telegramni ulasangiz, faqat chat raqamingiz eslatma yuborish uchun saqlanadi. /stop buyrug‘i bilan istalgan vaqt o‘chirasiz."],
  ["13–17 yoshdagilar", "Voyaga yetmaganlar ota-ona yoki vasiy roziligi bilan foydalanishi kerak. Ular uchun kattalar ovqatlanish formulalari qo‘llanmaydi."],
  ["Kim ko‘radi", "Shaxsiy ma’lumotlaringizni faqat siz ko‘rasiz. Davra xabarlarini faqat o‘sha Davra a’zolari ko‘radi."],
  ["O‘chirish", "Profil sahifasidagi “Hisobni o‘chirish” tugmasi barcha ma’lumotlaringizni qaytarib bo‘lmaydigan tarzda o‘chiradi."],
];

function Page() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 text-foreground">
      <Link to="/" className="text-sm text-primary">← Bosh sahifa</Link>
      <h1 className="mt-4 text-3xl font-bold">Maxfiylik siyosati</h1>
      <p className="mt-2 text-sm text-muted-foreground">Oxirgi yangilanish: 2026-yil noyabr</p>
      {SECTIONS.map(([h, p]) => (
        <section key={h} className="mt-6">
          <h2 className="text-lg font-semibold">{h}</h2>
          <p className="mt-1 leading-relaxed text-muted-foreground">{p}</p>
        </section>
      ))}
    </main>
  );
}
