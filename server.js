const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT

const app = express()
app.use(express.json());

const dir = './uploads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/send-email', upload.single('file'), (req, res) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    let mailOptions = {
        from: req.body.email,
        to: process.env.EMAIL,
        subject: 'New contact form message',
        text: `First Name: ${req.body.firstName}\nLast Name: ${req.body.lastName}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`,
        attachments: [
            {
                path: req.file.path
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('An error occurred.');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent successfully!');
        }
    });
});

app.listen(port, () => {
    console.log(`Contact form script listening on port ${port}`)
});