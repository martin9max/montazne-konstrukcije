# Montažne Konstrukcije – sajt

React + Vite + TypeScript, Tailwind CSS, Framer Motion, GSAP + ScrollTrigger, Lenis, React Router.
Deploy na Vercel; porudžbine idu preko serverless funkcije `api/order.ts`.

## Pokretanje

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # produkcijski build u dist/
```

U lokalnom razvoju `/api/order` radi preko Vite servera (ista logika kao na Vercelu).
Ako Telegram/email nisu podešeni u `.env.local`, porudžbina se samo ispiše u terminalu.
Da biste lokalno testirali poruku o grešci, dodajte `DEV_FAIL_ORDERS=1` u `.env.local`.

## Gde se menjaju podaci

| Fajl | Šta |
|---|---|
| `src/config/business.ts` | ime, telefon, email, adresa, Instagram, domen |
| `src/config/products.ts` | tipovi, preseti dimenzija, min/max, rok izrade |
| `src/config/options.ts` | spajanje, paleta boja, dodaci, namene, limiti za upload |
| `src/config/pricing.ts` | cene i `showPrice` (podrazumevano `false`) |
| `src/config/projects.ts` | galerija realizovanih projekata |
| `src/config/faq.ts` | česta pitanja |

Sve što još treba potvrditi sa klijentom je u kodu označeno sa `[POTVRDITI]`:

```bash
grep -rn "POTVRDITI" src
```

## Fotografije

1. Originalne slike stavite u `scripts/originals/` sa nazivima iz specifikacije
   (npr. `aframe-6x5x5-galerija-1.jpg`, `kontejnerska-6x6-1.jpg`, `objekat-12x9-terasa-1.jpg`).
2. Pokrenite `python3 scripts/optimize_images.py` (potreban Pillow).
3. Skripta pravi WebP u 480/800/1200/1800 px u `public/images/`, `og-aframe.jpg` i
   ažurira `src/config/image-manifest.json`. Komponenta `<Photo>` tada automatski
   prikazuje sliku umesto placeholdera.

Logo: privremeni SVG je u `src/components/ui/Logo.tsx`; kada stigne originalni, zameniti ga.

## Porudžbine (Vercel)

U Vercel → Settings → Environment Variables podesite (nazivi su u `.env.example`):

- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`: poruka vlasniku (primarni kanal)
- `RESEND_API_KEY`, `ORDER_EMAIL_FROM`, `ORDER_EMAIL_TO`: email vlasniku (rezerva) i potvrda kupcu

Porudžbina je uspešna ako prođe bar jedan kanal. Ako nijedan nije podešen ili oba padnu,
kupac vidi poruku o grešci, a podaci ostaju u formi.

Napomene:
- Vercel funkcija prima najviše ~4,5 MB, zato se slike smanjuju u pregledaču pre slanja;
  ako su fajlovi i dalje preveliki (veliki PDF), kupac dobija jasnu poruku.
- Broj porudžbine je oblika `MK-2026-7K3QF` (nasumičan). Redni broj (`MK-2026-0042`) traži bazu, faza 2.
- Rate limit je u memoriji funkcije (5 zahteva / 10 min po IP), uz honeypot polje.
