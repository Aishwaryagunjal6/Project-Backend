// require(dotenv).config({path:'./env'}   this is not a good practice, hence the other approach is used

import dontenv from 'dotenv'
import connectDB from './db/db.js'

dontenv.config({ path: './env' })

//first approach to connect database to the project
/*
import express from 'express'
const app = express()

(async()=>{
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error)=>{
      console.log("ERROR: ", error)
      throw error
    })

    app.listen(process.env.PORT, ()=>{
      console.log(`App is running on port: ${process.env.PORT}`)
    })
  }
  catch(error){
    console.error("ERROR! Failed to fetch data", error)
  }
})()  //database jab be connect karo hamesha async awit aur try catch ka use kro because data fetching requires time hence the code execution should wait until all the data is fetched
  */


//second approach is to import the connectDB function from db.js

connectDB()
.then(()=>{
  AudioParamMap.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server Running on Port: ${process.env.PORT}`)
  })
})  //return promises as connectDB has Async functions
.catch((error)=>{
  console.log("MongoDB connection Failed!!", error)
})

