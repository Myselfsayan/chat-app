import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import http from "http"

const app = express()
const server = http.createServer(app)

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "4mb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/status", ( req , res ) => res.send("Server is up and running !!!"))
import userRouter from './routes/user.routes.js'

//Routes Declearation
app.use("/api/v1/auth", userRouter)





export {app}