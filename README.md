# MovieSearch

This repository houses the code for the MovieSearch Website hosted at <>. This website can be used to simply search the IMDB database with the search history being saved only when there is a user logged in. 

The server runs using Node.js using EJS as the templating engine and Bootstrap 5.0 on the front end. The system diagram is represented below for reference. 


It should be noted here that the design decision to make the server call the OMDB API was influenced by both security concerns of having the API key embedded in the front-end and giving the client a single point to query all its data from. 

As part of this website the following topics have been demonstrated throughout the code:

1. Bootstrap and its grid system 
2. How to create REST APIs using Node.js
3. How to consume other web APIs for data
4. Templating web server using EJS

To run the code first install all the required packges using
```
npm install
```

Then start the server which will be hosted on ```locahost:5000``` using 

```
npm start
```

This repository can also be deployed on Heroku. 
