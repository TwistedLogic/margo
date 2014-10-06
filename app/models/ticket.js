var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TicketSchema = new Schema({
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
    },
    user: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Ticket', TicketSchema);
