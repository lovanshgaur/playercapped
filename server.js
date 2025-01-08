const express = require('express');
const path = require('path');
const { getClickCount, incrementClickCount, resetClickCount } = require('./database');
const app = express();
const port = 3000;

const MAX_CLICKS = 20;
const SECRET_TOKEN = 'okomo';

app.use(express.static('public'));

// Middleware to check the secret token
function checkSecretToken(req, res, next) {
  const token = req.query.token || req.headers['x-secret-token']; 
  if (token === SECRET_TOKEN) {
    return next(); 
  }
  return res.status(403).send('Forbidden: Invalid or missing secret token');
}

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading the homepage');
    }
  });
});

// Sample 1 route
app.get('/sample1', (req, res) => {
  console.log("Accessing /sample1...");

  getClickCount((err, result) => {
    if (err) {
      console.error("Error accessing the database:", err);
      return res.status(500).send('Error accessing the database');
    }

    const clicks = result.clicks;
    console.log("Current click count:", clicks);

    if (clicks >= MAX_CLICKS) {
      console.log("Click limit reached. Access denied.");
      return res.send('Sorry, this page is no longer available.');
    }

    incrementClickCount((err, newClickCount) => {
      if (err) {
        console.error("Error incrementing the click count:", err);
        return res.status(500).send('Error incrementing the click count');
      }

      console.log("Updated click count for /sample1:", newClickCount);

      // Send the HTML page
      res.sendFile(path.join(__dirname, 'public', 'sample1.html'), (sendFileErr) => {
        if (sendFileErr) {
          console.error("Error serving sample1.html:", sendFileErr);
          res.status(500).send('Error loading the page');
        }
      });
    });
  });
});

// API route to fetch click count
app.get('/api/click-count', (req, res) => {
  getClickCount((err, result) => {
    if (err) {
      console.error("Error accessing the database:", err);
      return res.status(500).send('Error accessing the database');
    }

    const clicks = result.clicks;
    res.json({ clicks }); // Send the click count as a JSON response
  });
});

// Reset the click count to 0 (requires secret token)
app.get('/reset', checkSecretToken, (req, res) => {
  resetClickCount((err) => {
    if (err) {
      return res.status(500).send('Error resetting the click count');
    }
    res.send('Click count has been reset! <a href="/" style="color:black;">Go to Home</a>');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
