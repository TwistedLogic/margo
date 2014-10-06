var express = require('express'),
    router  = express.Router(),
    Dish    = require('../models/dish'),
    utils   = require('./utils');

router.route('/dishes')

    // Create a dish in a given day
    .post(function(req, res) {
        utils.authenticateRequest(req, res, function() {
            var dish = new Dish();
            dish.year = req.body.year;
            dish.week = req.body.week;
            dish.day = req.body.day;
            dish.name = req.body.name;

            dish.save(function(err) {
                if (err) { res.send(err); return }

                res.json({
                    success: true,
                    dish: dish
                });
            });
        });
    })
;

router.route('/dishes/:dish_id')

    // Delete a dish
    .post(function(req, res) {
        utils.authenticateRequest(req, res, function() {
            Dish.remove({
                _id: req.params.dish_id
            }, function(err, dish) {
                if (err) { res.send(err); return }

                res.json({
                    success: true,
                    dish: dish
                });
            });
        });
    });

module.exports = router;
