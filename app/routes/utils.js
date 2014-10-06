var User = require('../models/user');

var utils = {
    authenticateRequest: function(req, res, successCallback) {
        var token = req.query.token || req.body.token;

        User.findOne({token: token}, function(err, user) {
            if (err) {
                res.send(err);
                return;
            }

            if (user) {
                if (successCallback) {
                    successCallback(user);
                }
            } else {
                res.json({
                    success: false,
                    message: "Invalid token, authentication needed."
                });
            }
        });
    }
};

module.exports = utils;
