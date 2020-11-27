const express = require('express');
const router = express.Router();
const moment = require('moment');

module.exports = (db) => {
  // const getUsernameWithUserId = function (userId) {
  //   const queryString = `SELECT username FROM users WHERE id = $1;`
  //   return db
  //     .query(queryString, [userId])
  // }

  const getResource = function (category) {
    let queryString = `
      SELECT resources.*, AVG(resource_reviews.rating) AS rating
      FROM resources
      LEFT JOIN resource_reviews ON resource_id = resources.id
      WHERE category = $1
      GROUP BY resources.id
      ORDER BY created_at DESC;
      `
    return db
      .query(queryString, [category])
      .then(res => (res.rows))
  }

  const getSingleResource = function(resourceID) {
    let queryString = `
    SELECT resources.*, users.username AS username, AVG(resource_reviews.rating) AS rating, COUNT(resource_reviews.liking) AS likes
    FROM resources
    FULL OUTER JOIN resource_reviews ON resource_id = resources.id
    FULL OUTER JOIN users ON resources.user_id = users.id
    WHERE resources.id = $1
    GROUP BY resources.id, username;
    `
    return db
      .query(queryString, [resourceID])
      .then(res => res.rows);
  }

  const allComments = function (resourceID) {
    let queryString = `
    SELECT comment, users.username
    FROM resource_reviews
    JOIN users ON user_id = users.id
    WHERE resource_id = $1 AND comment IS NOT NULL
    `
    return db
      .query(queryString, [resourceID])
      .then(res => res.rows)
  }

  const addComment = function (comment, resourceID, userID) {
    let queryString = `
    INSERT INTO resource_reviews(comment, resource_id, user_id) VALUES($1,$2, $3)`
    return db.query(queryString, [comment, resourceID, userID])
  }

  const addRating = function (rating, resource_id, user_id) {
    let queryString = `
    INSERT INTO resource_reviews(rating, resource_id, user_id) VALUES($1, $2, $3)`
    return db.query(queryString, [rating, resource_id, user_id])
  }

  const addLike = function(resource_id, user_id) {
    let queryString = `
    INSERT INTO resource_reviews(liking, resource_id, user_id) VALUES(TRUE, $1, $2)`

      return db.query(queryString, [resource_id, user_id])
  }

  const getResourceTrending = () => {
    let queryString = `
      SELECT resources.*, AVG(resource_reviews.rating) AS rating
      FROM resources
      LEFT JOIN resource_reviews ON resource_id = resources.id
      WHERE created_at >= NOW() - INTERVAL '168 HOURS'
      GROUP BY resources.id
      ORDER BY created_at DESC;
    `
    return db
      .query(queryString)
      .then(res => (res.rows))
  };

  let categories = ['Home Improvement', 'Automotive', 'Health & Personal Care', 'Hobbies & Crafts', 'Technology', 'Cooking & Baking', 'Lifestyle', 'Fitness & Wellness', 'Finance & Business', 'Education & Communication'];

  const chooseCategory = categories[Math.floor(Math.random() * categories.length)];

  const addResource = function (title, description, url, category, keyword, userId) {
    const queryString = `
    INSERT INTO resources(title, description,  url, keyword, category, user_id, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`
    return db
      .query(queryString, [title, description, url, category, keyword, userId])
  }

  const checkUrl = function (url) {
    const queryString = `
    SELECT *
    FROM resources
    WHERE url = $1`
    return db
      .query(queryString, [url])
  };

  const getUsername = function (userId) {
    const queryString = `
    SELECT username
    FROM users
    WHERE id = $1`
    return db
      .query(queryString, [userId])
  }

  //Routing for cat form to redirect to form



  router.get('/create', (req, res) => {
    let user = req.session.userId
    res.render('resource_new', {user});
  })

  router.post('/create', (req, res) => {
    const resource = req.body;
    const title = resource.title;
    const description = resource.description;
    const url = resource.url;
    const category = resource.category;
    const keywords = resource.keywords;
    const userId = req.session.userId

    if (category === 'Category') {
      res.status(404).send("Please pick a category!")
    }
    Promise
      .all([checkUrl(url), getUsername(userId)])
      .then(([resultByUrl, resultByUsername]) => {
        const username = resultByUsername.rows[0].username
        if (resultByUrl.rowCount) {
          res.status(400).send("A resource with this url has already exists!");
        } else {
          addResource(title, description, url, category, keywords, userId)
            .then(result => {
              res.redirect(`/users/${username}`)
            })
        }
      })
  });

  // router.post("/categories/category", (req, res) => {
  //   res.render("categoryId", );
  // })



  router.get("/categories/:category", (req, res) => {
    let category = req.params.category;
    const user = req.session.userId
    if (category === 'trending') {
      getResourceTrending(category)
      .then(resources => {
        res.render('categoryId', {resources, category, moment, user});
      })
      .catch((err) => (res.status(404).send(err)));
    } else if (category === 'surprise') {
      getResource(chooseCategory)
      .then(resources => {
        res.render('categoryId', {resources, category, moment, user});
      })
      .catch((err) => (res.status(404).send(err)));
    } else if (!categories.includes(category)) {
      res.status(404).send(`There is not category named ${category}, please go pick another category! <a href='/'>Back to homepage</a>` );
    } else {
      getResource(category)
      .then (resources => {
        res.render('categoryId', {resources, category, moment, user});
      })
      .catch((err) => (res.status(500).send(err)));
    };
  })


  router.get("/:resource_id", (req, res) => {
    let id = req.params.resource_id;
    let user = req.session.userId;

    Promise
      .all([getSingleResource(id), allComments(id), getUsername(user)])
      .then(([resultSingleResource, resultAllComments, resultUsername]) => {
        const username = resultUsername.rows[0].username;
        const sResource = resultSingleResource[0];
        const comments = resultAllComments;
        // const sResource = resultSingleResource[0][0]; //comments
        // sResource.comments = resultAllComments[1]; //everything that  resource is rendering on the page
        res.render('resource', { sResource, comments, user, username});
      })
      .catch((err) => (console.log("500", err.message)));
  });

  router.post("/:resource_id/comments/new", (req, res) => {
    const resource_id = req.params.resource_id;
    const user_id = req.session.userId;
    const comment = req.body.comment;

    addComment(comment, resource_id, user_id)
      .then(dbRes => res.json("OK"))
  });

  router.post("/:resource_id/likes/new", (req, res) => {
    const resource_id = req.params.resource_id;
    const user_id = req.session.userId;

    addLike(resource_id, user_id)
    .then(dbRes => res.json("OK"))
  });

  router.post("/:resource_id/ratings/new", (req, res) => {
    const rating = req.body.rating;
    const resource_id = req.params.resource_id;
    const user_id = req.session.userId;

    addRating(rating, resource_id, user_id)
    .then(dbRes => res.json("OK"))
  });

  return router;
}
