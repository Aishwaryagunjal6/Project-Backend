import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js"

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

export {registerUser}
