//require path and multer to image upload
import path from "path";
import multer from "multer";

// Image Upload
const storage = multer.diskStorage({
    destination: 'uploads/images', // Destination to store image 
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
        // file.fieldname is name of the field (image), path.extname get the uploaded file extension
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000   // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|avif)$/)) {     // upload only png and jpg format
            return cb(new Error('Please upload a only png and jpg Image'))
        }
        cb(null, true)
    }
})

export default upload;