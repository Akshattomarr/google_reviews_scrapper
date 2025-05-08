const CDP = require('chrome-remote-interface');

async function scrapeReviews(businessName) {
  let client;
  try {
    client = await CDP();
    const { Network, Page, Runtime } = client;

    await Promise.all([Network.enable(), Page.enable()]);
    await Page.navigate({ url: 'https://www.google.com/maps' });
    await Page.loadEventFired();

    await Runtime.evaluate({
      expression: `
        new Promise(resolve => {
          const input = document.querySelector('#searchboxinput');
          if (!input) return resolve('Search input not found');
          input.value = "${businessName}";
          input.dispatchEvent(new Event('input', { bubbles: true }));
          setTimeout(() => {
            const btn = document.querySelector('#searchbox-searchbutton');
            if (btn) btn.click();
            resolve();
          }, 1000);
        });
      `,
      awaitPromise: true
    });

    await new Promise(resolve => setTimeout(resolve, 8000));

    await Runtime.evaluate({
      expression: `document.querySelector('.Nv2PK a')?.click();`
    });

    await new Promise(resolve => setTimeout(resolve, 8000));

    await Runtime.evaluate({
      expression: `document.querySelector('button[aria-label^="Reviews for"]')?.click();`
    });

    await new Promise(resolve => setTimeout(resolve, 10000));

    await Runtime.evaluate({
      expression: `
        new Promise(resolve => {
          const scrollable = document.querySelector('div[aria-label^="Reviews"]') || document.querySelector('div[role="region"]');
          if (!scrollable) return resolve();
          let count = 0;
          const interval = setInterval(() => {
            scrollable.scrollBy(0, 400);
            count++;
            if (count > 20) {
              clearInterval(interval);
              Array.from(document.querySelectorAll('button')).forEach(btn => {
                if (btn.innerText.trim().toLowerCase() === 'more') btn.click();
              });
              resolve();
            }
          }, 300);
        });
      `,
      awaitPromise: true
    });

    const { result } = await Runtime.evaluate({
      expression: `
        (() => {
          const avgRating = document.querySelector('.fontDisplayLarge')?.textContent || null;

          const totalReviewsText = Array.from(document.querySelectorAll('div.fontBodySmall'))
            .find(el => el.textContent.toLowerCase().includes('review'))?.textContent || '';
          const totalReviews = parseInt(totalReviewsText.replace(/[^0-9]/g, '')) || null;

          const reviewEls = document.querySelectorAll('div[data-review-id]');
          const reviews = [];
          const seen = new Set();

          reviewEls.forEach(el => {
            const id = el.getAttribute('data-review-id');
            if (seen.has(id)) return;
            seen.add(id);

            const username = el.querySelector('.d4r55')?.textContent || 'Unknown';
            const datetime = el.querySelector('.rsqaWe')?.textContent || '';
            const rating = el.querySelector('[aria-label$="stars"]')?.getAttribute('aria-label') || '';
            const body = Array.from(el.querySelectorAll('.wiI7pd'))
              .map(span => span.innerText.trim())
              .join(' ') || '';

            if (username && datetime && rating && body) {
              reviews.push({ username, datetime, rating, body });
            }
          });

          return {
            averageRating: parseFloat(avgRating),
            totalReviews,
            latestReviews: reviews.slice(0, 50)
          };
        })();
      `,
      returnByValue: true
    });

    console.log('✅ Scraped Result:', result.value);
    return result.value;

  } catch (err) {
    console.error('❌ Scraping failed:', err);
    return { error: 'Scraping failed or structure changed.' };
  } finally {
    if (client) await client.close();
  }
}

module.exports = scrapeReviews;
