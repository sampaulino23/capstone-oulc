const express = require('express')
const bodyparser = require('body-parser')
const handlebars = require('handlebars');
var urlencodedparser = bodyparser.urlencoded({extended:false});
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const hbs = require('handlebars');
const moment = require('moment');

const dotenv = require('dotenv');
require('dotenv').config({ path: '.env' });

const app = express();

app.engine( 'hbs', exphbs.engine({
    extname: 'hbs', // configures the extension name to be .hbs instead of .handlebars
    defaultView: 'main', // this is the default value but you may change it to whatever you'd like
    layoutsDir: path.join(__dirname, '/views/layouts'), // Layouts folder
    partialsDir: path.join(__dirname, '/views/partials'), // Partials folder
}));

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(bodyparser.json());

// helpers

hbs.registerHelper('formatdate', function(text){ 
    var date = moment(new Date((text)));
    return date.format("MM/DD/YYYY");   
});

hbs.registerHelper('compare', function(lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function(l, r) { return l == r; },
        '===': function(l, r) { return l === r; },
        '!=': function(l, r) { return l != r; },
        '!==': function(l, r) { return l !== r; },
        '<': function(l, r) { return l < r; },
        '>': function(l, r) { return l > r; },
        '<=': function(l, r) { return l <= r; },
        '>=': function(l, r) { return l >= r; },
        'typeof': function(l, r) { return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('numberWithComma', function(x){ 
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
     
});

//Import Routes

const loginRoute = require('./routes/login');
app.use('/', loginRoute);
app.use('/login', loginRoute);

const adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

const staffRoute = require('./routes/staff');
app.use('/staff', staffRoute);

const specificRequestRoute = require('./routes/specificrequest');
app.use('/request', specificRequestRoute);

app.get("/logout", function(req, res) {
    req.session.destroy(function (err) {
        res.redirect('/login');
      });
});



app.listen(process.env.PORT || 3000);