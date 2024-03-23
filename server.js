const express = require('express')
const app = express()
const userRouter = require("./routes/user")
const transactionRouter = require("./routes/transaction")
const tokenRouter = require("./routes/token")

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/user", userRouter)
app.use("/transaction", transactionRouter)
app.use("/token", tokenRouter)
app.use(express.static("public"))

app.listen(8080, () => {
    console.log('View your financial dashboard at http://localhost:8080')
})