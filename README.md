# QuickTemp Mail

QuickTemp Mail is a beginner-friendly static website project for a free temporary email tool.

The project uses only:

- HTML
- CSS
- JavaScript

It does not use React, Next.js, Node.js, Firebase, a database, a backend, paid services, or API keys.

## Features

- Clean responsive homepage
- Header with QuickTemp Mail logo text
- Hero section for temporary email use
- Main temporary email box area
- Buttons for Generate Email, Copy Email, Refresh Inbox, and Reset Email
- Inbox section
- Message details section
- FAQ section
- Privacy Policy page
- Terms page
- Light and dark mode with CSS variables
- Accessible HTML structure
- SEO meta tags and JSON-LD structured data

## Current JavaScript Status

The `script.js` file currently contains placeholder functions only:

- `generateEmail()`
- `copyEmail()`
- `refreshInbox()`
- `resetEmail()`
- `toggleTheme()`

The current version does not receive real emails yet. Mail.tm API support can be added later without using API keys.

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

1. Download or clone this repository.
2. Open `index.html` in your browser.
3. No installation is required.

## Deploy on Cloudflare Pages

1. Push this project to GitHub.
2. Open Cloudflare Pages.
3. Connect your GitHub repository.
4. Select this repository.
5. Keep build command empty.
6. Keep output directory as `/` or leave it blank for a simple static site.
7. Deploy.

## Important Notes

- This project does not claim full anonymity.
- This project does not claim to be hack proof.
- Do not use temporary email for important accounts.
- Keep usage focused on privacy, spam protection, and testing.

## Powered By

Footer text says: Powered by Mail.tm API

Real API connection is not added yet in this beginner version.
