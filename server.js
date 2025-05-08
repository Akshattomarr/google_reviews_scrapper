const express = require('express');
const scrapeReviews = require('./scraper');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/reviews', async (req, res) => {
  const { business } = req.query;
  if (!business) return res.status(400).json({ error: 'Missing business parameter' });
  const data = await scrapeReviews(business);
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
