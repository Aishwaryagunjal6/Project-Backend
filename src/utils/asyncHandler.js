//given is the first approach used for handeling wrapper functions using promises.

const asyncHandler = (fun)=> {
  return (req, res, next)=>{
    Promise.resolve(fun(req, res, next)).catch((err)=>next(err))
  }
}

export { asyncHandler }


//the given is another approach of wrapper functions using try catch method which you can use instead of using promises

// const asyncHandler = (fn)=> {
//   async (req, res, next)=> {
//     try{
//       await fn(req, res, next)
//     }
//     catch(err){
//       res.status(err.code || 500).json({
//         success: false,
//         message: err.message
//       })
//     }
//   }
// }


// asyncHandler is a higher-order function.
// It takes a single argument requestHandler, which is expected to be an asynchronous function (such as an Express route handler).