import bcrypt from 'bcrypt'

const saltRounds = 10

const crypt = (pwd) => {
	bcrypt.hash(pwd, saltRounds, (err, hash) => {
		console.log('password is:', pwd)
		console.log('hash is:', hash)
		console.log('hash length is:', hash.length)
	})
}

const test = (someOtherPlaintextPassword) => {
	const myPlaintextPassword = 'momo'

	bcrypt.hash(myPlaintextPassword, saltRounds, (err, hash) => {
		console.log('password is:', myPlaintextPassword)
		console.log('hash is:', hash)
		console.log('hash length is:', hash.length)

		// Load hash from your password DB. 
		bcrypt.compare(myPlaintextPassword, hash, (err, res) => {
			console.log(myPlaintextPassword, res)
		})
		bcrypt.compare(someOtherPlaintextPassword, hash, (err, res) => {
			console.log(someOtherPlaintextPassword, res)
		})
	})

}

export default {crypt, test}
