# Will AI Take My Job?

> **Status:** Live · Last updated May 2026

**1,011 occupations. 32 career clusters. One question that's hard to sit with.**

🖥️ **Live:** [will-ai-take-my-job-project.vercel.app](https://will-ai-take-my-job-project.vercel.app)

---

## The idea

The data on AI displacement exists. The anxiety exists. What didn't exist was a way to actually sit with it — to look up your specific job, understand the risk level, and explore what else is out there without it feeling like a threat.

Most tools in this space are either panic-inducing infographics or sanitised corporate reassurances. This is neither.

It's a file explorer. You navigate career clusters like folders. You search by job title. You filter by risk level. You read the official description of each occupation alongside its displacement status. The Windows 98 aesthetic was deliberate — exploring the future of work through 1998-era computing creates a tension that makes a heavy topic feel approachable rather than catastrophic. The interface asks a question before you've finished loading the page.

---

## Screenshots

<img src="open screen.png.png" width="100%" alt="Windows 98 interface showing 1,011 occupations across 32 career clusters"/>

<br/>

<img src="jobs open.png.png" width="100%" alt="Job list open inside a career cluster with AT RISK and SAFE tags"/>

---

## What it does

- Browse 1,011 occupations across 32 career clusters through a Windows 98 file explorer interface
- Search any occupation with fuzzy matching — handles common title synonyms, not just exact strings
- Filter: all jobs · at-risk only · safe only
- Each occupation shows its official SOC description and displacement risk status
- 90 roles flagged as high-risk from AI displacement

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Search | Fuse.js (fuzzy matching) |
| Data processing | Python + openpyxl |
| Deployment | Vercel |

---

## Data

Based on official US occupational classifications (SOC codes). 1,011 occupations across 32 career clusters. 90 roles flagged as at risk. [Medium confidence — verify methodology before citing for research.]

---

Built by **Pranjal Suthar** — applied psychology graduate, brand ops, occasional builder of things that should already exist. No formal engineering background. The ideas don't wait for credentials.

→ [GitHub](https://github.com/pranjalsuthar-555) · [LinkedIn](https://www.linkedin.com/in/sutharpranjal) · [Email](mailto:pranjalsuthar.work@gmail.com)
