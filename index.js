const express = require('express')
const bodyparser = require('body-parser')
const handlebars = require('handlebars');
var urlencodedparser = bodyparser.urlencoded({extended:false});
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');

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

//Import Routes

const loginRoute = require('./routes/login');
app.use('/', loginRoute);
app.use('/login', loginRoute);


app.listen(process.env.PORT || 3000);