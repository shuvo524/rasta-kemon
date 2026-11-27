"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang, t, categoryLabel } from "@/lib/i18n";
import {
  CATEGORY_KEYS,
  demoReports,
  type Category,
  type Report,
} from "@/data/demo-reports";
import { submitReport, uploadPhoto } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-2xl bg-navy-900/5 text-sm text-slate2">
      Loading…
    </div>
  ),
});

export default function NewReportPage() {
  const { lang } = useLang();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("damage");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [district, setDistrict] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicate, setDuplicate] = useState<Report | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Pre-fill a sensible default pin (Dhaka) once the map is visible.
    // The user must still tap the map to confirm the exact spot.
    if (lat === null && lng === null) {
      setLat(23.8103);
      setLng(90.4125);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPhotoChange = (file: File | undefined) => {
    if (!file) return;
    setPhotoFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } catch {
      setPhotoPreview(null);
    }
  };

  const doSubmit = async (force: boolean) => {
    const errs: string[] = [];
    if (title.trim().length < 4) errs.push(t(lang, "report.errTitle"));
    if (area.trim().length < 2) errs.push(t(lang, "report.errArea"));
    if (lat === null || lng === null) errs.push(t(lang, "report.errLocation"));
    setErrors(errs);
    if (errs.length > 0) return;

    setSubmitting(true);
    setUploadNote("");
    try {
      // Upload the photo first when one is attached. If Cloudinary is not
      // configured yet (503), submit without the photo instead of failing.
      let photoUrl: string | null = null;
      if (photoFile) {
        try {
          photoUrl = await uploadPhoto(photoFile);
        } catch (err) {
          if ((err as Error & { status?: number }).status === 503) {
            setUploadNote(
              lang === "bn"
                ? "ছবি আপলোডের ব্যবস্থা এখনো চালু হয়নি — রিপোর্টটি ছবি ছাড়া জমা হচ্ছে।"
                : "Photo upload is not set up yet — submitting the report without a photo."
            );
          } else {
            throw err;
          }
        }
      }
      const res = await submitReport({
        title: title.trim(),
        category,
        description: description.trim(),
        area: area.trim(),
        district: district.trim() || "ঢাকা",
        lat: lat as number,
        lng: lng as number,
        severity: 2,
        photoUrl,
        force,
      });
      setSubmittedId(String(res.report.id));
    } catch (err) {
      const e = err as Error & { status?: number; duplicateOf?: string };
      if (e.status === 409 && e.duplicateOf && !force) {
        const dup =
          demoReports.find((r) => String(r.id) === e.duplicateOf) ?? null;
        setDuplicate(
          dup ?? {
            id: e.duplicateOf,
            title: "",
            category,
            description: "",
            area,
            district: "",
            lat: lat as number,
            lng: lng as number,
            status: "pending",
            confirmCount: 0,
            severity: 2,
            createdAt: "",
            isDemo: false,
          }
        );
      } else if (e.status === 401) {
        router.push("/login?next=/report/new");
      } else {
        setErrors([
          lang === "bn"
            ? "জমা দেওয়া যায়নি — আবার চেষ্টা করুন।"
            : "Could not submit — please try again.",
        ]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionPending && !session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-navy-900/5">
          <h1 className="text-2xl font-extrabold text-ink">
            {t(lang, "report.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate2">
            {lang === "bn"
              ? "রিপোর্ট দিতে প্রথমে লগইন করুন — এতে আপনার রিপোর্ট আপনার অ্যাকাউন্টের সাথে যুক্ত থাকবে।"
              : "Please sign in to submit a report — it will be linked to your account."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/login?next=/report/new"
              className="rounded-full bg-forest-900 px-6 py-3 text-sm font-bold text-white"
            >
              {lang === "bn" ? "লগইন করুন" : "Sign in"} →
            </Link>
            <Link
              href="/register?next=/report/new"
              className="rounded-full bg-cream px-6 py-3 text-sm font-bold text-ink ring-1 ring-navy-900/10"
            >
              {lang === "bn" ? "অ্যাকাউন্ট খুলুন" : "Create an account"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submittedId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-navy-900/5">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
            ✓
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink">
            {t(lang, "report.success")}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate2">
            {t(lang, "report.successText")}
          </p>
          {uploadNote ? (
            <p className="mx-auto mt-2 max-w-md rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
              {uploadNote}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/reports/${submittedId}`}
              className="rounded-full bg-forest-900 px-5 py-3 text-sm font-bold text-white"
            >
              {t(lang, "report.viewReport")} →
            </Link>
            <Link
              href="/report/new"
              onClick={() => window.location.reload()}
              className="rounded-full bg-cream px-5 py-3 text-sm font-bold text-ink ring-1 ring-navy-900/10"
            >
              {t(lang, "report.newOne")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {t(lang, "report.title")}
      </h1>
      <p className="mt-1.5 text-slate2">{t(lang, "report.subtitle")}</p>

      <form
        className="mt-7 space-y-6 rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-900/5 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          setDuplicate(null);
          void doSubmit(false);
        }}
      >
        {errors.length > 0 ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            <ul className="list-disc space-y-1 pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {duplicate ? (
          <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="text-sm font-bold text-amber-800">
              {t(lang, "report.duplicate")}
            </p>
            <Link
              href={`/reports/${duplicate.id}`}
              className="mt-1 block text-sm font-semibold text-amber-800 underline"
            >
              {duplicate.title || duplicate.id} — {duplicate.area}
            </Link>
            <button
              type="button"
              onClick={() => void doSubmit(true)}
              className="mt-3 rounded-full bg-amber-600 px-4 py-2 text-[13px] font-bold text-white"
            >
              {lang === "bn" ? "তবুও জমা দিন" : "Submit anyway"}
            </button>
          </div>
        ) : null}

        <div>
          <label htmlFor="rk-title" className="mb-1.5 block text-sm font-bold text-ink">
            {t(lang, "report.fieldTitle")} *
          </label>
          <input
            id="rk-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(lang, "report.fieldTitlePh")}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="rk-category" className="mb-1.5 block text-sm font-bold text-ink">
              {t(lang, "report.fieldCategory")} *
            </label>
            <select
              id="rk-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-[15px] outline-none focus:border-forest-700"
            >
              {CATEGORY_KEYS.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(lang, c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rk-district" className="mb-1.5 block text-sm font-bold text-ink">
              {t(lang, "report.fieldDistrict")}
            </label>
            <input
              id="rk-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t(lang, "report.fieldDistrictPh")}
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="rk-area" className="mb-1.5 block text-sm font-bold text-ink">
            {t(lang, "report.fieldArea")} *
          </label>
          <input
            id="rk-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={t(lang, "report.fieldAreaPh")}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </div>

        <div>
          <label htmlFor="rk-desc" className="mb-1.5 block text-sm font-bold text-ink">
            {t(lang, "report.fieldDesc")}
          </label>
          <textarea
            id="rk-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(lang, "report.fieldDescPh")}
            rows={4}
            className="w-full resize-y rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-bold text-ink">
            {t(lang, "report.fieldLocation")} *
          </span>
          <p className="mb-2 text-[13px] text-slate2">
            {t(lang, "report.fieldLocationHint")}
          </p>
          <MapView
            reports={demoReports}
            center={[23.8103, 90.4125]}
            zoom={12}
            height="320px"
            onPick={(la, ln) => {
              setLat(Number(la.toFixed(5)));
              setLng(Number(ln.toFixed(5)));
              setDuplicate(null);
            }}
            pickMarker={lat !== null && lng !== null ? { lat, lng } : null}
          />
          <p className="mt-2 text-[13px] font-semibold text-forest-800">
            {lat !== null && lng !== null
              ? `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`
              : "—"}
          </p>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-bold text-ink">
            {t(lang, "report.fieldPhoto")}
          </span>
          <p className="mb-2 text-[13px] text-slate2">{t(lang, "report.fieldPhotoHint")}</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onPhotoChange(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-navy-900/20 bg-cream px-4 py-6 text-sm font-bold text-slate2 transition hover:border-forest-700 hover:text-forest-800"
          >
            📷 {lang === "bn" ? "ছবি বেছে নিন / ক্যামেরা দিয়ে তুলুন" : "Choose a photo / take with camera"}
          </button>
          {photoPreview ? (
            <div className="relative mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Evidence preview"
                className="max-h-64 w-full rounded-2xl object-cover ring-1 ring-navy-900/10"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-navy-950/80 px-3 py-1.5 text-xs font-bold text-white"
              >
                ✕ {lang === "bn" ? "সরান" : "Remove"}
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting || sessionPending}
          className="w-full rounded-full bg-forest-900 py-4 text-base font-bold text-white shadow-card transition hover:bg-forest-800 disabled:opacity-60"
        >
          {submitting ? t(lang, "report.submitting") : t(lang, "report.submit")}
        </button>
      </form>
    </div>
  );
}
