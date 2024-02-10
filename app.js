const express = require('express');
const bodyParser = require('body-parser');
const cookieparser = require('cookie-parser');
var cors = require('cors');

const app = express();

app.use(cookieparser());

const corsOptions = {
    origin: true, //included origin as true
    credentials: true, //included credentials as true
};

app.use(cors(corsOptions));

app.use(express.json({
    limit: "50mb"
}));

app.use(bodyParser.urlencoded({
    limit : '50mb',
    extended: true
}))

const authRoute = require('./routes/authRoute');
const postRoute = require('./routes/postRoute');
const commentRoute = require('./routes/commentRoute');


app.use("/api",authRoute);
app.use("/api",postRoute);
app.use("/api",commentRoute);


module.exports = app;