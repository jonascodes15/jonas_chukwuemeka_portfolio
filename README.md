# Jonas Chukwuemeka: portfolio

Personal site for Jonas Chukwuemeka (Jay), founder of Weblanda, full-stack developer and biologist growing into data engineering. It's written for three audiences: clients, recruiters and academic admissions.

Live at **https://jonaschukwuemeka.com** (deployed on Vercel).

## Stack

| Area                          | Tools                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Framework                     | Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript (strict) |
| Styling and motion            | Tailwind CSS v4, Motion                                                             |
| Content                       | Typed data files in `src/content` (no CMS)                                          |
| Data and email (from Phase 4) | Neon Postgres with Drizzle ORM, Resend                                              |
| Hosting                       | Vercel, with Vercel Analytics and Speed Insights                                    |

## Build progress

The site is built in seven phases.

| Phase | Scope                                                                                                 | Status  |
| ----- | ----------------------------------------------------------------------------------------------------- | ------- |
| 1     | Foundation: design tokens, light and dark theme, navigation, footer, 404                              | Done    |
| 2     | Homepage sections and animations (hero, work, data lab, experience, about, newsletter and contact UI) | Done    |
| 3     | Case-study pages at `/work/[slug]`                                                                    | Next    |
| 4     | Database, contact form and newsletter backend (Neon, Drizzle, Resend, rate limiting)                  | Planned |
| 5     | Cal.com booking, WhatsApp button, FAQ chat widget                                                     | Planned |
| 6     | `/admin` dashboard and first-party analytics                                                          | Planned |
| 7     | SEO, Open Graph image, security headers, performance pass                                             | Planned |

Until Phase 4 ships, the contact and newsletter forms show a "not connected yet" message instead of sending.

## Run it locally

You need **Node.js 20.9 or newer** (22 recommended), npm and Git.

```bash
git clone https://github.com/jonascodes15/jonas_chukwuemeka_portfolio.git
cd jonas_chukwuemeka_portfolio
npm install
cp .env.example .env.local   # on Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. The site runs without any environment variables set, because every value it uses today has a safe default.

## Scripts

| Command                                     | What it does                                            |
| ------------------------------------------- | ------------------------------------------------------- |
| `npm run dev`                               | Start the dev server with hot reload                    |
| `npm run build`                             | Production build (this is what Vercel runs)             |
| `npm start`                                 | Serve the production build locally (run `build` first)  |
| `npm run lint`                              | ESLint                                                  |
| `npm run typecheck`                         | Generate route types, then check TypeScript             |
| `npm run format`                            | Format every file with Prettier                         |
| `npm run image -- <source> <folder> <name>` | Make AVIF and WebP versions of a screenshot (see below) |

Before pushing, run `npm run typecheck`, `npm run lint` and `npm run build`. If all three pass locally, the Vercel build should too.

## Environment variables

Every variable is documented in [`.env.example`](.env.example). Locally they go in `.env.local`, which git never commits. On Vercel, add them under **Project > Settings > Environment Variables**.

| Variable                      | Needed from    | Notes                                                                                                  |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`        | Now (optional) | `https://jonaschukwuemeka.com`. Defaults to that if unset.                                             |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Now (optional) | Digits only, e.g. `2348069195852`. Defaults to that if unset.                                          |
| `NEXT_PUBLIC_CAL_LINK`        | Phase 5        | Cal.com path, e.g. `jonas-chukwuemeka/intro-call`. The "Book a call" card stays hidden until it's set. |
| `DATABASE_URL`                | Phase 4        | Neon pooled connection string                                                                          |
| `RESEND_API_KEY`              | Phase 4        | From the Resend dashboard                                                                              |
| `CONTACT_TO_EMAIL`            | Phase 4        | Where enquiries are delivered: `jonas@weblanda.com`                                                    |
| `RESEND_FROM_EMAIL`           | Phase 4        | Sender on a domain verified in Resend                                                                  |
| `ADMIN_EMAIL`                 | Phase 6        | Login email for `/admin`                                                                               |
| `ADMIN_PASSWORD_HASH`         | Phase 6        | bcrypt hash of the admin password. The helper script arrives in Phase 6.                               |
| `SESSION_SECRET`              | Phase 6        | Random string of 32+ characters                                                                        |
| `IP_HASH_SALT`                | Phase 6        | A different random string. Raw IP addresses are never stored.                                          |

To generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Variables that start with `NEXT_PUBLIC_` are built into the page and visible to visitors, so never put a secret in one. After you add or change a variable on Vercel, redeploy so the build picks it up.

## Editing content

All copy lives in `src/content`, so most edits never touch a component.

| File              | Controls                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| `site.ts`         | Name, hero text, About paragraphs, contact details, CTA wording, budget ranges |
| `socials.ts`      | LinkedIn, GitHub, X and Facebook links                                         |
| `projects.ts`     | Weblanda and Formtified, their screenshots, and the stores built on Weblanda   |
| `dataProjects.ts` | Data section projects, metrics and architecture diagrams                       |
| `experience.ts`   | Work history, newest first                                                     |
| `education.ts`    | Degree, training and the publication                                           |
| `stack.ts`        | Tools in the scrolling strip                                                   |
| `faq.ts`          | Answers for the chat widget (Phase 5)                                          |

Rules for site copy:

- Only real, checkable facts and numbers. If something isn't confirmed, leave a `// TODO:` comment instead of guessing.
- Avoid "Hire me" and "Book a session" wording.

### Adding a data project

Append an object to `dataProjects` in `src/content/dataProjects.ts`. The card, links and diagram appear on the homepage automatically. Each project should have a GitHub link, and either screenshots or an `architecture` diagram:

- `nodes` are placed on a grid with `col`, `row` and an optional `colSpan`.
- `edges` connect node ids. Set `control: true` for a dashed orchestration line.

### Adding screenshots

Images are compressed once, ahead of time, and served as AVIF with a WebP fallback at several widths.

1. Save the full-size screenshot anywhere outside `public/` (for example your Desktop).
2. Run:
   ```bash
   npm run image -- "C:\path\to\screenshot.png" public/projects/<project-slug> <short-name>
   ```
   For phone screenshots, add a maximum width so files stay small: `... <short-name> 800`
3. The script prints an object. Paste it into that project's `screenshots` array, then fill in `alt` (what the image shows), `caption`, and `device` (`"desktop"` or `"phone"`).

The first screenshot in a project's list is its cover image. Don't commit the full-size sources. The two source folders are already in `.gitignore`.

## Project structure

```
src/
  app/               Routes, root layout, global styles (globals.css holds every colour token)
    (site)/          Public pages: homepage and its layout
  components/
    layout/          Nav, mobile menu, footer
    sections/        Homepage sections (hero, work, data, experience, about, contact, newsletter)
    motion/          Reveal-on-scroll, counters, cursor spotlight
    ui/              Buttons, chips, device frames, picture, form fields
    icons/           Tech and social icons
  content/           All site copy and project data
  server/actions/    Form handlers (placeholders until Phase 4)
public/
  images/            Profile photos
  logos/             Company, school and store logos
  projects/<slug>/   Optimised screenshots
  cv/                Downloadable CV
scripts/             Image optimisation
```

## Deploying to Vercel

1. In Vercel, choose **Add New > Project** and import this GitHub repository.
2. Leave the defaults. Vercel detects Next.js, and the build command is `npm run build`.
3. Add environment variables (see above). None are needed for the site as it is today.
4. Deploy. Each push to `main` deploys to production, and each push to another branch gets a preview URL.
5. To connect the domain, go to **Settings > Domains** and add `jonaschukwuemeka.com` and `www.jonaschukwuemeka.com`. Then add the DNS records Vercel shows at your domain registrar.

### If a deployment fails

1. Open the failed deployment in Vercel and read the **Build Logs**. The first red line is usually the cause.
2. Run `npm run build` locally on the same commit. If it fails locally too, fix that first.
3. If it builds locally but not on Vercel, the usual causes are:
   - **File name case:** Vercel runs on Linux, where `Hero.tsx` and `hero.tsx` are different files.
   - **A file you didn't commit:** run `git status` to check.
   - **A missing environment variable:** only relevant once a phase that needs one has shipped.
4. Use **Redeploy** on the deployment's menu (the three dots) to retry a build that failed for a temporary reason.

## Privacy

The site's own analytics (Phase 6) store only salted hashes of IP addresses, never the raw address. Bots and the owner's own visits are filtered out.
