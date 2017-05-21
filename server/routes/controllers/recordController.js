import {
	parseDuration,
	parseVideoId
} from '../../helpers'

require('es6-promise').polyfill();
require('isomorphic-fetch');

const controller = {}

controller.get = (request, response) => {
	const { video_url, duration, timestamp} = request.query
	if (!video_url || !duration || !timestamp) {
		return response.status(400).json({
			status: 400,
			error: 'You must include a valid token, video_url, duration and timestamp parameters',
		})
	}
	const videoId = parseVideoId(video_url)
	if (videoId === null) {
		return response.status(400).json({
			status: 400,
			error: 'Invalid youtube url',
		})
	}
	const token = request.session.token
	delete request.session.token

	request.db.query('SELECT `id` FROM `videos` WHERE `yt_video_id` = ?', [videoId], (queryResult) => {
		const createRecord = (video_id, user_id, timestamp, duration) => {
			let ts = (new Date(timestamp)).getTime() || (new Date()).getTime()
			request.db.query('INSERT INTO `records` (`video_id`, `user_id`, `timestamp`, `duration`) VALUES (?, ?, ?, ?)', [video_id, user_id, ts, duration | 0], (queryResult) => {
				return response.status(200).json({
					status: 200,
				})
			})
		}

		if (queryResult.length === 0) {
			// video not yet in database
			return fetch(
				'https://www.googleapis.com/youtube/v3/videos'
				+ '?id=' + videoId
				+ '&part=' + ['snippet', 'contentDetails'].join('%2C')
				+ '&key=AIzaSyBMUAEw4dJiuMvjqTo3_9FVy7-2SnoFnAM'
			).then((resp) => {
				return resp.json()
			}).then((data) => {
				if (data.items.length === 0) {
					return response.status(400).json({
						status: 400,
						error: 'Video does not exist',
					})
				}
				const channelTitle = data.items[0].snippet.channelTitle
				const channelId = data.items[0].snippet.channelId
				const videoTitle = data.items[0].snippet.title
				const videoDuration = data.items[0].contentDetails.duration
				const videoDurationInSeconds = parseDuration(data.items[0].contentDetails.duration)
				const categoryId = data.items[0].snippet.categoryId

				const createVideoWithCategory = (category_str) => {
					request.db.query('SELECT `id` FROM `channels` WHERE `yt_channel_id` = ?', [channelId], (queryResult) => {
						const createVideo = (channel_id) => {
							return request.db.query('INSERT INTO `videos` (`channel_id`, `yt_video_id`, `name`, `duration`, `category`) VALUES (?, ?, ?, ?, ?)', [channel_id, videoId, videoTitle, videoDurationInSeconds, category_str], (queryResult) => {
								createRecord(queryResult.insertId, token.user_id, timestamp, duration)
							})
						}

						if (queryResult.length === 0) {
							return request.db.query('INSERT INTO `channels` (`name`, `yt_channel_id`) VALUES (?, ?)', [channelTitle, channelId], (queryResult) => {
								createVideo(queryResult.insertId)
							})
						}
						createVideo(queryResult[0].id)
					})
				}

				return fetch(
					'https://www.googleapis.com/youtube/v3/videoCategories'
					+ '?id=' + categoryId
					+ '&part=' + ['snippet'].join('%2C')
					+ '&key=AIzaSyBMUAEw4dJiuMvjqTo3_9FVy7-2SnoFnAM'
				).then((resp) => {
					return resp.json()
				}).then((data) => {
					if (data.items.length === 0) {
						return createVideoWithCategory('unknown')
					}
					return createVideoWithCategory(data.items[0].snippet.title)
				})
			})
		}
		// video is already in database, just insert new record
		createRecord(queryResult[0].id, token.user_id, timestamp, duration)
	})
}

export default controller
