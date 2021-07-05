const express = require('express');
var bodyParser = require('body-parser');
var path = require("path");
var helmet = require('helmet');
const database = require("./database");
//const formidable = require('formidable');
const app = express();
const multer = require("multer");
const upload = multer({dest:"database/files"});

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


path = require('path');

// Database setup
const db = new database.DatabaseWorker();

app.get('/', function(req, res) {
    res.send('Server is up');
});

app.post('/query', async function(req, res) {
    const param = JSON.parse(req.body.query) || {};
    console.log(param);
    const results = await db.Find(param.query || {});
    res.send(results);
});

app.post('/form-post', upload.single("upload-file"), async (req, res) => {
    const rawData = req.body; // <-- Form data
    await db.Create(rawData, req.file);
    res.send(req.body);
});

app.listen(3000, function() {
    console.log('Listening on 3000');
});

// 9932f3d42a1a320d320a7849b962f3bfa5feab7f92b6c06de831894aad722705