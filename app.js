var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var path       = require('path');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/margot');

app.use('/api', require('./app/routes/users'));
app.use('/api', require('./app/routes/dishes'));
app.use('/api', require('./app/routes/weeks'));
app.use('/api', require('./app/routes/tickets'));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('index.html');
});

app.listen(8080);
console.log('Margot is cooking on port 8080');
