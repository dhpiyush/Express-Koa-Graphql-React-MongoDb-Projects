const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwt_strategy = require('./jwt-strategy');
const db = require('./database');

const strategy = jwt_strategy.strategy;
const jwtOptions = jwt_strategy.jwtOptions;
// use the strategy
passport.use(strategy);

const app = express();
// initialize passport with express
app.use(passport.initialize());

// parse application/json
app.use(bodyParser.json());
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// set some basic routes
app.get('/', function(req, res) {
  res.json({ message: 'Express is up!' });
});

// get all users
app.get('/users', function(req, res) {
  db.getAllUsers().then(user => res.json(user));
});

// register route
app.post('/register', function(req, res, next) {
  const { name, password } = req.body;
  db.createUser({ name, password }).then(user =>
    res.json({ user, msg: 'account created successfully' })
  );
});

//login route
app.post('/login', async function(req, res, next) {
  const { name, password } = req.body;
  console.log(req.body);
  if (name && password) {
    // let user = await db.getUser({ name: name });
    let user = {password:'test',id:'123'};
    if (!user) {
      res.status(401).json({ message: 'No such user found' });
    }
    if (user.password === password) {
      // from now on we'll identify the user by the id and the id is the 
      // only personalized value that goes into our token
      let payload = { id: user.id };
      let token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({ msg: 'ok', token: token });
    } else {
      res.status(401).json({ msg: 'Password is incorrect' });
    }
  }
});

// protected route
app.get('/protected', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.json('Success! You can now see this without a token.');
});

// start app
app.listen(3000, function() {
  console.log('Express is running on port 3000');
});