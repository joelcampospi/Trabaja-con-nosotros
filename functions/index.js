const express = require('express');
const crypto = require("crypto");
var bodyParser = require('body-parser');
var path = require("path");
var helmet = require('helmet');
const database = require("./database");
const fs = require("fs");
const app = express();
const multer = require("multer");
const { fstat } = require('fs');
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
    if(!(await isAuthorised(req.body.sess))) res.send({response:"401"});
    const param = JSON.parse(req.body.query) || {};
    const results = await db.Find(param.query || {}, param.method || "STRICT", param.start || 0, param.limit || -1);
    res.send(results);
});

app.post('/form-post', upload.single("upload-file"), async (req, res) => {
    const rawData = req.body; // <-- Form data
    await db.Create(rawData, req.file);
    res.send("OK");
});

app.post('/action', async (req, res) => {
    const rawData = JSON.parse(req.body.data); // <-- Data
    if(!(await isAuthorised(rawData.sess))) {
        res.send({response:"401"});
        return;
    }
    if(rawData.action == "delete") await db.Delete(rawData.id);
    res.send({response:"done"});
});

app.get('/view-cv/:cvid', async (req, res) => {
    if(!(await isAuthorised(req.query.sess))) res.send({response:"401"});
    const id = req.params.cvid;
    let filename = null;
    for(const file of await fs.readdirSync("functions/database/files")) {
        if(file.split(".")[0] == id) {
            filename = file;
            break;
        }
    }
    if(!filename) res.send({response:"404"});
    res.sendFile("database/files/" + filename,{root:__dirname});
});

app.post('/login' , async (req , res)=>{
    console.log(req);
    const user= await GetUserFromLogin(req.body.username);
    if(!user) res.send({error:"Usuario no encontrado"});
    if(!user.CanLogin()) {
        res.send({error:"El usuario está deshabilitado"});
        return;
    }
    const password = crypto.createHash('sha256').update(req.body.password).digest('hex');
    if(user.password !== password) {
        res.send({error:"Contraseña incorrecta"});
        return;
    }
    // Create session
    const sessId = await user.CreateSession();
    res.send({error:false,sessid:sessId});
});

app.listen(3000, function() {
    console.log('Listening on 3000');
});

async function isAuthorised(pass) {
    if(!pass) return false; // <-- If there is no SESS ID, reject
    const exists = await fs.existsSync("./functions/auth/sessions/" + pass + ".json");
    if(!exists) return false; // <-- If there is no session, reject
    const result = await GetUserdataFromSess(pass); // <-- Get userData from sess
    if(!result.got) return false;
    const user = new User(result.data);
    if(!user.CanLogin()) return false; // <-- User login is disabled
    return true;
}

async function GetUserFromLogin(login) {
    for(const userFile of (await fs.readdirSync("./functions/auth/users"))) {
        const content = JSON.parse(await fs.readFileSync("./functions/auth/users/" + userFile));
        if(content.login == login) return new User(content);
    }
    return false;
}

async function GetUserdataFromSess(sess) {
    const sessData = await fs.readFileSync("./functions/auth/sessions/" + sess + ".json");
    if(sessData) {
        const sessObj = JSON.parse(sessData);
        if(new Date(sessObj.caducity || Date.now()) < Date.now() && sessObj.caducity != false) {
            await fs.unlinkSync("./functions/auth/sessions/" + sess + ".json");
            return {got:false};
        }
        const userdata = JSON.parse(await fs.readFileSync("./functions/auth/users/" + sessObj.uid + ".json"));
        return {got:true, data: userdata};
    }
    return {got:false};
}

async function GetUserdataFromUid(uid) {
    return await fs.readFileSync("./functions/auth/users/" + uid + ".json") || false;
}

class User {
    canLogin = false;
    uid = "";
    name = "";
    login = "";
    password = "";
    admin = false;
    lastLogin = Date.now();

    constructor(init) {
        this.canLogin = init.canLogin;
        this.uid = init.uid;
        this.admin = init.admin;
        this.name = init.name;
        this.login = init.login;
        this.password = init.password;
        this.lastLogin = init.lastLogin;
    }

    CanLogin() {
        if(!this.canLogin) return false;
        return true;
    }

    async CreateSession() {
        const sessId = Date.now();
        await fs.writeFileSync("./functions/auth/sessions/" + sessId + ".json",JSON.stringify({
            uid:this.uid,
            caducity:(Date.now() + (2 * 24 * 60 * 60 * 1000)) // Two days of session
        }));
        return sessId;
    }

    async Write() {
        const val = JSON.stringify({
            uid:this.uid,
            name: this.name,
            login: this.login,
            admin: this.admin,
            lastLogin: this.lastLogin,
            canLogin: this.canLogin,
            password: this.password
        });
        await fs.writeFileSync("functions/auth/users/" + this.uid + ".json", val);
    }
}

// 9932f3d42a1a320d320a7849b962f3bfa5feab7f92b6c06de831894aad722705