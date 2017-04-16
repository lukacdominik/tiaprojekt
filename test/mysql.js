import mysql from 'mysql'

const test = (id) => {
	const connection = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	})
	connection.connect((err) => {
		if(err) {
			console.error('error connecting:', err.stack)
			return
		}
		console.log('connected as id:', connection.threadId)
	})
	connection.query('SELECT 1+1 AS solution', (err, res, fields) => {
		if (err) throw(err)
		console.log('The solution is:', res[0].solution)
	})
	connection.query('SELECT ?? FROM ?? WHERE id = ?', ['username', 'users', id], (err, res, fields) => {
		if (err) throw(err)
		console.log('My name is:', res[0].username)
	})
	connection.end((err) => {
		if (err) console.error('mysql error while terminating connection:', err)
	})
}

export default test
