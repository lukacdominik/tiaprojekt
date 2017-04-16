import express from 'express'
import moment from 'moment'

import userController from './controllers/userController'
import auth from './auth'

const router = express.Router()
moment().format()

router.get('/', auth.notLoggedIn, (request, response, next) => {
	response.render('index', {
		loginpage: true,
		title: 'Log in',
		success: request.session.success,
		errors: request.session.errors,
	})
	request.session.errors = null
	request.session.success = false
})

router.get('/join', (request, response, next) => {
	response.render('index', {
		loginpage: false,
		title: 'Join',
		success: request.session.success,
		errors: request.session.errors
	})
	request.session.errors = null
	request.session.success = false
})

router.get('/profile', auth.loggedIn, (request, response, next) => {
	response.redirect('/user/' + request.session.username)
})

router.get('/lostpassword', (request, response, next) => {
	response.redirect('/')
})

router.get('/user/:username', (request, response, next) => {
	let { username } = request.params
	userController.getInfo(request, response, (queryResult) => {
		if (queryResult.length === 0) {
			return next()
		}
		let {username, email} = queryResult[0]
		let onMyPage = request.session.username === username
		userController.getFriends(request, response, (queryResult) => {
			const friends = queryResult
			const alreadyFriends = !!request.session.username && queryResult.some((elem, idx, arr) => {
				return elem.username === request.session.username
			})
			userController.getViews(request, response, (queryResult) => {
				response.render('user', {
					session_username: request.session && request.session.username,
					session_email: request.session && request.session.email,
					username,
					email,
					onMyPage,
					friends,
					alreadyFriends,
					records: onMyPage || alreadyFriends ? queryResult : [],
					helpers: {
						fromNow: (date) => moment(date).fromNow(),
					}
				})
			})
		})
	})
})

router.get('/addVideo', (request, response, next) => {
	response.render('addVideo', {
		videoUrl: request.session.videoUrlToAdd,
	})
})

export default router
