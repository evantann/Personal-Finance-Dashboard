const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require("bcrypt")

router.route('/')
.get((req, res) => {
  res.render('index')
})

.post( async (req, res) => {
  const { email, password } = req.body
  try {
    const results = await db.promise().query(`SELECT email, password, access_token FROM users WHERE email = '${email}' LIMIT 1`)
    if (results[0].length != 1) {
      return res.status(401).json({ msg: 'Invalid email.' })
    }
    const { password: hash } = results[0][0] // destruct password attribute from results[0][0] and assigned to hash variable
    const { access_token : access_token} = results[0][0]
    const isValid = await bcrypt.compare(password, hash)
    if (isValid) {
      res.render('account', { access_token })
    } else {
      res.status(401).json({ error: 'Invalid password.' })
    }
  } catch (error) {
    res.status(500).json({ msg: 'Internal Server Error' })
  }
})

router.route('/signup')
.get((req, res) => {
  res.render('signup')
})
.post( async (req, res) => {
  const { email, password } = req.body // destructures req.body; assigns email and password attributes in req.body to email and password variable
  if (!email || !password) {
    return res.status(400).send({ error: 'Email and password are required.' })
  }
  try {
    const existingUser = await db.promise().query(`SELECT * FROM users WHERE email = '${email}'`)
    if (existingUser.length > 0) {
       return res.status(409).send({ msg: 'User already exists.' })
    }
    const hash = await bcrypt.hash(password, 10) // generates salt and hash
    await db.promise().query(`INSERT INTO users VALUES('${email}', '${hash}')`)
    res.status(201).send({ msg: 'Created User' })
  } catch (err) {
    res.status(500).send({ msg: 'Internal Server Errror'})
  }
})

module.exports = router