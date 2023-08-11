const express = require('express')
const app = express()
const userRouter = require("./routes/users")
const apiRouter = require("./routes/api")

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/users", userRouter)
app.use("/api", apiRouter)

app.listen(8080)