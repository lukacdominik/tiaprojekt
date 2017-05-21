import express from 'express'
import moment from 'moment'

import userController from './controllers/userController'
import auth from './auth'

import {parseDurationFromSeconds} from '../helpers'

const router = express.Router()
moment().format()

router.get(['/', '/login'], auth.notLoggedIn, (request, response, next) => {
	response.render('index', {
		loginpage: true,
		title: 'Log in',
		success: request.session.success,
		errors: request.session.errors,
		next: request.query.next ? '?next=' + encodeURIComponent(request.query.next) : '',
		retryValues: request.session.retryValues || {}
	})
	request.session.errors = null
	request.session.success = false
	request.session.retryValues = {}
})

router.get('/join', (request, response, next) => {
	response.render('index', {
		loginpage: false,
		title: 'Join',
		success: request.session.success,
		errors: request.session.errors,
		retryValues: request.session.retryValues || {}
	})
	request.session.errors = null
	request.session.success = false
	request.session.retryValues = {}
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
			userController.getPendingFriendRequests(request, response, (queryResult) => {
				const pendingFriendRequests = queryResult
				const friendRequestPending = !!request.session.username && queryResult.some((elem, idx, arr) => {
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
						friendRequestPending,
						pendingFriendRequests,
						records: onMyPage || alreadyFriends ? queryResult : [],
						helpers: {
							fromNow: (date) => moment(date).fromNow(),
							parseDurationFromSeconds,
						}
					})
				})
			})
		})
	})
})

router.get('/addFriend/:friendUsername', auth.loggedInDontRedirect, (request, response, next) => {
	let { friendUsername } = request.params
	request.db.query('SELECT `id` FROM `users` WHERE `username` = ?', [friendUsername], (queryResult) => {
		if (queryResult.length === 0) {
			return response.status(400).json({
				status: 400,
				error: 'You have to provide valid username'
			})
		}
		const user2_id = queryResult[0].id
		request.db.query('SELECT `id` FROM `users` WHERE `username` = ?', [request.session.username], (queryResult) => {
			if (queryResult.length === 0) {
				return response.status(500).end()
			}
			const user1_id = queryResult[0].id
			request.db.query('SELECT `id` FROM `friendships` WHERE `user1_id` = ? AND `user2_id` = ?', [user1_id, user2_id], (queryResult) => {
				if (queryResult.length > 0) {
					return response.status(403).json({
						status: 403,
						error: 'Friendship already created'
					})
				}
				request.db.query('INSERT INTO `friendships` (`user1_id`, `user2_id`) VALUES (?, ?)', [user1_id, user2_id], (queryResult) => {
					response.status(200).json({friendUsername})
				})
			})
		})
	})
})

export default router
