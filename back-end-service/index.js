const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const request = require('request');
const amqplib = require('amqplib/callback_api');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const directory = __dirname + '/documents/';
let channel = null;

app.use(fileUpload());
app.use(bodyParser());
app.use('/data', express.static('data'));

app.post('/upload', (req, res) => {
    const routeKey = req.headers['x-routing-key'];
    console.log(routeKey);
    console.log(req.files);
    const fileName = req.files.file.name;
    const totalSize = req.files.file.size;

    req.files.file.mv(directory + fileName, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        compress(fileName, totalSize, (response) => {
            publishCompression(response, routeKey);
        });
        // res.json({ status : "file has been compressed"});
    });
    res.json({ status : "file has been successfully uploaded and compressed"});
});

function publishCompression(msg, routeKey) {
    const npm = "1506730382";
    channel.assertExchange(npm, "direct", {durable : false});
    channel.publish(npm, routeKey, Buffer.from(JSON.stringify(msg)));
}

function compress(fileName, fileSize, callback) {
    setTimeout(() => {
        var archive = archiver('zip', {
            zlib: { level: 9 }
        });
        var output = fs.createWriteStream(directory + fileName + '.zip');
        var input = fs.createReadStream(directory + fileName);
        var percentage = 10;
        archive.on("data", (chunk) => {
            if ((archive.pointer() / fileSize) * 100 >= percentage) { // kalau bermasalah, hapus () diantara pembagiannya
                // callback({
                //     status: "compressing...",
                //     description: percentage
                // });
                console.log("Progress : " + percentage);
                callback({
                    status: "compressing",
                    percent: percentage
                });
                percentage += 10;
            }
        });

        archive.on("end", (err) => {
            if (err) {
                console.log(err);
            } else {
                // return callback({
                //     status : "compression done"
                // });
                return callback({
                    status: "done"
                });
            }
        });

        archive.pipe(output);
        archive.append(input, { name: fileName });
        archive.finalize();
    }, 1000);
}

amqplib.connect({
    protocol : "amqp",
    hostname : "152.118.148.103",
    port : "5672",
    username : "1506730382",
    password : "288251",
    vhost : "1506730382"
}, (err, conn) => {
    if (err) {
        return console.log("issue with the websocket on AMQP connect");
    } else {
        conn.createChannel((err, ch) => {
            if (err) {
                return console.log("problem with the websocket on channel creation");
            }
            channel = ch;
            app.listen(8001, function() {
                console.log('App listening on port 8001!')
            });
        })
    }
})



