const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const request = require('request');
const urlLocalhost = 'http://localhost:8001';
const urlInfralabs = 'http://1506730382.law.infralabs.cs.ui.ac.id:20256'

app.use(fileUpload());
app.use(cors());
app.use(express.static('template'));

// random string generator, courtesy : https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 40; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

app.post('/upload', (req, res)=>{
    if (req.files.uploadedFile.size > 0) {
        var routeKey = makeid();
        
        var sent = {
            headers : {
                'x-routing-key' : routeKey
            },
            url : urlInfralabs + "/upload", // url docker
            // url : urlLocalhost + "/upload", // url localhost
            formData : {
                file : {
                    value : req.files.uploadedFile.data,
                    options : {
                        filename : req.files.uploadedFile.name,
                        contentType : req.files.uploadedFile.mimetype
                    }
                }
            }
        }

        // console.log('sending...');
        console.log(req.files);

        request.post(sent, (err, response, body) => {
            if (err) {
                console.log(body);
                return res.status(200).send(err);
            }
            console.log(body);
            console.log('file uploaded');
            // res.redirect('/success.html');
            res.redirect('/?key=' + routeKey);
        });
    } else {
        return res.status(400).send('please input the file to be uploaded');
    }
});

app.listen(3001, function() {
	console.log('App listening on port 3001!')
});
