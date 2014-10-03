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

            res.json(dishes);
        });
    })

    .post(function(req, res) {

        var token = req.body.token;

        User.findOne({token: token}, function(err, user) {
            if (err) {
                res.send(err);
            }

            if (user) {
                var dish = new Dish();
                dish.year = req.body.year;
                dish.name = req.body.name;
                dish.week = req.body.week;
                dish.day = req.body.day;

                dish.save(function(err) {
                    if (err) {
                        res.send(err);
                    }

                    res.json({
                        success: true,
                        id: dish._id
                    });
                });
            } else {
                res.json({
                    success: false,
                    message: "Invalid token, authentication needed."
                });
            }
        });
    })
;

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

        User.findOne({name: user.name}, "name", function(err, found) {
            if (err) {
                res.send(err);
            }

            if (found) {
                res.json({
                    success: false,
                    message: "User already exists"
                });
            } else {
                user.save(function(err) {
                    if (err) {
                        res.send(err);
                    }

                    res.json({
                        success: true,
                        token: user.token
                    });
                });
            }
        });
    })

    .get(function(req, res) {
        User.findOne({name: req.body.name, password: req.body.password}, 'token', function(err, user) {
            if (err) {
                res.send(err);
            }

            res.json({
                success: true,
                token: user.token
            });
        });
    });

app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);
