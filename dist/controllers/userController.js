'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var userController = {};

userController.getInfo = function (request, response) {
	var userid = request.params.userid;

	var query = 'SELECT ?? FROM ?? WHERE id = ?';
	var values = ['username', 'users', userid];

	request.db.query(query, values, function (queryResult) {
		if (queryResult.length === 0) {
			return response.json({
				error: true,
				message: 'Invalid resource specified'
			});
		}
		response.json({
			username: queryResult[0].username
		});
	});
};

userController.getViews = function (request, response) {
	var userid = request.params.userid;

	var query = '\
	SELECT \
	`user_records`.`timestamp` AS record_timestamp, \
    `videos`.`url` AS video_url, \
    `videos`.`name` AS video_name, \
    `videos`.`length` AS video_length, \
    `channels`.`name` AS channel_name, \
    `channels`.`url` AS channel_url \
	FROM (SELECT * FROM `records` WHERE user_id = ?) AS user_records \
	LEFT JOIN `videos` ON user_records.`video_id` = `videos`.`id` \
	LEFT JOIN `channels` ON channel_id = `channels`.`id`';
	var values = [userid];

	request.db.query(query, values, function (queryResult) {
		response.json(queryResult);
	});
};

exports.default = userController;
//# sourceMappingURL=userController.js.map