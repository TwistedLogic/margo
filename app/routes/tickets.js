var express = require('express'),
    router  = express.Router(),
    Ticket  = require('../models/ticket'),
    utils   = require('./utils');

router.route('/tickets')

    // Create a new ticket for the given day
    .post(function(req, res) {
        utils.authenticateRequest(req, res, function(user) {
            var ticket = new Ticket();
            ticket.user = user._id;
            ticket.year = req.body.year;
            ticket.week = req.body.week;
            ticket.day = req.body.day;

            ticket.save(function(err) {
                if (err) { res.send(err); return }

                res.json({
                    success: true,
                    ticket: ticket
                });
            });
        });
    })
;

router.route('/tickets/:ticket_id')

    // Delete a ticket
    .post(function(req, res) {
        utils.authenticateRequest(req, res, function(user) {
            Ticket.remove({
                _id: req.params.ticket_id,
                user: user._id
            }, function(err, ticket) {
                if (err) { res.send(err); return }

                res.json({
                    success: true,
                    ticket: ticket
                });
            });
        });
    });

module.exports = router;
