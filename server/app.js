import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import hbs from 'express-handlebars'
import validator from 'express-validator'
import session from 'express-session'

import webClientRouter from './routes/webclient-router'
import apiRouter from './routes/api-router'
import setupMySQL from './middleware/mysql'

dotenv.config()

const app = express()

// view engine setup
app.engine('hbs', hbs({
	extname: 'hbs',
	defaultLayout: 'layout',
	layoutsDir: path.join(__dirname, 'views/layouts/'),
	partialsDir: path.join(__dirname, 'views/partials/')
}))
app.set('views', path.join(__dirname, 'views/'))
app.set('view engine', 'hbs')

// middleware goes here
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(validator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: false,
	resave: false,
	//store: sessionStore,	// TODO use express-mysql-session as a session store instead of memory
}))
// My middleware
app.use(setupMySQL)
// routing
app.use('/', webClientRouter)
app.use('/api', apiRouter)
// 404
app.use((request, response, next) => {
	response.status(404);
	response.format({
		html: () => {
			response.render('404', { url: request.url })
		},
		json: () => {
			response.json({ error: 'Not found' })
		},
		default: () => {
			response.type('txt').send('Not found')
		}
	})
})
// error handling
app.use((error, request, response, next) => {
  response.status(error.status || 500);
  response.render('500', { error });
});

export default app
