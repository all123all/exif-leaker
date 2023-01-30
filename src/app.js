import express, { response } from "express"
import path from "path"
import multer from "multer";
import ExifReader from "exifreader";
import fs from "fs";
import cors from "cors";
import mime from "mime-types"
// const filePath = './tmp/1.jpg'
var filePath
const __dirname = path.resolve();
const app = express()
app.use(express.json())
app.use(cors())

const storage = multer.diskStorage({
  destination : (req, file, cb) => {
    cb(null, 'tmp')
  },
  filename : (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const getFileInfo = async (pathToTheFile) => {
  try {
    const tags = await ExifReader.load(pathToTheFile)
    return tags
  } catch (error) {
    console.error(error)
  }
}

const upload = multer({storage: storage})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname ,'view','index.html'))
})

app.post('/upload', upload.single('image'), async (req, res) => {
  try{
    if(!req.file) throw new Error('No file provided.')
    const fileType = mime.lookup(req.file.originalname)
    if(!['image/jpeg', 'image/tiff', 'image/png', 'image/heic', 'image/webp'].includes(fileType)){
      throw new Error("Invalid picture type. Only  JPEG, TIFF, PNG, HEIC, and WebP allowed.")
    }
    filePath = 'tmp/' + req.file.filename
    const data = await getFileInfo(filePath)
    console.log('test: ', data)
    res.status(200).send(data)
  }catch(err){
    console.error(err)
    res.status(400).send(err.message)
  }
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Ocorreu um erro no servidor.');
});

export default app
