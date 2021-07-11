const express = require('express');
const { type } = require('os');
const path = require('path');
const request = require('request');
const util = require('util');
const app = express();
const PORT = process.env.PORT || 5000;

var API_KEY = "e2079696";

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));
app.get('/search', (req, res) => {
  const OMDB_URL = `http://www.omdbapi.com/?apikey=${API_KEY}&s=${req.query.term}`;
  request.get(OMDB_URL, function (error, response, body) {
    results_obj = JSON.parse(body);
    res.render('pages/results.ejs', { results: results_obj["Search"] });
  });
});

app.post('/movie/:id', (req, res) => {
  const OMDB_URL = `http://www.omdbapi.com/?apikey=${API_KEY}&i=${req.params.id}`;
  request.get(OMDB_URL, function (error, response, body) {
    results_obj = JSON.parse(body);
    res.send(results_obj);
  });
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
