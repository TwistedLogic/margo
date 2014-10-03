var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DishSchema   = new Schema({
    name: String,
    year: Number,
    week: Number,
    day: Number
});

module.exports = mongoose.model('Dish', DishSchema);
