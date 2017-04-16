const DEFAULT_LIMIT = 20

const controller = {}

controller.getInfo = (request, response, done) => {
	const { username } = request.params
	const query = 'SELECT `username`, `email` FROM `users` WHERE username = ?'
	const values = [username]

	request.db.query(query, values, done)
}

controller.getInfoJson = (request, response) => {
	controller.getInfo(request, response, (queryResult) => {
		if (queryResult.length === 0) {
			return response.json({
				error: 'Invalid resource specified',
			})
		}
		response.json(queryResult)
	})
}

controller.getFriends = (request, response, done) => {
	const { username } = request.params
	const query = '\
SELECT `users`.`username` \
FROM `friendships` AS f1 \
INNER JOIN `friendships` AS f2 ON `f1`.`user1_id` = `f2`.`user2_id` AND `f1`.`user2_id` = `f2`.`user1_id` \
INNER JOIN `users` ON `f1`.`user2_id` = `users`.`id` \
WHERE `f1`.`user1_id` = ( SELECT `id` FROM `users` WHERE `username` = ? )'
	const values = [username]

	request.db.query(query, values, done)
}

controller.getFriendsJson = (request, response) => {
	controller.getFriends(request, response, (queryResult) => response.json(queryResult))
}

controller.getViews = (request, response, done) => {
	let { username } = request.params
	let { page, limit } = request.query
	page = page | 0
	limit = typeof(limit) === 'undefined' ? DEFAULT_LIMIT : (limit | 0)
	const query = '\
SELECT \
	`user_records`.`timestamp` AS record_timestamp, \
	`videos`.`url` AS video_url, \
	`videos`.`name` AS video_name, \
	`videos`.`length` AS video_length, \
	`channels`.`name` AS channel_name, \
	`channels`.`url` AS channel_url \
FROM ( \
	SELECT * FROM `records` WHERE `user_id` = ( \
		SELECT `id` FROM `users` WHERE `username` = ? \
	) \
) AS user_records \
INNER JOIN `videos` ON `user_records`.`video_id` = `videos`.`id` \
INNER JOIN `channels` ON `channel_id` = `channels`.`id` \
ORDER BY `record_timestamp` DESC \
LIMIT ?, ?'
	const values = [username, page*limit, limit]

	request.db.query(query, values, done)
}

controller.getViewsJson = (request, response) => {
	controller.getViews(request, response, (queryResult) => response.json(queryResult))
}

export default controller
