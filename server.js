var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport')
var session = require('express-session');

var index = require('./routes/index');
var sql = require('./routes/sql');
var auth = require('./routes/auth');

var port = 3000;

var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));

// Body Parser MW
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(
    {   secret: 'library',
        resave: false,
        saveUninitialized: false
    }
));
require('./server/passport/passport')(app);


app.use('/', index);
app.use('/sql', sql);
app.use('/auth', auth);

app.listen(port, function () {
    console.log('Server started on port ' + port);
})