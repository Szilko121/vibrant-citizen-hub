/** Kitöltendő hivatalos dokumentumok meződefiníciói szolgáltatásonként. */

export type DocField = {
  id: string;
  label: string;
  type?: "text" | "date" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  full?: boolean;
};

export type DocForm = {
  formNumber: string;
  title: string;
  intro: string;
  fields: DocField[];
  declaration: string;
};

export type FilledDoc = {
  values: Record<string, string>;
  signedBy: string;
  signedAt: string;
};

const base = (extra: DocField[]): DocField[] => [
  { id: "fullName", label: "Teljes név", required: true },
  { id: "birthDate", label: "Születési dátum", type: "date", required: true },
  { id: "phone", label: "Telefonszám", placeholder: "555-0100" },
  ...extra,
];

export const documentForms: Record<string, DocForm> = {
  szemelyi: {
    formNumber: "NH-01/A",
    title: "Kérelem személyazonosító igazolvány kiállítására",
    intro:
      "Alulírott kérelmező kérem személyazonosító igazolványom kiállítását az alábbi adatok alapján.",
    fields: base([
      { id: "birthPlace", label: "Születési hely", required: true },
      { id: "motherName", label: "Anyja neve", required: true },
      { id: "eyeColor", label: "Szemszín", type: "select", options: ["Barna", "Kék", "Zöld", "Szürke"] },
      { id: "height", label: "Magasság (cm)", placeholder: "180" },
      { id: "address", label: "Lakcím", required: true, full: true },
    ]),
    declaration:
      "Kijelentem, hogy a megadott adatok a valóságnak megfelelnek, és tudomásul veszem, hogy valótlan adatközlés hatósági eljárást von maga után.",
  },
  lakcim: {
    formNumber: "NH-02/B",
    title: "Lakcímbejelentő és lakcímkártya kérelem",
    intro: "Bejelentem lakóhelyem létesítését, illetve megváltoztatását.",
    fields: base([
      { id: "oldAddress", label: "Korábbi lakcím", full: true },
      { id: "newAddress", label: "Új lakcím", required: true, full: true },
      { id: "moveDate", label: "Beköltözés napja", type: "date", required: true },
      { id: "ownerName", label: "Tulajdonos / bérbeadó neve" },
      {
        id: "titleType",
        label: "Jogcím",
        type: "select",
        options: ["Tulajdonos", "Bérlő", "Családtag", "Szíveségi használó"],
      },
    ]),
    declaration:
      "Kijelentem, hogy a bejelentett címen valóban lakom, és a szálláshasználat jogcíme fennáll.",
  },
  anyakonyv: {
    formNumber: "NH-03/C",
    title: "Kérelem anyakönyvi kivonat kiállítására",
    intro: "Kérem az alábbiakban megjelölt anyakönyvi kivonat hivatalos kiállítását.",
    fields: base([
      {
        id: "docType",
        label: "Kivonat típusa",
        type: "select",
        options: ["Születési", "Házassági", "Halotti"],
        required: true,
      },
      { id: "eventDate", label: "Esemény dátuma", type: "date" },
      { id: "eventPlace", label: "Esemény helye" },
      { id: "purpose", label: "Felhasználás célja", type: "textarea", full: true },
    ]),
    declaration: "Kijelentem, hogy a kivonat kiállításához fűződő jogos érdekem fennáll.",
  },
  nevvaltas: {
    formNumber: "NH-04/D",
    title: "Kérelem hivatalos névváltoztatásra",
    intro: "Kérem születési / házassági nevem hivatalos megváltoztatását.",
    fields: base([
      { id: "currentName", label: "Jelenlegi név", required: true },
      { id: "requestedName", label: "Kért új név", required: true },
      { id: "reason", label: "Kérelem indoka", type: "textarea", required: true, full: true },
    ]),
    declaration:
      "Kijelentem, hogy névváltoztatási kérelmem nem irányul hatóság megtévesztésére vagy tartozás elrejtésére.",
  },
  jogositvany: {
    formNumber: "NH-10/A",
    title: "Kérelem vezetői engedély kiállítására",
    intro: "Kérem vezetői engedélyem kiállítását a sikeres vizsga alapján.",
    fields: base([
      {
        id: "category",
        label: "Kategória",
        type: "select",
        options: ["B (személyautó)", "A (motor)", "C (teherautó)", "D (busz)"],
        required: true,
      },
      { id: "examDate", label: "Vizsga dátuma", type: "date", required: true },
      { id: "instructor", label: "Oktató neve" },
      { id: "glasses", label: "Látáskorlátozás", type: "select", options: ["Nincs", "Szemüveg", "Kontaktlencse"] },
      { id: "address", label: "Lakcím", required: true, full: true },
    ]),
    declaration:
      "Kijelentem, hogy vezetésre alkalmas állapotban vagyok, és eltiltás alatt nem állok.",
  },
  atiras: {
    formNumber: "NH-11/B",
    title: "Járműtulajdon átírási kérelem",
    intro: "Bejelentem a jármű tulajdonjogának átszállását.",
    fields: base([
      { id: "plate", label: "Rendszám", required: true },
      { id: "model", label: "Gyártmány / típus", required: true },
      { id: "sellerName", label: "Eladó neve", required: true },
      { id: "price", label: "Vételár ($)", placeholder: "45000" },
      { id: "dealDate", label: "Szerződés dátuma", type: "date", required: true },
    ]),
    declaration: "Kijelentem, hogy a jármű per-, teher- és igénymentes.",
  },
  forgalmi: {
    formNumber: "NH-12/C",
    title: "Forgalmi engedély pótlási kérelem",
    intro: "Kérem forgalmi engedélyem pótlását az alábbi jármű vonatkozásában.",
    fields: base([
      { id: "plate", label: "Rendszám", required: true },
      { id: "model", label: "Gyártmány / típus", required: true },
      {
        id: "lossReason",
        label: "Pótlás oka",
        type: "select",
        options: ["Elvesztés", "Megsemmisülés", "Eltulajdonítás", "Adatmódosítás"],
        required: true,
      },
      { id: "details", label: "Rövid leírás", type: "textarea", full: true },
    ]),
    declaration: "Kijelentem, hogy az eredeti okmány nincs a birtokomban.",
  },
  rendszam: {
    formNumber: "NH-13/D",
    title: "Egyedi rendszám igénylése",
    intro: "Kérem az alábbi egyedi rendszámkombináció kiadását.",
    fields: base([
      { id: "wanted", label: "Kért kombináció", placeholder: "NEXUS01", required: true },
      { id: "alt", label: "Alternatív kombináció", placeholder: "HORIZ02" },
      { id: "plate", label: "Jármű jelenlegi rendszáma", required: true },
      { id: "meaning", label: "A kombináció jelentése", type: "textarea", full: true },
    ]),
    declaration:
      "Kijelentem, hogy a kért kombináció nem sértő, nem megtévesztő, és nem utal hatósági szervre.",
  },
  fegyver: {
    formNumber: "NH-20/A",
    title: "Fegyvertartási engedély kérelem",
    intro: "Kérem fegyvertartási engedélyem kiállítását az alábbiak szerint.",
    fields: base([
      {
        id: "purposeType",
        label: "Tartási cél",
        type: "select",
        options: ["Önvédelem", "Sportlövészet", "Vadászat", "Gyűjtés"],
        required: true,
      },
      { id: "weaponType", label: "Fegyver típusa", required: true },
      { id: "storage", label: "Tárolás helye és módja", required: true, full: true },
      { id: "medical", label: "Orvosi vizsgálat dátuma", type: "date", required: true },
      { id: "priorRecord", label: "Büntetett előélet", type: "select", options: ["Nincs", "Van"] },
    ]),
    declaration:
      "Kijelentem, hogy büntetlen előéletű vagyok, és a fegyver biztonságos tárolásáról gondoskodom.",
  },
  vadasz: {
    formNumber: "NH-21/B",
    title: "Vadászengedély kérelem",
    intro: "Kérem éves vadászengedélyem kiállítását.",
    fields: base([
      { id: "area", label: "Vadászterület", type: "select", options: ["Paleto Forest", "Mount Chiliad", "Grand Senora", "Zancudo"], required: true },
      { id: "gameType", label: "Vadfaj", placeholder: "szarvas, nyúl" },
      { id: "examDate", label: "Vadászvizsga dátuma", type: "date" },
      { id: "weaponType", label: "Használt fegyver" },
    ]),
    declaration: "Kijelentem, hogy a vadászati idényt és a fajvédelmi szabályokat betartom.",
  },
  pilota: {
    formNumber: "NH-22/C",
    title: "Pilóta engedély kérelem",
    intro: "Kérem légijármű-vezetői engedélyem kiállítását.",
    fields: base([
      {
        id: "licenseClass",
        label: "Engedély típusa",
        type: "select",
        options: ["PPL (magán)", "CPL (kereskedelmi)", "Helikopter", "Sportrepülő"],
        required: true,
      },
      { id: "hours", label: "Repült órák", placeholder: "45" },
      { id: "medical", label: "Repülőorvosi vizsgálat", type: "date", required: true },
      { id: "homeAirport", label: "Bázisrepülőtér", type: "select", options: ["LSIA", "Sandy Shores", "Grapeseed", "Fort Zancudo"] },
    ]),
    declaration:
      "Kijelentem, hogy egészségi állapotom a repülésre alkalmas, és a légtérszabályokat betartom.",
  },
  halasz: {
    formNumber: "NH-23/D",
    title: "Horgászengedély kérelem",
    intro: "Kérem éves horgászengedélyem kiállítását.",
    fields: base([
      { id: "waterArea", label: "Vízterület", type: "select", options: ["Alamo Sea", "Cassidy Creek", "Del Perro Pier", "Raton Canyon"], required: true },
      { id: "gear", label: "Használt szerelék", placeholder: "pergető készlet" },
      { id: "boat", label: "Csónak rendszáma" },
    ]),
    declaration: "Kijelentem, hogy a méret- és fogási korlátozásokat betartom.",
  },
};
