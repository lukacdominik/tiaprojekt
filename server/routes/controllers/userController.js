const DEFAULT_LIMIT = 20

const controller = {}

controller.getInfo = (request, response, done) => {
	const { username } = request.params
	const query = 'SELECT `username`, `email` FROM `users` WHERE `username` = ?'
	const values = [username]

	request.db.query(query, values, done)
}

controller.getInfoJson = (request, response) => {
	controller.getInfo(request, response, (queryResult) => {
		if (queryResult.length === 0) {
			return response.status(400).json({
				error: 'Invalid resource specified',
			})
		}
		return response.status(200).json(queryResult)
	})
}

controller.getFriends = (request, response, done) => {
	const { username } = request.params
	const query = '\
	SELECT `users`.`username` \
	FROM `friendships` AS `f1` \
	INNER JOIN `friendships` AS `f2` ON `f1`.`user1_id` = `f2`.`user2_id` AND `f1`.`user2_id` = `f2`.`user1_id` \
	INNER JOIN `users` ON `f1`.`user2_id` = `users`.`id` \
	WHERE `f1`.`user1_id` = ( SELECT `id` FROM `users` WHERE `username` = ? )'
	const values = [username]

	request.db.query(query, values, done)
}

controller.getPendingFriendRequests = (request, response, done) => {
	const { username } = request.params
	const query = '\
	SELECT `users`.`username` \
	FROM `friendships` AS `f3` \
	INNER JOIN `users` ON `f3`.`user1_id` = `users`.`id` \
	WHERE `f3`.`user2_id` = ( SELECT `id` FROM `users` WHERE `username` = ? ) \
	AND `f3`.`user1_id` NOT IN ( SELECT `f1`.`user1_id` \
		FROM `friendships` AS `f1` \
		INNER JOIN `friendships` AS `f2` ON `f1`.`user1_id` = `f2`.`user2_id` AND `f1`.`user2_id` = `f2`.`user1_id` \
		INNER JOIN `users` ON `f1`.`user1_id` = `users`.`id` \
		WHERE `f1`.`user2_id` = ( SELECT `id` FROM `users` WHERE `username` = ? ) \
	)'
	const values = [username, username]

	request.db.query(query, values, done)
}

controller.getFriendsJson = (request, response) => {
	controller.getFriends(request, response, (queryResult) => response.status(200).json(queryResult))
}

controller.getViews = (request, response, done) => {
	let { username } = request.params
	let { page, limit } = request.query
	page = page | 0
	limit = typeof(limit) === 'undefined' ? DEFAULT_LIMIT : (limit | 0)
	const query = '\
	SELECT \
		`user_records`.`timestamp` AS `record_timestamp`, \
		`user_records`.`duration` AS `record_duration`, \
		`videos`.`yt_video_id` AS `yt_video_id`, \
		`videos`.`name` AS `video_name`, \
		`videos`.`duration` AS `video_duration`, \
		`channels`.`name` AS `channel_name`, \
		`channels`.`yt_channel_id` AS `yt_channel_id` \
	FROM ( \
		SELECT * FROM `records` WHERE `user_id` = ( \
			SELECT `id` FROM `users` WHERE `username` = ? \
		) \
	) AS `user_records` \
	INNER JOIN `videos` ON `user_records`.`video_id` = `videos`.`id` \
	INNER JOIN `channels` ON `channel_id` = `channels`.`id` \
	ORDER BY `record_timestamp` DESC \
	LIMIT ?, ?'
	const values = [username, page*limit, limit]

	request.db.query(query, values, done)
}

controller.getViewsJson = (request, response) => {
	controller.getViews(request, response, (queryResult) => response.status(200).json(queryResult))
}

export default controller
