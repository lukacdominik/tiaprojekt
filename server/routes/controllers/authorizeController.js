import uuidV4 from 'uuid/v4'

const controller = {}

controller.get = (request, response) => {
	const { client_id, redirect_uri } = request.query

	if (typeof client_id === 'undefined' || typeof redirect_uri === 'undefined') {
		return response.render('auth-dialog-error', {
			error: 'You must include a valid client_id and redirect_uri parameters',
		})
	}
	const firstSeparator = (redirect_uri.indexOf('?') === -1 ? '?' : '&')

	const query = 'SELECT * FROM `apps` WHERE `client_id` = ?'
	const values = [client_id]
	request.db.query(query, values, (queryResult) => {
		if (queryResult.length === 0
		 || (queryResult[0].redirect_uri !== '<any>' && queryResult[0].redirect_uri !== redirect_uri)) {
			return response.render('auth-dialog-error', {
				error: 'You must include a valid client_id and redirect_uri parameters',
			})
		}
		const {name, website} = queryResult[0]
		request.session.appAuth = { client_id, redirect_uri }
		response.render('auth-dialog', {
			app: {
				name,
				website,
				cancel_uri: redirect_uri + firstSeparator + 'cancel=true'
			},
			session_username: request.session.username,
			session_email: request.session.email,
		})
	})
}

controller.post = (request, response) => {
	const { client_id, redirect_uri } = request.session.appAuth

	request.session.appAuth = {}
	if (typeof client_id === 'undefined' || typeof redirect_uri === 'undefined') {
		return response.render('auth-dialog-error', {
			error: 'You must include a valid client_id and redirect_uri parameters',
		})
	}
	const firstSeparator = (redirect_uri.indexOf('?') === -1 ? '?' : '&')

	const query = 'SELECT * FROM `apps` WHERE `client_id` = ?'
	const values = [client_id]
	request.db.query(query, values, (queryResult) => {
		if (queryResult.length === 0
		 || (queryResult[0].redirect_uri !== '<any>' && queryResult[0].redirect_uri !== redirect_uri)) {
			return response.render('auth-dialog-error', {
				error: 'You must include a valid client_id and redirect_uri parameters',
			})
		}
		// get token
		const query = '\
		SELECT \
			`t`.`token` AS `token` \
		FROM `tokens` AS `t` \
		INNER JOIN `users` AS `u` ON `t`.`user_id` = `u`.`id` \
		INNER JOIN `apps` AS `a` ON `t`.`app_id` = `a`.`id` \
		WHERE \
			`a`.`client_id` = ? \
			AND `u`.`username` = ?'
		const values = [client_id, request.session.username]
		request.db.query(query, values, (queryResult) => {
			if (queryResult.length === 0) {
				// no token registered, create one, then return it
				const token = uuidV4()
				const query = '\
				INSERT INTO `tokens` (`token`, `user_id`, `app_id`) \
				VALUES (?, \
					(SELECT `id` FROM `users` WHERE `username` = ?), \
					(SELECT `id` FROM `apps` WHERE `client_id` = ?) \
				)'
				const values = [token, request.session.username, client_id]
				request.db.query(query, values, (queryResult) => {
					response.redirect(redirect_uri + firstSeparator + `token=${encodeURIComponent(token)}`)
				})
				return
			}
			const token = queryResult[0].token
			response.redirect(redirect_uri + firstSeparator + `token=${encodeURIComponent(token)}`)
		})
	})
}

export default controller
