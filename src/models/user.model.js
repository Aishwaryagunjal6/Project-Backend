import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username:{
      type:String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true    // used to opptimise the searching of data

    },
    email:{
      type:String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    fullname:{
      type:String,
      required: true,
      trim: true,
      index:true
    },
    avatar:{
      type: String,   //cloudinary url
      required:true
    },
    coverImage:{
      type: String
    },
    watchHistory:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
      }
    ],    
    password:{
      type:String,
      required:[true, 'Password is required']
    },
    refreshToken:{
      type:String
    }
    
 }, {timestamps: true}
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){ return next()  }  //return if password is not modified
    
    this.password = await bcrypt.hash(this.password, 10)
    next()   //save the password only if it is modified

})// the pre hook is used on the 'save' event, hence the hook gets executed before data gets saved

//using k=mongoose we can design our own cutsom methods also like isModified is an inbuilt methos but we can design isPassword method by our own

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)   //returns value true or false
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
} 


userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
} 

export const User = mongoose.model("User", userSchema)