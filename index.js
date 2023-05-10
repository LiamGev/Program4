require('dotenv').config();
const express = require('express');
const { restart } = require('nodemon');
const app = express();
const port = process.env.PORT || 3000;
const dbConnection = require("./database/dbConnection");
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/user-routes');
const mealRouter = require('./src/routes/meal-routes')
const authRouter = require('./src/routes/authentication.routes')
const logger = require("./src/config/config").logger;


app.use(bodyParser.json());

app.use('/api', userRouter, mealRouter, authRouter)

//Log all requests
app.all('*', (req, res, next) => {
	const method = req.method;
	logger.debug(`Method ${method} is aangeroepen`);
	next();
});

//All valid routes
app.use(userRouter);
app.use(mealRouter);
app.use(authRouter);

//All unvalid routes
app.all('*', (req, res) => {
	res.status(404).json({
		status: 404,
		result: 'End-point not found',
	});
});

//Error Handling
app.use((err, req, res, next) => {
	logger.debug('Error handler called.');
	res.status(err.status).json(err);
});

//Start server
app.listen(port, () => {
	logger.debug(`Example app listening on port ${port}`);
});

//SIGN IN
process.on('SIGINT', () => {
	logger.debug('SIGINT signal received: closing HTTP server');
	dbConnection.end((err) => {
		logger.debug('Database connection closed');
	});
	app.close(() => {
		logger.debug('HTTP server closed');
	});
});

module.exports = app;

