const express = require('express');
const router = express.Router();
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

module.exports = (db) => {
  const getUserWithUsername = (userId) => {
    const queryString =  `
    SELECT * 
    FROM users 
    WHERE username = $1
    `
    return db
      .query(queryString, [userId])
      .then(res => (res.rows[0]))
  }

  const addUser = function (username, email, password, name, avatar) {
    const queryString = `
      INSERT INTO users (username, email, password, full_name, avatar)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `
    return db
      .query(queryString, [username, email, password, name, avatar])
      .then(res => (res.rows[0]))
  }


  const getUserwithEmail = function (email) {
    const queryString = `
    SELECT * 
    FROM users 
    WHERE email = $1`
    return db
      .query(queryString, [email])
      .then(res => (res.rows[0]))
  };
  
  const authenticateUser =  function(email, password) {
    return getUserwithEmail(email)
    .then(user => {
      if (bcrypt.compareSync(password, user.password)) {
        return user;
      }
      return null;
    });
  }
  router.get("/register", (req, res) => {
    let user = req.session.userId;
    let username = req.params.username;
    res.render("registration", { user, username});
  });

  // ---- User to sign in---
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email);

    getUserwithEmail(email)
      .then(user => {
        if (!user) {
          res.status(300).redirect('/register');
        }
      });
    authenticateUser(email, password)
      .then(user => {
        if (!user) {
          res.status(300).send('An incorrect password was entered!');
        }
        req.session.userId = user.id;
        let username = user.username;
        res.redirect(`/users/${username}`);
      })
      .catch(e => res.send(e));
  });

  //logout
  router.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/')
  });

  router.post('/register', (req, res) => {
    const user = req.body;
    const name = user.fullname;
    const email = user.email;
    const avatar = user.avatar;
    const username = user.username;
    const password = user.password;
    const hashedPassword = bcrypt.hashSync(password, 12);

    if (!email || !password || !username) {
      res.status(400).send("Fields cannot be blank!");
    }

    Promise
      .all([getUserwithEmail(email), getUserWithUsername(username)])
      .then(([resultByEmail, resultByUsername]) => {
        if (resultByEmail || resultByUsername) {
          res.status(400).send("An account with this email or username already exists!");
        } else {
          addUser(username, email, hashedPassword, name, avatar).then(user => {
            req.session.userId = user.id;
            res.redirect(`/users/${username}`)
          })
        }
      })
  })

  return router
}
