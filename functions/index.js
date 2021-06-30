const express = require('express');
var bodyParser = require('body-parser');
var path = require("path");
var helmet = require('helmet');
const database = require("./database");
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());

path = require('path');

// Database setup
const db = new database.DatabaseWorker();

app.get('/', function(req, res) {
    res.send('Server is up');
});

app.get('/query', async function(req, res) {
    const results = await db.Find({
        name:"joel"
    }, "STRICT",0,1);
    res.send(results);
});

app.post('/form-post' , async (req , res) => {
    const rawData = req.body; // <-- Form data
    await db.Create(rawData);
    res.send(req.body);
})
  
app.listen(3000, function() {
    console.log('Listening on 3000');
});