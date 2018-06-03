const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(422).send({ 
      error: 'You must provide an email and password' 
    });
  }

  // check if user already exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }
    //if user exists return error
    if (existingUser) {
      return res.status(422).send({ error: 'That address already exists'});
    }
    
    //else create an save the user
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) { return next(err); }
    });

    //respond to the request
    res.json({ token: tokenForUser(user) });
  });
};