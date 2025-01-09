import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))

app.use(cookieParser())

//Routes
import userRouter from './routes/user.routes.js'

//routes declaration
//as routers are separated into other files you cannot use app.get directly for routing here you have to implement a middleware using app.use()

app.use("/api/v1/users", userRouter)   
//from above router the route will be generated as "http://localhost:3000/api/v1/users/register"

export { app }