const controller = {}

controller.post = (request, response) => {
	request.session.destroy((err) => {
	  console.log('logged out')
	})
	response.redirect('/')
}

export default controller
