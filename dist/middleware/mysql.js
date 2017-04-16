'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

var connectionPool = _mysql2.default.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	timezone: 'utc'
});

var setupMySQL = function setupMySQL(req, res, next) {
	req.db = {
		pool: connectionPool,
		query: function query(_query, values, done) {
			connectionPool.getConnection(function (connError, conn) {
				if (connError) return console.error('MYSQL ERROR while connecting:', connError.stack);
				var q = conn.query(_query, values, function (queryError, queryResult, queryFields) {
					conn.release();
					if (queryError) throw queryError;
					console.log(queryResult);
					done(queryResult);
				});
				console.log(q.sql);
			});
		}
	};
	next();
};

exports.default = setupMySQL;
//# sourceMappingURL=mysql.js.map