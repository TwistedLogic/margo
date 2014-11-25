var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user');

function makeid() {
    var text = "",
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

router.route('/users')

    // Authenticate or register a new user
    .post(function(req, res) {
        var user = new User();
        user.name = req.body.name;
        user.password = req.body.password;
        user.token = makeid();

        User.findOne({name: user.name}, function(err, found) {
            if (err) { res.send(err); return }

            if (found) {
                // Authenticate user
                if (found.password !== user.password) {
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
                // Create a new user
                /*
                user.save(function(err) {
                    if (err) { res.send(err); return }

                    res.json({
                        success: true,
                        user: {
                            token: user.token,
                            name: user.name,
                            admin: user.admin
                        }
                    });
                });
                */

                // User registration disabled
                res.json({error: true, message: "User registration disabled"});
            }
        });
    })
;

module.exports = router;
