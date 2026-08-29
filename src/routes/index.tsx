import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { fetchNui, isInGame, useNuiEvent, type PlayerData } from "@/lib/nui";
import {
  IdCard,
  Car,
  ShieldCheck,
  Home,
  FileBadge,
  KeyRound,
  Paintbrush,
  Repeat,
  Crosshair,
  Fish,
  Plane,
  BadgeCheck,
  Clock,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import heroImage from "@/assets/cityhall-hero.jpg";
import sealImage from "@/assets/nexus-seal.png";
import catOkmanyok from "@/assets/cat-okmanyok.jpg";
import catAuto from "@/assets/cat-auto.jpg";
import catEngedelyek from "@/assets/cat-engedelyek.jpg";
import svc_szemelyi from "@/assets/svc-szemelyi.jpg";
import svc_lakcim from "@/assets/svc-lakcim.jpg";
import svc_anyakonyv from "@/assets/svc-anyakonyv.jpg";
import svc_nevvaltas from "@/assets/svc-nevvaltas.jpg";
import svc_jogositvany from "@/assets/svc-jogositvany.jpg";
import svc_atiras from "@/assets/svc-atiras.jpg";
import svc_forgalmi from "@/assets/svc-forgalmi.jpg";
import svc_rendszam from "@/assets/svc-rendszam.jpg";
import svc_fegyver from "@/assets/svc-fegyver.jpg";
import svc_vadasz from "@/assets/svc-vadasz.jpg";
import svc_pilota from "@/assets/svc-pilota.jpg";
import svc_halasz from "@/assets/svc-halasz.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Városháza — Nexus Horizon RP ügyintézés" },
      {
        name: "description",
        content:
          "Személyes okmányok, autó ügyintézés és engedélyek egy helyen a Nexus Horizon RP városházán.",
      },
      { property: "og:title", content: "Városháza — Nexus Horizon RP" },
      {
        property: "og:description",
        content:
          "Személyi, lakcím, forgalmi, átírás és fegyvertartási engedély igénylése egy modern felületen.",
      },
    ],
  }),
  component: CityHall,
});

type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  time: string;
  icon: typeof IdCard;
  image: string;
  requirements: string[];
};

type Category = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof IdCard;
  image: string;
  services: Service[];
};

