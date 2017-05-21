import express from 'express'

import authorizeController from './controllers/authorizeController'
import userController from './controllers/userController'
import signupController from './controllers/signupController'
import loginController from './controllers/loginController'
import logoutController from './controllers/logoutController'
import recordController from './controllers/recordController'
import auth from './auth'

const router = express.Router()

router.get('/authorize', auth.loggedIn, authorizeController.get)
router.post('/authorize', auth.loggedIn, authorizeController.post)
router.post('/login', auth.notLoggedIn, loginController.post)
router.post('/signup', auth.notLoggedIn, signupController.post)
router.post('/logout', auth.loggedIn, logoutController.post)

router.get('/record', auth.token, recordController.get)

router.get('/user/:username/info/', userController.getInfoJson)
router.get('/user/:username/friends/', userController.getFriendsJson)
router.get('/user/:username/views/', auth.user, userController.getViewsJson)

export default router
