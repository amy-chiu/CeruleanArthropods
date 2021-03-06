var jwt = require('jwt-simple');
var db = require('../db/index.js');

var secret = 'mm bubble tea';

module.exports.signin = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // Attempts to find a user with given username
  var sqlquery = "SELECT * FROM tbl_users WHERE username = ?";

  db.query(sqlquery, username, function (err, data) {
    if( err ) {
      res.status(404).send('Error: user not found. ' + err);
    } else {
      // If user found and password matches, returns token. Else, sends 404.
      var user = data[0];
      if( user.password !== password ) {
        res.status(404).send('Error: password does not match');
      } else {
        var token = jwt.encode(user, secret);
        res.json({token: token});     
      }
    }
  })
  
};

module.exports.signup = function (req, res) {

  // Inserts into SQL database.  If successful, responds with token.  Else, send 404.
  var sqlquery = "INSERT INTO tbl_users (username, password) VALUES ( ?,  ?)";

  var user = {
    username: req.body.username,
    password: req.body.password
  }

  db.query(sqlquery, [req.body.username, req.body.password], function (err, data){
    if( err ) {
      res.status(404).send('Error: signup failed. ' + err);
    } else {
      var token = jwt.encode(user, secret);
      res.json({token: token});
    }
  });
};

module.exports.checkAuth = function (req, res, next) {
  // Checks request for token and attempts to decode
  var token = req.headers['x-access-token'];
  if( !token ) {
    next(new Error('No token'));
  } else {
    var user = jwt.decode(token, secret);
    // Queries for decoded user.  If found, returns 200. Else, sends 404 or 401.
    var sqlquery = "SELECT * FROM tbl_users WHERE username = ?";
    db.query(sqlquery, user.username, function (err, data) {
      if( err ) {
        res.status(404).send(err);
      } else {
        if( data.length === 0 ) {
          res.send(401);
        } else {
          res.send(200);   
        }
      }
    })
  }
}
