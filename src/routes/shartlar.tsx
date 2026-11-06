import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Foydalanish shartlari — Life Order";
const DESC = "Life Order xizmatidan foydalanish qoidalari va mas'uliyat chegaralari.";

export const Route = createFileRoute("/shartlar")({
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
  ["Xizmat", "Life Order — kunlik reja, odat, kundalik va AI maslahat vositasi. Natija sizning harakatingizga bog‘liq; biz natijani kafolatlamaymiz."],
  ["Hisob", "Hisobingiz xavfsizligi uchun o‘zingiz javobgarsiz. 13 yoshdan kichiklar foydalana olmaydi; 13–17 yoshdagilar ota-ona roziligi bilan foydalanadi."],
  ["Davra qoidalari", "Haqorat, tahdid, spam, shaxsiy ma’lumotni tarqatish va noqonuniy kontent taqiqlanadi. Qoidabuzar hisoblar cheklanishi mumkin."],
  ["AI va sog‘liq", "AI va kaloriya hisoblari umumiy ma’lumot uchun. Kasallik, homiladorlik yoki ruhiy inqirozda mutaxassisga murojaat qiling."],
  ["Premium", "Premium hali sotuvga chiqmagan. To‘lov ochilganda narx va qaytarish shartlari alohida e’lon qilinadi."],
  ["O‘zgarishlar", "Shartlar o‘zgarsa, shu sahifada yangilanadi."],
];

function Page() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 text-foreground">
      <Link to="/" className="text-sm text-primary">← Bosh sahifa</Link>
      <h1 className="mt-4 text-3xl font-bold">Foydalanish shartlari</h1>
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
