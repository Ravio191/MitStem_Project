# MITstem International School — Astro website

A responsive, multi-page school website built with **Astro 5**, with no UI framework or third-party JavaScript dependencies. Its copy, historical details and local imagery are based on the provided **MITstem International School Prospectus 2019–2020**.

## Getting started

Requirements: Node.js 20.3+ or 22+ and npm.

```bash
npm install
npm run dev
```

Then visit **http://localhost:4321/**.

To create a production-ready static website:

```bash
npm run build
npm run preview
```

Upload the generated `dist/` directory to Netlify, Vercel, Cloudflare Pages or another static host. No server runtime is needed.

## Pages

- `/` — Home / school introduction
- `/about/` — School approach, vision, values and heritage
- `/academics/` — Cambridge-aligned curriculum pathway described in the prospectus
- `/stem/` — Robotics, mechatronics, automation, ICT, science and design themes
- `/admissions/` — Admissions information and FAQ
- `/contact/` — Contact information and functional email-drafting form
- `/404/` — Page not found

## Important: admissions enquiry form

The contact form uses `mailto:` to open the visitor's configured email app. **It does not transmit, retain or upload any form data to this website.** If there is no email app configured, the visitor can copy the email address shown on the page. For live form submissions, integrate a trusted backend or hosted form provider and document applicable privacy practices.

## Historical information and content review

The source brochure is from academic year **2019–2020** and includes references to school plans, examination pathways and accreditation documentation from that period. It is **not evidence of present school status, current Cambridge recognition or available admissions**. This demonstration deliberately includes a visible source/date disclaimer. Before launch:

1. Verify the school is presently operational and legally registered, and confirm its current name, approved programmes and premises.
2. Verify Cambridge recognition, IGCSE/AS/A Level examinations and any third-party certification references before publishing them as current facts.
3. Confirm address, telephone, email, official website/domain, year groups, admission timelines and fees.
4. Replace any prospectus-derived stock/composite imagery with consented recent school photography, if possible.
5. Connect a working enquiry backend if server-side submission is required.
6. Update meta tags, add a privacy notice and provide a verified website-domain origin before going live.

## Editing

| Content | File |
|---|---|
| Site pages | `src/pages/` |
| Header / footer | `src/components/` |
| Contact details, curriculum stages, STEM areas | `src/data/content.ts` |
| Styles and responsive breakpoints | `src/styles/global.css` |
| Local brochure-derived images | `public/images/` |
| Original PDF | `public/MITstem-School-Prospectus-2019-2020.pdf` |

## Tech notes

- Astro static output, accessible navigation, proper headings, image alt text, keyboard focus styling and reduced-motion support.
- No cookies, tracking scripts or analytics included.
- Fonts optionally loaded from Google Fonts; system fonts provide a fallback.
- Mobile menu and email form use minimal browser-side scripts.

---

Prepared as a **website concept**, not a statement of verified current school status. Content and imagery reproduced/adapted from the user-supplied prospectus.

## Preview without installing Astro

Open **`preview.html`** after extracting the ZIP to review the homepage design with the local images and `preview.css`. It is a stand-alone homepage preview only: the full multi-page navigation and enquiry form are supplied by the Astro project. This preview was generated without an Astro runtime because network access to the npm registry was unavailable during preparation.
