const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const request = require('request');
const amqplib = require('amqplib/callback_api');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const directory = __dirname + '/documents/';

app.use(fileUpload());
app.use(bodyParser());
app.use('/data', express.static('data'));

app.post('/upload', (req, res) => {
    const routeKey = req.headers['X-ROUTING-KEY'];
    console.log(req);
    // const fileName = req.files.file.name;
    // const totalSize = req.files.file.size;

    // req.files.file.mv(directory + fileName, (err) => {
    //     if (err) {
    //         return res.status(500).send(err);
    //     }
    //     compress(fileName);
    //     res.json({ status : "file has been compressed"});
    // });
    // res.json({ status : "file has been successfully uploaded and compressed"});
});

function compress(fileName) {
    var archive = archiver('zip', {
        zlib: { level: 9 }
    });
    var output = fs.createWriteStream(location + fileName + '.zip');
    var input = fs.createReadStream(location + fileName);

    archive.pipe(output);
    archive.append(input, { name: fileName });
    archive.finalize();
}

app.listen(8000, function() {
	console.log('App listening on port 8000!')
});
