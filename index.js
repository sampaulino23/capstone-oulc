const express = require('express')
const bodyparser = require('body-parser')
const handlebars = require('handlebars');
var urlencodedparser = bodyparser.urlencoded({extended:false});

const app = express();

app.set('view engine', handlebars);
app.use(express.static('public'));
app.use(bodyparser.json());

app.use(function(req, res) {
    res.send('OULC Contract Management System');
});

app.listen(process.env.PORT || 3000);