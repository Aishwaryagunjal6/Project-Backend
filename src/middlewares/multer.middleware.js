import multer from 'multer'


//we are using multers diskstorage here, you can easily find the code inside the npm documentation of multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })
