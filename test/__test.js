import dotenv from 'dotenv'

import test_bcrypt from './bcrypt'
import test_mysql from './mysql'

const test_crypt = test_bcrypt.crypt

dotenv.config()

// test_bcrypt('wrong_password')
// test_mysql(1)
test_crypt('kokot')
