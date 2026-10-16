# MITstem Astro + Cloudflare Pages + Supabase — Phase 1

This is a drop-in update to the previously generated MITstem Astro website.
The public contact form writes to the dedicated `website_enquiries` Supabase table.
No staff login is included yet: first use Supabase's protected Table Editor as the admin dashboard.

## A. Supabase dashboard

1. Sign in at https://supabase.com/dashboard and open the *existing* MITstem project.
2. Open **Table Editor** and verify that `public.website_enquiries` does **not** exist (or carefully inspect it if it does).
3. Open **SQL Editor** -> **New query**. Paste `supabase/website_enquiries.sql` and select **Run**.
4. Return to **Table Editor** -> `website_enquiries`. It should be empty.
5. Open **Project Settings** -> **API Keys** (or Connect) and retrieve:
   - project URL: `https://<project-ref>.supabase.co`
   - project secret key: `sb_secret_...` (backend only)
   Never share a secret key in chat, screenshots, GitHub or frontend code.
6. Run a quick security check in the SQL Editor:
   ```sql
   select relrowsecurity from pg_class where oid = 'public.website_enquiries'::regclass;
   select grantee, privilege_type from information_schema.role_table_grants
    where table_schema='public' and table_name='website_enquiries';
   ```
   RLS must be true. `anon`/`authenticated` must not have table privileges.

## B. Cloudflare Turnstile

1. Cloudflare dashboard -> **Turnstile** -> **Add widget**.
2. Set allowed hostnames (for example `<your-project>.pages.dev` and your custom domain).
3. Copy the **site key** (public) and **secret key** (server-side private).
4. Create new production Turnstile keys. **Do not deploy the local dummy test keys.**

## C. Cloudflare Pages settings (NOT the Workers app deploy screen)

Use the existing **Pages** project linked to GitHub. The Astro project should use:

- Framework preset: `Astro`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/` if `package.json` is at your repository root

Cloudflare dashboard -> **Workers & Pages** -> **your Pages project** -> **Settings** -> **Variables and Secrets**:

| Variable | Value | Type |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | plain build-time variable |
| `SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | plain variable |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | encrypted secret |
| `TURNSTILE_SECRET_KEY` | Turnstile secret | encrypted secret |

Set appropriate production/preview values as required. `PUBLIC_TURNSTILE_SITE_KEY`
needs to be available during **build** (Astro embeds it into public HTML).
The other variables are read at **runtime** by `functions/api/enquiries.ts`.
Deploy again after changing settings.

**Important:** The `/functions` directory must be at the repository root (beside
`src` and `package.json`), not inside `src` or `public` or `dist`.

## D. Upload via GitHub website

Upload the project files, including `functions/`, `supabase/`, the updated
`src/pages/contact.astro`, `.env.example`, `SUPABASE-SETUP.md` and `.gitignore`.
Do NOT upload `node_modules/`, `dist/`, `.env`, `.dev.vars` or any real keys.
Cloudflare automatically deploys from GitHub. If the original repo has source
files, replace the corresponding files and add `functions/` and `supabase/`.

## E. Test locally on Windows (optional)

Normal `npm run dev` previews the Astro pages but does **not** run Cloudflare
Pages Functions, so `/api/enquiries` will NOT work on port 4321.

From your Astro project folder in CMD:

1. `npm install`
2. Copy `.env.example` to `.env` and retain the localhost *test* Turnstile sitekey.
3. Copy `.dev.vars.example` to `.dev.vars`. Put your real Supabase URL and secret
   there, but leave the Turnstile *test* secret for localhost.
4. `npm run build`
5. `npx wrangler pages dev dist`
6. Open the local URL Wrangler prints (usually `http://localhost:8788/contact/`).
7. Submit a test enquiry and check Supabase Table Editor.

Cloudflare's dummy Turnstile keys are provided for localhost tests only.
**Never use them in a live deployment.**

## F. Verify the production deployment

1. Open `<your-project>.pages.dev/contact/` or your school's custom domain.
2. Complete the form, check the consent box and Turnstile verification.
3. Submit. You should see a confirmation message.
4. Supabase dashboard -> Table Editor -> `website_enquiries`: verify a new row.
5. To test rejection, try submitting with an invalid email or missing required
   fields, and verify no new record is written.

## G. Security and scope

- Database writes happen only from the Cloudflare Pages Function.
- The elevated `sb_secret_...` API key is never sent to the browser.
- RLS is enabled, with no client read/write policies for the enquiries table.
- The function validates input, verifies Turnstile on Cloudflare servers, and
  makes same-origin submissions. Add Cloudflare rate limiting for `/api/enquiries`
  in production for defense in depth.
- Never place student identity numbers, medical details or confidential
  information in this basic enquiry form.
- Publish an appropriate privacy notice, data retention policy and staff access
  rules (including Malaysia PDPA requirements) before collecting real enquiries.
- An actual admin portal with Supabase Auth, roles, audit logs and record access
  is a **Phase 2** implementation after you confirm the form is working.
- This package is for a **Cloudflare Pages** deployment. If your current
  dashboard shows `Deploy command: npx wrangler deploy`, that is a **Workers**
  project and this Pages Function will need a Workers-compatible route instead.

Official references:
- https://developers.cloudflare.com/pages/functions/get-started/
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/turnstile/get-started/
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys
