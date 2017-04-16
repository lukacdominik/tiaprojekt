import express from 'express'

import userController from './controllers/userController'
import signupController from './controllers/signupController'
import loginController from './controllers/loginController'
import logoutController from './controllers/logoutController'
import recordController from './controllers/recordController'
import auth from './auth'

const router = express.Router()

router.post('/login', auth.notLoggedIn, loginController.post)
router.post('/signup', auth.notLoggedIn, signupController.post)
router.post('/logout', auth.loggedIn, logoutController.post)
router.post('/record', auth.loggedIn, recordController.post)
router.post('/recordFull', auth.loggedIn, recordController.postFull)

router.get('/user/:username/info/', userController.getInfoJson)
router.get('/user/:username/friends/', userController.getFriendsJson)
router.get('/user/:username/views/', auth.user, userController.getViewsJson)

export default router
