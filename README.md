# QuickTemp Mail

QuickTemp Mail is a beginner-friendly static website project for a free temporary email tool.

It creates a disposable email inbox using the public Mail.tm API. The project is made for privacy-friendly testing, newsletters, trials, spam protection, and reducing exposure of your real inbox.

## Tech Used

- HTML
- CSS
- JavaScript
- Browser fetch()
- Browser localStorage and sessionStorage
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
- Auto-refresh pauses while the browser tab is hidden
- Reset Email button that clears the current session and stops auto-refresh
- Inbox count near the Inbox title
- Inbox list with sender, subject, intro, and human-friendly time
- New/unread badge for messages
- Highlight for new messages when they first appear
- Click a message to load full message details
- Safe plain text display for email message content
- Safe http:// and https:// URL rendering using DOM-created links
- Message body trimming for very long emails
- Capped stored message ID history to avoid unlimited localStorage growth
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
- SEO title, meta description, Open Graph tags, and canonical tag
- Cloudflare _headers security policy for stricter browser protection
- Extra homepage SEO content sections written in simple English

## How the App Works

QuickTemp Mail connects directly to the public Mail.tm API from the browser.

Flow:

1. Fetch available domains from GET /domains.
2. Pick the first active domain from hydra:member.
3. Generate a random username using browser crypto when available.
4. Create an account with POST /accounts.
5. Login with POST /token.
6. Save the temporary email address in localStorage and sensitive session values in sessionStorage.
7. Refresh inbox with GET /messages using the Bearer token.
8. Click a message to fetch full details from GET /messages/{id}.
9. Display email details safely as plain text.
10. Convert plain text http:// and https:// URLs into safe links using DOM methods.

Base API:

```text
https://api.mail.tm
```

## Browser Storage Data

The app uses two browser storage areas:

localStorage stores convenience values:

- quicktemp_email
- quicktemp_known_message_ids
- quicktemp_read_message_ids
- quicktemp-theme

sessionStorage stores sensitive session values:

- quicktemp_password
- quicktemp_token
- quicktemp_account_id
- quicktemp_last_refresh

Clicking Reset Email clears the temporary email session values from browser storage. The sensitive session values are also cleared when the browser session ends.

## Refresh Rules

- Manual Refresh Inbox has a 10-second cooldown to reduce repeated API calls.
- Auto-refresh runs every 15 seconds only when a temporary email and token exist.
- Auto-refresh pauses when the browser tab is hidden.
- Auto-refresh stops when Reset Email is clicked.

## Security Notes

- Email message HTML is not inserted into the page.
- Message text is rendered with safe text nodes.
- Links are created only for http:// and https:// URLs.
- Links open with noopener/noreferrer/nofollow.
- No inline click handlers are used.
- Sensitive token and password values are stored in sessionStorage instead of long-term localStorage.
- Cloudflare _headers adds CSP, frame protection, permissions restrictions, nosniff, and referrer policy.
- This project is hardened for a static site, but no public website can honestly be called impossible to hack.

## File Structure

```text
free-temp-mail/
├── index.html
├── style.css
├── security-ui.css
├── script.js
├── privacy.html
├── terms.html
├── _headers
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
- security-ui.css
- script.js
- privacy.html
- terms.html
- _headers
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
