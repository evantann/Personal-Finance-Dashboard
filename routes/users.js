const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require("bcrypt")

// Users sign in
router.route('/')
.post( async (req, res) => {
  const { email, password } = req.body
  try {
    const results = await db.promise().query(`SELECT email, password, access_token FROM users WHERE email = '${email}' LIMIT 1`)
    if (results[0].length != 1) {
      return res.status(401).json({ msg: 'Invalid email.' })
    }
    const { password: hash } = results[0][0]
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

// New users sign up
router.route('/signup')
.post( async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }
  try {
    const existingUser = await db.promise().query(`SELECT * FROM users WHERE email = '${email}'`)
    if (existingUser[0].length > 0) {
       return res.status(409).json({ msg: 'User already exists.' })
    }
    const hash = await bcrypt.hash(password, 10) // generates salt and hash
    await db.promise().query(`INSERT INTO users(email, password) VALUES('${email}', '${hash}')`)
    const results = await db.promise().query(`SELECT userid from users WHERE email = '${email}'`)
    const {userid : user_id} = results[0][0]
    res.render('link', { user_id })
  } catch (err) {
    res.status(500).json({ msg: 'Internal Server Errror'})
  }
})


module.exports = router