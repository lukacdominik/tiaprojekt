import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

const controller = {}

controller.post = (request, response) => {
	const { emailOrUsername, password } = request.body
	const errors = []

	const handleCredentialError = () => {
		errors.push({
			param: 'emailOrUsername',
			msg: 'Incorrect e-mail/username or password.',
			value: emailOrUsername,
		})
		request.session.errors = errors
		request.session.success = false
		response.redirect('/')
	}

	request.db.query('SELECT `username`, `email`, `password` FROM `users` WHERE `users`.`username` = ? OR `users`.`email` = ?', [emailOrUsername, emailOrUsername], (queryResult) => {
		if (queryResult.length === 0) {
			return handleCredentialError()
		}
		bcrypt.compare(password, queryResult[0].password, (err, res) => {
			if (!res) {
				return handleCredentialError()
			}
			request.session.username = queryResult[0].username
			request.session.email = queryResult[0].email
			response.redirect('/user/' + request.session.username)
		})
	})
}

export default controller
