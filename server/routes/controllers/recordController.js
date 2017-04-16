const controller = {}

controller.post = (request, response) => {
	const { videoUrl } = request.body
	request.db.query('SELECT `id` FROM `videos` WHERE url = ?', [videoUrl], (queryResult) => {
		if (queryResult.length === 0) {
			request.session.videoUrlToAdd = videoUrl
			return response.redirect('/addVideo')
		}
		const video_id = queryResult[0].id
		request.db.query('SELECT `id` FROM `users` WHERE `username` = ?', [request.session.username], (queryResult) => {
			if (queryResult.length === 0) {
				return reponse.status(500).end() // TODO zistit co sa ma tuto diat v skutocnosti
			}
			const user_id = queryResult[0].id
			request.db.query('INSERT INTO `records` (`video_id`, `user_id`) VALUES (?, ?)', [video_id, user_id], (queryResult) => {
				return response.redirect('/profile')
			})
		})
	})
}

controller.postFull = (request, response) => {
	const { videoUrl, channelName, videoName } = request.body

	request.db.query('SELECT `id` FROM `channels` WHERE `name` = ?', [channelName], (queryResult) => {
		const createVideo = (channel_id) => {
			request.db.query('SELECT `id` FROM `videos` WHERE `url` = ?', [videoUrl], (queryResult) => {
				const createRecord = (video_id) => {
					request.db.query('SELECT `id` FROM `users` WHERE `username` = ?', [request.session.username], (queryResult) => {
						if (queryResult.length === 0) {
							return reponse.status(500).end() // TODO zistit co sa ma tuto diat v skutocnosti
						}
						const user_id = queryResult[0].id
						request.db.query('INSERT INTO `records` (`user_id`, `video_id`) VALUES (?, ?)', [user_id, video_id], (queryResult) => {
							return response.redirect('/profile')
						})
					})
				}
				if (queryResult.length === 0) {
					return request.db.query('INSERT INTO `videos` (`channel_id`, `url`, `name`) VALUES (?, ?, ?)', [channel_id, videoUrl, videoName], (queryResult) => {
						createRecord(queryResult.insertId)
					})
				}
				createRecord(queryResult[0].id)
			})
		}
		if (queryResult.length === 0) {
			return request.db.query('INSERT INTO `channels` (`name`) VALUES (?)', [channelName], (queryResult) => {
				createVideo(queryResult.insertId)
			})
		}
		createVideo(queryResult[0].id)
	})
}

export default controller