const categories: Category[] = [
  {
    id: "okmanyok",
    title: "Személyes okmányok",
    subtitle: "Személyi, lakcím, anyakönyv",
    description: "Személyazonosítás és lakcímügyek egy helyen.",
    icon: IdCard,
    image: catOkmanyok,
    services: [
      {
        id: "szemelyi",
        image: svc_szemelyi,
        title: "Személyi igazolvány",
        description: "Új személyazonosító okmány kiállítása vagy pótlása fotóval.",
        price: 3000,
        time: "~2 perc",
        icon: IdCard,
        requirements: ["Betöltött 18. életév", "Nincs aktív körözés"],
      },
      {
        id: "lakcim",
        image: svc_lakcim,
        title: "Lakcímkártya",
        description: "Új lakcím bejegyzése vagy a meglévő cím módosítása.",
        price: 1500,
        time: "~1 perc",
        icon: Home,
        requirements: ["Érvényes személyi", "Bérleti vagy tulajdoni igazolás"],
      },
      {
        id: "anyakonyv",
        image: svc_anyakonyv,
        title: "Anyakönyvi kivonat",
        description: "Születési vagy házassági kivonat hivatalos kiállítása.",
        price: 800,
        time: "~1 perc",
        icon: FileBadge,
        requirements: ["Érvényes személyi"],
      },
      {
        id: "nevvaltas",
        image: svc_nevvaltas,
        title: "Névváltoztatás",
        description: "Hivatalos névmódosítás átvezetése a nyilvántartásban.",
        price: 5000,
        time: "~3 perc",
        icon: BadgeCheck,
        requirements: ["Érvényes személyi", "Ügyintézői jóváhagyás"],
      },
    ],
  },
  {
    id: "auto",
    title: "Autó ügyintézés",
    subtitle: "Forgalmi, átírás, rendszám",
    description: "Járműnyilvántartás, jogosítvány és rendszám ügyek.",
    icon: Car,
    image: catAuto,
    services: [
      {
        id: "jogositvany",
        image: svc_jogositvany,
        title: "Vezetői engedély",
        description: "Jogosítvány kiállítása a sikeres vizsga után, kategóriánként.",
        price: 4500,
        time: "~3 perc",
        icon: KeyRound,
        requirements: ["Sikeres KRESZ vizsga", "Érvényes személyi"],
      },
      {
        id: "atiras",
        image: svc_atiras,
        title: "Jármű átírás",
        description: "Tulajdonosváltás átvezetése a központi járműnyilvántartásban.",
        price: 2500,
        time: "~2 perc",
        icon: Repeat,
        requirements: ["Mindkét fél jelenléte", "Forgalmi engedély"],
      },
      {
        id: "forgalmi",
        image: svc_forgalmi,
        title: "Forgalmi engedély pótlás",
        description: "Elveszett vagy sérült forgalmi engedély újrakiállítása.",
        price: 1200,
        time: "~1 perc",
        icon: FileBadge,
        requirements: ["Jármű tulajdonjog"],
      },
      {
        id: "rendszam",
        image: svc_rendszam,
        title: "Egyedi rendszám",
        description: "Saját rendszámtábla igénylése, ellenőrzés után aktiválva.",
        price: 15000,
        time: "~4 perc",
        icon: Paintbrush,
        requirements: ["Szabad rendszámkód", "Nincs tartozás"],
      },
    ],
  },
  {
    id: "engedelyek",
    title: "Engedélyek",
    subtitle: "Fegyver, vadász, pilóta",
    description: "Hatósági engedélyek igénylése és megújítása.",
    icon: ShieldCheck,
    image: catEngedelyek,
    services: [
      {
        id: "fegyver",
        image: svc_fegyver,
        title: "Fegyvertartási engedély",
        description: "Rendőrségi ellenőrzés utáni engedély rövid csövű fegyverre.",
        price: 25000,
        time: "~5 perc",
        icon: Crosshair,
        requirements: ["Tiszta priusz", "Betöltött 21. életév", "Lőtéri vizsga"],
      },
      {
        id: "vadasz",
        image: svc_vadasz,
        title: "Vadászengedély",
        description: "Vadászati jogosultság a kijelölt megyei területekre.",
        price: 12000,
        time: "~3 perc",
        icon: ShieldCheck,
        requirements: ["Fegyvertartási engedély"],
      },
      {
        id: "pilota",
        image: svc_pilota,
        title: "Pilóta engedély",
        description: "Légijármű vezetési jogosultság magánrepülőgépre és helikopterre.",
        price: 40000,
        time: "~5 perc",
        icon: Plane,
        requirements: ["Orvosi alkalmasság", "Repülési vizsga"],
      },
      {
        id: "halasz",
        image: svc_halasz,
        title: "Horgászengedély",
        description: "Éves horgászati engedély a városi tavakra és partszakaszokra.",
        price: 3500,
        time: "~1 perc",
        icon: Fish,
        requirements: ["Érvényes személyi"],
      },
    ],
  },
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("hu-HU").format(value) + " $";

const MOCK_PLAYER: PlayerData = {
  name: "Kovács Márk",
  citizenId: "4821",
  bank: 248900,
  cash: 12400,
  framework: "standalone",
  inventory: "none",
};

function CityHall() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(!isInGame());
  const [player, setPlayer] = useState<PlayerData>(MOCK_PLAYER);

  const category = categories.find((c) => c.id === activeCategory) ?? null;

  const close = useCallback(() => {
    setVisible(false);
    setActiveCategory(null);
    setSelected(null);
    void fetchNui("closeUi", {}, null);
  }, []);

  useNuiEvent<{ player: PlayerData }>("open", (data) => {
    if (data?.player) setPlayer(data.player);
    setVisible(true);
  });
  useNuiEvent<PlayerData>("updatePlayer", (data) => {
    if (data) setPlayer(data);
  });
  useNuiEvent("close", () => setVisible(false));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const submit = async (service: Service) => {
    if (pending) return;
    setPending(true);
    setError(null);

    const result = await fetchNui<{ success: boolean; message?: string; player?: PlayerData }>(
      "requestService",
      { serviceId: service.id, categoryId: activeCategory, price: service.price },
      { success: true, player: { ...player, bank: player.bank - service.price } },
    );

    setPending(false);

    if (result?.player) setPlayer(result.player);

    if (result?.success) {
      setConfirmed(service.title);
      setSelected(null);
      setTimeout(() => setConfirmed(null), 3500);
    } else {
      setError(result?.message ?? "A kérelem elutasítva.");
      setTimeout(() => setError(null), 3500);
    }
  };

  if (!visible) return null;

  return (
    <main className="grid-lines min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="panel-glass overflow-hidden rounded-3xl border border-border">
          {/* Fejléc */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-7">
            <div className="flex items-center gap-3">
              <img
                src={sealImage}
                alt="Nexus Horizon városi címer"
                width={512}
                height={512}
                className="size-11 rounded-xl bg-secondary/60 p-1"
              />
              <div>
                <p className="font-display text-base leading-none font-semibold">
                  Nexus Horizon RP
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  Városháza · Ügyfélszolgálat
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2">
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  Állampolgár
                </p>
                <p className="text-sm font-semibold">Kovács Márk · #4821</p>
              </div>
              <div className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2">
                <p className="font-mono text-[10px] tracking-[0.18em] text-primary uppercase">
                  Bankszámla
                </p>
                <p className="font-mono text-sm">248 900 $</p>
              </div>
              <button className="rounded-xl border border-border px-3 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
                Bezárás · ESC
              </button>
            </div>
          </header>

          {/* Hero */}
          <section className="relative">
            <img
              src={heroImage}
              alt="A Nexus Horizon városháza épülete éjszaka"
              width={1600}
              height={900}
              className="h-44 w-full object-cover object-center md:h-64"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-7 md:pb-7">
              <h1 className="max-w-xl text-3xl leading-tight font-bold md:text-4xl">
                Városi <span className="text-gold">ügyintézés</span>
              </h1>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Okmányok, járműügyek és hatósági engedélyek — mindet elintézheted a
                pultnál, néhány kattintással.
              </p>
            </div>
          </section>

          {!category ? (
            /* Főmenü — képes kategóriakártyák */
            <section className="grid gap-4 px-5 py-7 md:grid-cols-3 md:px-7">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelected(null);
                    }}
                    className="group overflow-hidden rounded-2xl border border-border bg-secondary/30 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                      <span className="absolute top-3 left-3 grid size-10 place-items-center rounded-xl border border-border bg-card/80 text-primary backdrop-blur-sm">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-display text-lg font-semibold">
                          {cat.title}
                        </h2>
                        <ChevronRight className="size-5 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cat.subtitle}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {cat.description}
                      </p>
                      <p className="mt-3 font-mono text-[11px] text-primary">
                        {cat.services.length} elérhető ügy
                      </p>
                    </div>
                  </button>
                );
              })}
            </section>
          ) : (
            /* Kategória menü — ügyek listája */
            <section className="px-5 py-6 md:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setSelected(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <ChevronLeft className="size-4" /> Vissza a főmenübe
                </button>
                <div className="text-right">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Ügykör
                  </p>
                  <p className="font-display text-lg font-semibold">
                    {category.title}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="grid content-start gap-3 sm:grid-cols-2">
                  {category.services.map((service) => {
                    const Icon = service.icon;
                    const active = selected?.id === service.id;
                    return (
                      <article
                        key={service.id}
                        className={`overflow-hidden rounded-2xl border transition-colors ${
                          active
                            ? "border-primary/70 bg-primary/10"
                            : "border-border bg-secondary/25 hover:border-primary/30"
                        }`}
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={service.image}
                            alt={service.title}
                            loading="lazy"
                            width={768}
                            height={512}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
                          <span className="absolute top-2.5 left-2.5 grid size-9 place-items-center rounded-lg border border-border bg-card/85 text-primary backdrop-blur-sm">
                            <Icon className="size-4.5" />
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-semibold">{service.title}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                        <div className="mx-4 mb-4 flex items-center justify-between border-t border-border pt-3">
                          <div>
                            <p className="font-mono text-sm text-primary">
                              {formatPrice(service.price)}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                              <Clock className="size-3" /> {service.time}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelected(service)}
                            className="rounded-lg bg-gold px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
                          >
                            Igénylés
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Összegző panel */}
                <aside className="rounded-2xl border border-border bg-secondary/25 p-4">
                  {selected ? (
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base font-semibold">{selected.title}</h2>
                        <button
                          onClick={() => setSelected(null)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Bezárás"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {selected.description}
                      </p>

                      <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        Feltételek
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {selected.requirements.map((r) => (
                          <li key={r} className="flex items-center gap-2 text-xs">
                            <Check className="size-3.5 text-success" />
                            {r}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2.5">
                        <span className="text-xs text-muted-foreground">Fizetendő</span>
                        <span className="font-mono text-sm text-primary">
                          {formatPrice(selected.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => submit(selected)}
                        className="mt-3 w-full rounded-xl bg-gold py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
                      >
                        Kérelem benyújtása
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                      <img
                        src={sealImage}
                        alt=""
                        loading="lazy"
                        width={512}
                        height={512}
                        className="size-16 opacity-40"
                      />
                      <p className="mt-3 text-sm font-medium">Nincs kiválasztott ügy</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Válassz egy szolgáltatást a részletek megtekintéséhez.
                      </p>
                    </div>
                  )}
                </aside>
              </div>
            </section>
          )}
        </div>

        <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Nexus Horizon RP · Városi Hivatal
        </p>
      </div>

      {confirmed && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="panel-glass flex items-center gap-3 rounded-xl border border-success/50 px-4 py-3">
            <span className="grid size-6 place-items-center rounded-full bg-success text-primary-foreground">
              <Check className="size-3.5" />
            </span>
            <p className="text-sm">
              Kérelem benyújtva: <span className="font-semibold">{confirmed}</span>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
