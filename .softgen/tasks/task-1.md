---
title: Create boat browsing page
status: done
priority: urgent
type: feature
tags: [core, ui]
created_by: agent
created_at: 2026-04-12T03:20:49Z
position: 0
---

## Notes
Main landing page showing available speed boats. Users can browse options and click to view details.

## Checklist
- [x] Set up design system in globals.css (retheme shadcn variables, add custom tokens)
- [x] Configure fonts in tailwind.config.ts (Plus Jakarta Sans, Work Sans)
- [x] Create BoatCard component: photo, name, capacity, price/hour, quick specs
- [x] Create BoatGrid component: responsive grid layout with filters (capacity, price range)
- [x] Update index.tsx: hero section with ocean imagery + search bar, featured boats grid
- [x] Add high-quality boat images from Unsplash