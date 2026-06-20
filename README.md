# QuickTemp Mail

QuickTemp Mail is a beginner-friendly static website project for a free temporary email tool.

It creates a disposable email inbox using the public Mail.tm API. The project is made for privacy-friendly testing, newsletters, trials, spam protection, and reducing exposure of your real inbox.

## Tech Used

- HTML
- CSS
- JavaScript
- Browser fetch()
- Browser localStorage
- Mail.tm API

No React, Next.js, Node.js, Firebase, backend, database, npm, build step, paid service, or API key is required.

## Design Style

The current design uses a premium cyber/SaaS visual style:

- Dark mode with deep navy background
- Light mode with clean soft-gray background
- Glassmorphism cards
- Electric blue, cyan, violet, and purple accents
- Subtle glowing gradients
- Lightweight CSS-only grid and particle effects
- Sticky glass-effect header
- Modern SaaS-style footer
- Mobile-first responsive layout
- Reduced-motion support

## Features

- Clean mobile-first responsive homepage
- Professional temporary email box
- Tap the current email box to copy the email
- Larger Generate Email button on mobile
- Toast notifications for generated, copied, refreshed, reset, and error states
- Small loading spinner during API actions
- Generate Email button
- Copy Email button with success message
- Manual Refresh Inbox button with 10-second cooldown
- Auto-refresh inbox every 15 seconds after an email is generated
- Reset Email button that clears the current session and stops auto-refresh
- Inbox count near the Inbox title
- Inbox list with sender, subject, intro, and human-friendly time
- New/unread badge for messages
- Highlight for new messages when they first appear
- Click a message to load full message details
- Safe plain text display for email message content
- Error banner for failed API requests
- Empty inbox design
- Light and dark mode
- FAQ accordion using simple JavaScript
- Privacy Policy page
- Terms page
- sitemap.xml
- robots.txt
- manifest.json
- SVG favicon placeholder
- SEO title, meta description, Open Graph tags, canonical tag, and JSON-LD structured data
- Extra homepage SEO content sections written in simple English

## How the App Works

QuickTemp Mail connects directly to the public Mail.tm API from the browser.

Flow:

1. Fetch available domains from GET /domains.
2. Pick the first active domain from hydra:member.
3. Generate a random username like user12345abcxyz.
4. Create an account with POST /accounts.
5. Login with POST /token.
6. Save the temporary email, generated password, token, and account id in localStorage.
7. Refresh inbox with GET /messages using the Bearer token.
8. Click a message to fetch full details from GET /messages/{id}.
9. Display email details safely as plain text.

Base API:

```text
https://api.mail.tm
```

## localStorage Data

The app stores these values in the browser:

- quicktemp_email
- quicktemp_password
- quicktemp_token
- quicktemp_account_id
- quicktemp_last_refresh
- quicktemp_known_message_ids
- quicktemp_read_message_ids
- quicktemp-theme

Clicking Reset Email clears the temporary email session values from localStorage.

## Refresh Rules

- Manual Refresh Inbox has a 10-second cooldown to reduce repeated API calls.
- Auto-refresh runs every 15 seconds only when a temporary email and token exist.
- Auto-refresh stops when Reset Email is clicked.

## File Structure

```text
free-temp-mail/
├── index.html
├── style.css
├── script.js
├── privacy.html
├── terms.html
├── robots.txt
├── sitemap.xml
├── manifest.json
├── favicon.svg
└── README.md
```

## How to Run Locally

Simple method:

1. Download or clone this repository.
2. Open index.html in your browser.
3. Generate an email and use Refresh Inbox to check messages.

Local server method:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Cloudflare Pages Deployment

### Step 1: Create GitHub repo

Create a GitHub repository for this project. If you already have this repository, you can skip this step.

### Step 2: Upload files

Upload all project files to the GitHub repository:

- index.html
- style.css
- script.js
- privacy.html
- terms.html
- robots.txt
- sitemap.xml
- manifest.json
- favicon.svg
- README.md

### Step 3: Connect Cloudflare Pages to GitHub

Open Cloudflare Pages and connect it to your GitHub account. Select this project repository.

### Step 4: Configure build settings

Use these settings:

```text
Build command: leave empty
Output directory: /
```

### Step 5: Deploy

Click Deploy. No environment variables are needed because Mail.tm does not require an API key.

## Important Notes

- This project uses Mail.tm API.
- This project does not claim full anonymity.
- This project does not claim to be hack proof.
- Do not use temporary email for important accounts.
- Keep usage focused on privacy, spam protection, disposable email needs, temp mail testing, and free temporary email use.

## Before Publishing Seriously

Replace these placeholder URLs after you know your real Cloudflare Pages domain:

- canonical URLs in HTML files
- sitemap.xml URLs
- robots.txt sitemap URL
- Open Graph URL and image URL

## Powered By

Footer text says: Powered by Mail.tm API
