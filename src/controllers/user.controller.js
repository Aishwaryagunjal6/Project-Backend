import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js"


//method to generate the access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) =>{
  try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //now we have to add the refreshtoken into the users object inside db
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})  //refreshToken is saved into the database

    return {accessToken, refreshToken} 

  }catch(error){
    throw new ApiError(500, "Something went wrong while generating Tokens")
  }
}

const registerUser = asyncHandler(async (req, res)=>{
  //get user details from frontend
  //apply validations on the details
  //check if user already exists
  //check for images and check for avatar
  //upload them to cloudinary
  //create user object- create entry in DB
  //remove password and response toekn field from the response
  //check for user creation and return response

  const {fullname, email, username, password} = req.body
  // console.log("email: ",email)

  // if(fullname === ""){
  //   throw new ApiError(400, "Fullname is required")
  // }
  // above is the code to check whether the fullname is empty or not. but to check this for all the fields we will require to wtite lots of code hence we use the given method which takes array of fields and checks if any field is empty or not

  if([fullname, email, username, password].some((field)=>{
    field?.trim() === ""  //checks if any field is empty, if so it returns true
  })){
      throw new ApiError(400, "All fields are required.")
  }

  //check for user already exists or not
  const existedUser = await User.findOne({
    $or: [{username}, {email}]  //check for if atleast the username or email exists
  })

  if(existedUser){
    throw new ApiError(409, "Username or Email already exists")
  }

  //check for coverImage and avatar images
  //as we have used upload middleware inside the routes ehile accessing the imagefiles, the multer gives us file access also thus we can use req.files

  const avatarLocalPath = req.files?.avatar[0]?.path
  // const coverImageLocalPath = req.files?.coverImage[0]?.path   //this line gives error when coverImage is not given hence we need to check if coverImage is existing

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required!")
  }

  //upload avatar and coverImage to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400, "Avatar is required!")
  }

  //create a user object and make entry in db

  const user = await User.create({
    fullname,
    avatar: avatar.url,  //pass url of the avatar response sent by cloudinary
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  //check if user created successfully

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"   //the password and refreshToken fields are removed from user object using select method
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while Registering the user")
  }

  //return the response for created user

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully!")
    //new object of ApiResponse method is created to send the response in a structured way
  )

})


const loginUser = asyncHandler(async (req, res )=>{
  //bring data from req.body
  //username or email validation
  //find the user
  //password check if user exists
  //generate access and refresh tokens
  //send cookies

  const {email, username, password} = req.body

  if(!username || !email){
    throw new ApiError(400, "Username or Email is required")
  }

  //now find the user in the database

  const user = await User.findOne({
    $or: [{email}, {username}]
  })

  //check if user not found
  if(!user){
    throw new ApiError(404, "User naot found")
  }

  //check for password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(404, "Invalid User Credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  //now we have generated our accessToken and refreshToken
  //now send them to the server  in the form of cookies

  //but now as the refreshToken is added to the user, we will have to take new reference of the user from database as the earlier refernce 'user' is not having the updated changes

  const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly : true,
    secure : true
  }

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(200, {
      user: loggedinUser, accessToken, refreshToken
    },
    "User Logged in Successfully"
    )
  )

})

const logoutUser = asyncHandler(async (req, res)=>{
  //to logout the user we need to access the username or the email of the user but we cant get it by renderning any form for logout as it would not look great
  //thus we inject our own middleware that we have created 'auth.middleware.js' for the logout purpose

  //after using the auth middleware while running logout, it gives us access to the user into the database using vefification of accesstoken

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken : undefined   //the refresh token is removed from database
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
    new ApiResponse(200, {}, "User Logged Out")
  )

})

export {registerUser, loginUser, logoutUser}
