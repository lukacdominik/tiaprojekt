const auth = {}

auth.loggedIn = (request, response, next) => {
	if (request.session && request.session.username)
		return next()
	return response.redirect('/login?next=' + encodeURIComponent(request.originalUrl))
}

auth.loggedInDontRedirect = (request, response, next) => {
	if (request.session && request.session.username)
		return next()
	return response.status(401).json({
		status: 401,
		error: 'Unauthorized action'
	})
}

auth.user = (request, response, next) => {
	let { username } = request.params
	if (request.session && request.session.username === username)
		return next()
	return response.redirect('/')
}

auth.notLoggedIn = (request, response, next) => {
	if (!request.session || !request.session.username)
		return next()
	return response.redirect('/profile')
}

auth.token = (request, response, next) => {
	if (request.query.token) {
		return request.db.query('SELECT `token`, `user_id` FROM `tokens` WHERE `token` = ?', [request.query.token], (queryResult) => {
			if (queryResult.length === 0) {
				return response.status(401).json({
					status: 401,
					error: 'You need to be authorized to make this request'
				})
			}
			const {token, user_id} = queryResult[0]
			return request.db.query('SELECT `username` FROM `users` WHERE `id` = ?', [user_id], (queryResult) => {
				if (queryResult.length === 0) {
					return response.status(500).json({
						status: 500,
						error: 'Token paired with invalid user id'
					})
				}
				const {username} = queryResult[0]
				request.session.token = {
					token,
					user_id,
					username,
				}
				return next()
			})
		})
	}
	return response.status(401).json({
		status: 401,
		error: 'You need to be authorized to make this request'
	})
}

export default auth
