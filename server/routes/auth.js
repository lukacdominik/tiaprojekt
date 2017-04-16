const auth = {}

auth.loggedIn = (request, response, next) => {
	if (request.session && request.session.username)
		return next()
	return response.redirect('/')
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

export default auth
