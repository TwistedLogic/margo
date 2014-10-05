var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/margo');

var Dish = require('./app/models/dish');
var User = require('./app/models/user');

var router = express.Router();

function authenticateRequest(req, res, callback) {
    User.findOne({token: req.body.token}, function(err, user) {
        if (err) {
            res.send(err);

            return;
        }

        if (user) {
            if (callback) {
                callback(user);
            }
        } else {
            res.json({
                success: false,
                message: "Invalid token, authentication needed."
            });
        }
    });
}

router.route('/dishes')

    .get(function(req, res) {
        var year = req.query.year,
            week = req.query.week,
            day = req.query.day;

        if (!year) {
            res.json({
                success: false,
                message: "The param 'year' is required."
            });

            return;
        }

        if (!week) {
            res.json({
                success: false,
                message: "The param 'week' is required."
            });

            return;
        }

        var params = {
            year: year,
            week: week
        };

        if (day) {
            params.day = day;
        }

        Dish.find(params, function(err, dishes) {
            if (err) {
                res.send(err);
            }

            res.json({
                success: true,
                dishes: dishes
            });
        });
    })

    .post(function(req, res) {
        authenticateRequest(req, res, function() {
            var dish = new Dish();
            dish.year = req.body.year;
            dish.name = req.body.name;
            dish.week = req.body.week;
            dish.day = req.body.day;

            dish.save(function(err) {
                if (err) {
                    res.send(err);

                    return;
                }

                res.json({
                    success: true,
                    dish: dish
                });
            });
        });
    })
;

router.route('/dishes/:dish_id')

    .post(function(req, res) {
        authenticateRequest(req, res, function() {
            Dish.remove({
                _id: req.params.dish_id
            }, function(err, dish) {
                if (err) {
                    res.send(err);

                    return;
                }

                res.json({
                    success: true,
                    dish: dish
                });
            });
        });
    });

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

router.route('/users')

    .post(function(req, res) {
        var user = new User();
        user.name = req.body.name;
        user.password = req.body.password;
        user.token = makeid();

        if (!user.name) {
            res.json({
                success: false,
                message: "Invalid name"
            });

            return;
        }

        if (!user.password) {
            res.json({
                success: false,
                message: "Invalid password"
            });

            return;
        }

        User.findOne({name: user.name}, function(err, found) {
            if (err) {
                res.send(err);

                return;
            }

            if (found) {
                if (found.password != user.password) {
                    res.json({
                        success: false,
                        message: "Invalid password"
                    });

                    return;
                }

                res.json({
                    success: true,
                    user: {
                        token: found.token,
                        name: found.name,
                        admin: found.admin
                    }
                });
            } else {
                user.save(function(err) {
                    if (err) {
                        res.send(err);

                        return;
                    }

                    res.json({
                        success: true,
                        user: {
                            token: user.token,
                            name: user.name,
                            admin: user.admin
                        }
                    });
                });
            }
        });
    })

    .get(function(req, res) {
        User.find({}, 'name', function(err, users) {
            if (err) {
                res.send(err);
            }

            res.json({
                success: true,
                users: users
            });
        });
    });



app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);
