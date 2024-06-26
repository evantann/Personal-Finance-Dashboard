const express = require('express')
const app = express()
const session = require('express-session')
const userRouter = require("./routes/user")
const transactionRouter = require("./routes/transaction")
const tokenRouter = require("./routes/token")
const dotenv = require('dotenv')

dotenv.config()

app.set("view engine", "ejs")

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.userId = req.session.user_id || "";
    next();
});

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/user", userRouter)
app.use("/transaction", transactionRouter)
app.use("/token", tokenRouter)
app.use(express.static("public"))

app.listen(8080, () => {
    console.log('View your financial dashboard at http://localhost:8080')
})