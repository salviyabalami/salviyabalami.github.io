# Salviya Balami — Portfolio

Personal portfolio for **Salviya Balami**, a Computer Science student at Caltech.

**Live site:** https://salviyabalami.github.io

## Overview

The site is a single-page portfolio focused on concise, interactive storytelling rather than separate content tabs. It includes:

- an identity-first landing section with contact links
- an About section with a responsive photo carousel
- an expandable experience timeline for Rockwell Automation, the University of Minnesota RPM Lab, and Jane Street FOCUS
- animated project architecture diagrams for machine-learning projects
- collaborator credits with LinkedIn links
- responsive mobile layouts
- scroll reveal animations, a custom desktop cursor, and a minimal particle background

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages

No frontend framework or build step is required.

## Project structure

```text
.
├── index.html                 # Single-page site markup
├── styles.css                 # Shared/base styling
├── rework.css                 # Main layout and redesign styling
├── landing-about.css          # Landing and About-specific styling
├── experience.css             # Experience timeline and expandable cards
├── project-interactive.css    # Animated project diagrams and team panels
├── site-effects.css           # Cursor and particle effects
├── index.js                   # Navigation, carousel, and shared interactions
├── landing-about.js           # Landing/About motion and email interactions
├── experience.js              # Experience accordion and image sliders
├── project-interactive.js     # Project architecture animations and collaborators
├── site-effects.js            # Cursor and particle background behavior
└── images/                    # Production image assets used by the live site
```

The code is intentionally split by feature instead of bundled into one large stylesheet or script so each interaction remains easy to find and maintain.

## Run locally

From the repository root:

### Windows

```powershell
py -m http.server 8000
```

### macOS / Linux

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deployment

The site is hosted with GitHub Pages. Changes merged into `main` are deployed to:

https://salviyabalami.github.io

## Author

**Salviya Balami**  
Computer Science, California Institute of Technology
