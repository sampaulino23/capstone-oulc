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

const socket = require("socket.io");

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

hbs.registerHelper('formatfeedbackdate', function(text){ 
    var date = moment(new Date((text)));
    return date.format("MMM D, YYYY h:mmA");   
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

hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

//Import Routes

const loginRoute = require('./routes/login');
app.use('/', loginRoute);
app.use('/login', loginRoute);

const adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

const staffRoute = require('./routes/staff');
app.use('/staff', staffRoute);

const attorneyRoute = require('./routes/attorney');
app.use('/attorney', attorneyRoute);

const requesterRoute = require('./routes/requester');
app.use('/requester', requesterRoute);

const specificRequestRoute = require('./routes/specificrequest');
app.use('/request', specificRequestRoute);

const requestDocumentsRoute = require('./routes/requestdocuments');
app.use('/requestdocuments', requestDocumentsRoute);

app.get("/logout", function(req, res) {
    req.session.destroy(function (err) {
        res.redirect('/login');
      });
});



const server = app.listen(process.env.PORT || 3000);

const io = socket(server);
io.on("connection", function (socket) {
    console.log("User made socket connection "+ socket.id);

    /*socket.on('user-join', function(data){
        //Send message to everyone
        this.username = data;
        io.sockets.emit('user-join', data);
        console.log(data);
     });*/

    socket.on('chat-message', function(data){
        //Send message to everyone
        io.emit('chat-message', data);
        console.log(data);
     });
}); 