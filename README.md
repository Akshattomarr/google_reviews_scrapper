﻿# Google Reviews Scraper API

This project is a Node.js API that scrapes Google Maps reviews using the Chrome DevTools Protocol (CDP) via the `chrome-remote-interface` library.

## 📦 Features

- Accepts a business name as a query parameter
- Launches a CDP-controlled Chrome session
- Searches the business on Google Maps
- Clicks into the first result and opens the Reviews tab
- Extracts:
  - ✅ Average Rating
  - ✅ Total Number of Reviews
  - ✅ Latest 50 Reviews (deduplicated)

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/Akshattomarr/google_reviews_scrapper.git
cd google-reviews-scraper
npm install
```

### 2. Start Chrome with CDP

```bash
for ubuntu : google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-devtools

for windows:  & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-devtools-profile"
```

Make sure Chrome stays open.

### 3. Run the API

```bash
node server.js
```

### 4. Test It

```bash
curl "http://localhost:3000/api/reviews?business=Starbucks New York"
```

You should get a JSON response like:

```json
{
  "averageRating": 4.3,
  "totalReviews": 5853,
  "latestReviews": [
    {
      "username": "John Doe",
      "datetime": "2 weeks ago",
      "rating": "5 stars",
      "body": "Great coffee and ambiance..."
    }
  ]
}
```

---

