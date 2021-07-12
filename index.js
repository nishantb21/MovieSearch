const express = require('express');
const { type } = require('os');
const path = require('path');
const request = require('request');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const Pool = require('pg').Pool;

// Database configuration for localhost
const pool = new Pool({
  user: 'server',
  password: 'admin',
  host: 'localhost',
  database: 'movie_search',
  port: 5432
});

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = "";
const SECRET_KEY = "";

// Add the static directories for serving JS and CSS
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));

// Set up session parameters
app.use(session({
  secret: SECRET_KEY,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: false
}));

// Required to parse form data from RESTful calls and normal form submissions
app.use(express.json());
app.use(express.urlencoded());
app.use(cookie_parser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Index page: Will load two different versions depending on whether a user is logged in or not
app.get('/', (req, res) => {
  if (!(req.session.user_id == undefined)) {
    res.render('pages/index', { user_id: req.session.user_id });
  } else {
    res.render('pages/index', { user_id: -1 });
  }
});

// Login API: Will login the user and reload the home page by default
app.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  pool.query('SELECT * FROM users WHERE email=$1', [email], (error, results) => {
    if (error) {
      console.log(error);
    }
    else {
      var user_data = results['rows'][0];
      var new_hash = crypto.pbkdf2Sync(password, user_data['salt'], 1000, 64, 'sha512').toString('hex');
      req.session.user_id = user_data['id'];
      req.session.user_name = user_data['name'];

      if (new_hash == user_data["password"]) {
        res.redirect("/");
      } else {
        res.send('Not Done');
      }
    }
  });
});

// Logout API: Will logout a user by destroying the session variable and redirecting him/her back to the home page
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Sign Up API: Store passwords as hashes instead of plain text
app.post('/register', (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  var salt = crypto.randomBytes(16).toString('hex');
  var hashed_password = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

  pool.query('INSERT INTO users(name, email, salt, password) VALUES($1, $2, $3, $4)', [name, email, salt, hashed_password], (error, results) => {
    if (error) {
      console.log(error);
    }
    else {
      res.redirect("/");
    }
  });

});

// Log API: Log the user history 
app.post("/log", (req, res) => {
  var id = req.session.user_id;
  var title = req.body.title;
  var year = req.body.year;
  var imdb_ID = req.body.imdb_ID;

  pool.query('INSERT INTO history(id, title, year, imdb_ID) VALUES($1, $2, $3, $4)', [id, title, year, imdb_ID], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      res.send(200);
    }
  });
});

// History API: Get the user history
app.get('/history', (req, res) => {
  pool.query('SELECT * FROM history WHERE id=$1', [req.session.user_id], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      if (!(req.session.user_id == undefined)) {
        res.render('pages/history.ejs', { user_id: req.session.user_id, results: results['rows'] });
      } else {
        res.redirect('/');
      }
    }
  });
  
});

// Search API: Given a search term, return the corresponding movies(first 10 results only)
app.get('/search', (req, res) => {
  const OMDB_URL = `http://www.omdbapi.com/?apikey=${API_KEY}&s=${req.query.term}`;
  request.get(OMDB_URL, function (error, response, body) {
    results_obj = JSON.parse(body);
    if (!(req.session.user_id == undefined)) {
      res.render('pages/results.ejs', { user_id: req.session.user_id, results: results_obj["Search"] });
    } else {
      res.render('pages/results.ejs', { user_id: -1, results: results_obj["Search"] });
    }
    
  });
});

// Movie API: Return details of a movie given its identifier
app.post('/movie/:id', (req, res) => {
  const OMDB_URL = `http://www.omdbapi.com/?apikey=${API_KEY}&i=${req.params.id}`;
  request.get(OMDB_URL, function (error, response, body) {
    results_obj = JSON.parse(body);
    res.send(results_obj);
  });
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
