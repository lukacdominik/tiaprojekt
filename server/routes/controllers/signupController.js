import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

const controller = {}

controller.post = (request, response) => {
	const { username, email, password } = request.body

	request.check('username', 'Username must consist of alphanumeric characters only').isAlphanumeric()
	request.check('username', 'Username must be between 3 and 32 characters long').isLength({min: 3, max: 32})
	request.check('email', 'Email must be a valid email address').isEmail().isLength({max: 128})
	request.check('password', 'Password must be at least 4 characters long').isLength({min: 4})

	const errors = request.validationErrors() || []

	let pendingQueries = 2
	const resolvePendingQueries = () => {
		if (0 === --pendingQueries) {
			if (errors.length > 0) {
				request.session.errors = errors
				request.session.success = false
				return response.redirect('/join')
			}
			bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
				const query = 'INSERT INTO `users` (`email`, `username`, `password`) VALUES (?, ?, ?)'
				const values = [email, username, hash]
				request.db.query(query, values, (queryResult) => {
					request.session.success = true
					response.redirect('/')
				})
			})
		}
	}

	request.db.query('SELECT * FROM `users` WHERE `users`.`username` = ?', [username], (queryResult) => {
		if (queryResult.length > 0) {
			errors.push({
				param: 'username',
				msg: 'Username already registered',
				value: username,
			})
		}
		resolvePendingQueries()
	})

	request.db.query('SELECT * FROM `users` WHERE `users`.`email` = ?', [email], (queryResult) => {
		if (queryResult.length > 0) {
			errors.push({
				param: 'email',
				msg: 'Email already registered',
				value: email,
			})
		}
		resolvePendingQueries()
	})
}

export default controller
