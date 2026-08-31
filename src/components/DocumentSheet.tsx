import { useMemo, useState } from "react";
import { ChevronLeft, PenLine, Check } from "lucide-react";

import type { DocForm, FilledDoc } from "@/lib/documents";
import sealImage from "@/assets/nexus-seal.png";

type Props = {
  form: DocForm;
  serviceTitle: string;
  playerName: string;
  existing?: FilledDoc | undefined;
  onBack: () => void;
  onComplete: (doc: FilledDoc) => void;
};

export function DocumentSheet({
  form,
  serviceTitle,
  playerName,
  existing,
  onBack,
  onComplete,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    () => existing?.values ?? { fullName: playerName },
  );
  const [signed, setSigned] = useState(Boolean(existing));
  const [signing, setSigning] = useState(false);
  const [touched, setTouched] = useState(false);

  const missing = useMemo(
    () => form.fields.filter((f) => f.required && !values[f.id]?.trim()).map((f) => f.id),
    [form.fields, values],
  );

  const set = (id: string, v: string) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    if (signed) setSigned(false);
  };

  const sign = () => {
    setTouched(true);
    if (missing.length > 0 || signing) return;
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setSigned(true);
    }, 1700);
  };

  const finish = () => {
    onComplete({
      values,
      signedBy: values['fullName']?.trim() || playerName,
      signedAt: new Date().toLocaleString("hu-HU"),
    });
  };

  const today = new Date().toLocaleDateString("hu-HU");

  return (
    <main className="grid-lines min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card/70 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground active:scale-[0.98]"
          >
            <ChevronLeft className="size-4" /> Vissza az ügyintézéshez
          </button>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Nyomtatvány {form.formNumber}
          </p>
        </div>

        {/* Papírlap */}
        <article className="doc-sheet relative overflow-hidden rounded-2xl border border-border px-6 py-7 md:px-10 md:py-10">
          <header className="flex items-start justify-between gap-4 border-b border-border/80 pb-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                Nexus Horizon · Városi Hivatal
              </p>
              <h1 className="mt-2 font-display text-xl leading-snug font-bold md:text-2xl">
                {form.title}
              </h1>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                {form.intro}
              </p>
            </div>
            <img
              src={sealImage}
              alt=""
              width={512}
              height={512}
              className="size-16 shrink-0 opacity-70 md:size-20"
            />
          </header>

          <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {form.fields.map((field) => {
              const invalid = touched && field.required && !values[field.id]?.trim();
              return (
                <label
                  key={field.id}
                  className={field.full || field.type === "textarea" ? "sm:col-span-2" : ""}
                >
                  <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>

                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={values[field.id] ?? ""}
                      onChange={(e) => set(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`doc-input mt-1 w-full resize-none ${invalid ? "doc-input-invalid" : ""}`}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={values[field.id] ?? ""}
                      onChange={(e) => set(field.id, e.target.value)}
                      className={`doc-input mt-1 w-full ${invalid ? "doc-input-invalid" : ""}`}
                    >
                      <option value="">— válassz —</option>
                      {field.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "date" ? "date" : "text"}
                      value={values[field.id] ?? ""}
                      onChange={(e) => set(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`doc-input mt-1 w-full ${invalid ? "doc-input-invalid" : ""}`}
                    />
                  )}
                </label>
              );
            })}
          </div>

          <p className="mt-7 rounded-xl border border-border/70 bg-secondary/30 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            {form.declaration}
          </p>

          {/* Aláírás */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                Kelt
              </p>
              <p className="mt-1 text-sm">Los Santos, {today}</p>
            </div>

            <div className="min-w-56">
              <div className="relative h-16">
                {(signing || signed) && (
                  <span
                    className={`signature absolute bottom-1 left-1 ${signing ? "signature-writing" : ""}`}
                  >
                    {values['fullName']?.trim() || playerName}
                  </span>
                )}
              </div>
              <div className="border-t border-foreground/50 pt-2">
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  Kérelmező aláírása
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Műveletek */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {signed
              ? "A dokumentum aláírva és kitöltve."
              : missing.length > 0 && touched
                ? "Töltsd ki a csillaggal jelölt mezőket az aláíráshoz."
                : `Ügy: ${serviceTitle}`}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={sign}
              disabled={signing}
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/15 disabled:opacity-60 active:scale-[0.98]"
            >
              <PenLine className="size-4" />
              {signing ? "Aláírás…" : signed ? "Újra aláírom" : "Aláírom kézzel"}
            </button>
            <button
              onClick={finish}
              disabled={!signed}
              className="flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              <Check className="size-4" /> Kitöltés befejezése
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
