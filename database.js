const sqlite3 = require('sqlite3').verbose();

// Open or create the SQLite database
const db = new sqlite3.Database('./clicks.db', (err) => {
  if (err) {
    console.error('Could not connect to the database:', err);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Create the click_count table if it doesn't exist, only when the app starts
db.run(`CREATE TABLE IF NOT EXISTS click_count (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clicks INTEGER DEFAULT 0
)`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table created or already exists');
  }
});

// Function to get the current click count
function getClickCount(callback) {
  db.get('SELECT clicks FROM click_count WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Error fetching click count:', err);
      return callback(err, null);
    }
    if (!row) {
      // If no entry exists, initialize it
      db.run('INSERT INTO click_count (clicks) VALUES (0)');
      return callback(null, { clicks: 0 });
    }
    callback(null, row);
  });
}

// Function to increment the click count
function incrementClickCount(callback) {
  db.get('SELECT clicks FROM click_count WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Error fetching click count:', err);
      return callback(err);
    }
    let newClickCount = row ? row.clicks + 1 : 1;
    db.run('UPDATE click_count SET clicks = ? WHERE id = 1', [newClickCount], (err) => {
      if (err) {
        console.error('Error updating click count:', err);
        return callback(err);
      }
      callback(null, newClickCount);
    });
  });
}

// Function to reset the click count to 0
function resetClickCount(callback) {
  db.run('UPDATE click_count SET clicks = 0 WHERE id = 1', (err) => {
    if (err) {
      console.error('Error resetting the click count:', err);
      return callback(err);
    }
    callback(null);
  });
}

module.exports = {
  getClickCount,
  incrementClickCount,
  resetClickCount
};
