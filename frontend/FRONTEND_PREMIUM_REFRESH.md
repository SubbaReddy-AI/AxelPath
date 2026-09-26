# AxelPath Frontend — Simple Premium Refresh

## What changed

- Refreshed Services, Academy, Internships, Projects and Careers pages with a cleaner premium visual hierarchy.
- Added page-specific premium background artwork and image-led cards.
- Every major card places the category/program name directly below its image.
- Simplified course cards: no public fee, duration, learner count or unnecessary metadata.
- Simplified internship cards: no public fee, duration, location, mode or openings.
- Simplified career cards: no public location/employment/experience metadata on the card.
- Removed duration from course registration selected-program summary.
- Kept course `price` in frontend course data for the backend/Razorpay payment flow; it is not rendered in the public UI.
- Updated Academy to 7 courses:
  1. Web Development
  2. Data Science & Data Analytics
  3. AI & Machine Learning
  4. Generative AI & Agentic AI
  5. Full Stack Development
  6. Python Development
  7. RAG & AI Applications
- Improved responsive layouts, card spacing, typography, buttons and navigation.

## Run

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Backend/Docker is not required to preview the frontend pages. Course payment requires the configured backend when the registration flow is used.
