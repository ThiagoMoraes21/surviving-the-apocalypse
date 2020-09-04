const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 80;
const app = express();
const cors = require("cors");

// connecting to mongodb database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/trz_backend', { useNewUrlParser: true, useUnifiedTopology: true });

// setup body-parse
app.use(bodyParser.json());

// setup cors policy
app.use(cors());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// requiring routes
require('./routes/survivors')(app);
require('./routes/reports')(app);
require('./routes/inventory')(app);

// handles not found end-points
app.get("*", (req, res) => {
	return res.status(404).json({ message: '404 NOT_FOUND' });
});

// starts server listening at port 80
app.listen(PORT, () => {
	console.log(`Listening on port: ${PORT}`);
});
