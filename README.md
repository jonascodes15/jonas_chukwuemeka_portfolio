# Jonas Chukwuemeka · Portfolio

My personal site: the products I've built, my data engineering work and how to reach me.

Live at [jonaschukwuemeka.com](https://jonaschukwuemeka.com)

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4 and Motion. Hosted on Vercel.

## Running locally

Needs Node.js 20.9+.

```bash
git clone https://github.com/jonascodes15/jonas_chukwuemeka_portfolio.git
cd jonas_chukwuemeka_portfolio
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. The comments in the file explain each one. The site runs fine without them for now. They're for the contact form, newsletter and admin dashboard as those get built.

For the admin password, run `npm run hash-password` to get the hash.

## Content

All text and project data lives in `src/content`, so updating the site mostly means editing those files.

To add a screenshot:

```bash
npm run image -- path/to/screenshot.png public/projects/<project> <name>
```

This saves compressed AVIF and WebP copies and prints the entry to paste into the project's `screenshots` list.
