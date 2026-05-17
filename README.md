# Will AI Take My Job?

A retro-styled interactive data explorer that lets you browse 1,011 occupations across 32 career clusters and find out which roles are most vulnerable to AI displacement.

**Live site:** [https://will-ai-take-my-job-project.vercel.app/](https://will-ai-take-my-job-project.vercel.app/)

---

## What it does

- Browse jobs by career cluster through a Windows 98 file explorer interface
- Search any occupation using fuzzy matching with common job title synonyms
- Filter by risk level -- all jobs, at-risk only, or safe only
- Each job shows its official description and displacement risk status

## Tech stack

- React + Vite
- Tailwind CSS
- Fuse.js for fuzzy search
- Python + openpyxl for data processing
- Deployed on Vercel

## Data source

Based on official US occupational classifications (SOC codes). 1,011 occupations across 32 career clusters, with 90 roles flagged as at risk from AI displacement.

## Roadmap

- [ ] AI-powered per-job risk analysis via Claude API
- [ ] Pivot role suggestions for at-risk occupations
- [ ] Shareable job risk URLs

## About

Built by Pranjal -- Applied Psychology graduate exploring the intersection of human behavior, design strategy, and emerging technology. Built independently through vibe coding with no formal engineering background.
