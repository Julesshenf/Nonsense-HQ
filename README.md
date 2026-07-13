# Nonsense HQ

An interactive emotional catharsis and slacking companion for high-pressure students and office workers.

## Features

- Responsive single-page UI with desktop/tablet and mobile layouts.
- Mood check-in panel with quick emotions and expanded emotion choices.
- Bullet wall for venting, with clickable pause, edit, and delete controls.
- Decompression toolbox with a slacking timer, wheel, finger calculator, relationship calculator, and gender predictor.
- Profile area with favorites and history.
- AI-assisted energy-field analysis and small-things tribunal flows.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Express
- DeepSeek API integration through Baidu Qianfan's OpenAI-compatible endpoint

## Run Locally

Prerequisites: Node.js.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and set your Qianfan `API_KEY` and `APP_ID`.

3. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Notes

- `data/accounts.json` is kept empty in the repository. Runtime account data should not be committed.
- `.env*` files are ignored except `.env.example`.
