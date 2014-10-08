var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user'),
    Dish    = require('../models/dish'),
    Ticket  = require('../models/ticket'),
    utils   = require('./utils');

router.route('/week')

    // Get dishes and tickets for the given week
    .get(function(req, res) {
        utils.authenticateRequest(req, res, function() {
            var year = req.query.year,
                week = req.query.week;

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

            Dish.find({ year: year, week: week }, function(err, dishes) {
                if (err) { res.send(err); return }

                User.find({}, '_id name admin', function(err, users) {
                    if (err) { res.send(err); return }

                    var map = {};

                    for (var i = 0; i < users.length; i++) {
                        if (!users[i].admin) {
                            map[users[i]._id] = {
                                id: users[i]._id,
                                name: users[i].name,
                                tickets: [false, false, false, false, false]
                            }
                        }
                    }

                    Ticket.find({ year: year, week: week }, function(err, tickets) {
                        if (err) { res.send(err); return }

                        for (i = 0; i < tickets.length; i++) {
                            map[tickets[i].user].tickets[tickets[i].day - 1] = tickets[i]._id;
                        }

                        var weekUsers = [];

                        for (var userId in map) {
                            if (map.hasOwnProperty(userId)) {
                                weekUsers.push(map[userId]);
                            }
                        }

                        res.json({
                            success: true,
                            dishes: dishes,
                            users: weekUsers
                        });
                    });
                });
            });
        });
    })
;

module.exports = router;
