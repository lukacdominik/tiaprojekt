import dotenv from 'dotenv'
import mysql from 'mysql'
import session from 'express-session'

dotenv.config()

const connectionPool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
})

const setupMySQL = (req, res, next) => {
	console.log()
	req.db = {
		pool: connectionPool,
		query: (query, values, done) => {
			connectionPool.getConnection((connError, conn) => {
				if (connError) return console.error('MYSQL ERROR while connecting:', connError.stack)
				const q = conn.query(query, values, (queryError, queryResult, queryFields) => {
					conn.release()
					if (queryError) {
						throw queryError
					}
					console.log(queryResult)
					done(queryResult)
				})
				console.log(q.sql)
			})
		},
	}
	next()
}

export default setupMySQL
