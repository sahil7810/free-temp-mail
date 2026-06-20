# QuickTemp Mail

QuickTemp Mail is a beginner-friendly static website project for a free temporary email tool.

The project uses only:

- HTML
- CSS
- JavaScript
- Browser fetch()
- Browser localStorage

It does not use React, Next.js, Node.js, Firebase, a database, a backend, paid services, or API keys.

## Features

- Clean responsive homepage
- Header with QuickTemp Mail logo text
- Hero section for temporary email use
- Main temporary email box area
- Generate Email, Copy Email, Refresh Inbox, and Reset Email buttons
- Real temporary email generation with Mail.tm API
- Inbox list with sender, subject, intro, and date
- Click a message to load full message details
- Safe plain text display for email message content
- Privacy Policy page
- Terms page
- Light and dark mode with CSS variables
- Accessible HTML structure
- SEO meta tags and JSON-LD structured data

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
- quicktemp-theme

Clicking Reset Email clears the temporary email session values from localStorage.

## Refresh Cooldown

The Refresh Inbox button has a 10-second cooldown to reduce repeated API calls.

## File Structure

```text
free-temp-mail/
├── index.html
├── style.css
├── script.js
├── privacy.html
├── terms.html
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

## Deploy on Cloudflare Pages

1. Push this project to GitHub.
2. Open Cloudflare Pages.
3. Connect your GitHub repository.
4. Select this repository.
5. Keep build command empty.
6. Keep output directory as / or leave it blank for a simple static site.
7. Deploy.

No environment variables are needed because Mail.tm does not require an API key.

## Important Notes

- This project uses Mail.tm API.
- This project does not claim full anonymity.
- This project does not claim to be hack proof.
- Do not use temporary email for important accounts.
- Keep usage focused on privacy, spam protection, and testing.

## Powered By

Footer text says: Powered by Mail.tm API
