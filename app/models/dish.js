var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DishSchema   = new Schema({
    name: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    day: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Dish', DishSchema);
