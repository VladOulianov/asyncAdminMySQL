const express = require('express')
const mysql = require('mysql')
const methodOverride = require('method-override')
const path = require('path')
const fileUpload = require('express-fileupload');
const util = require('util')
//const { query } = require('express')
const port = 7654
const app = express()

app.use(fileUpload());

require('dotenv').config()

app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    // multipleStatements: true
});



db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connecté à la base MySQL');
});

const query = util.promisify(db.query).bind(db)

global.db = db;
global.query = query
//app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname, './public')));
// CONTROLLER

// ROUTES
app.get('/', async (req, res) => {
    //let query = [
    //     "SELECT * FROM factories",
    //     "SELECT * FROM energies"  
    // ]

    const factories = await query("SELECT * FROM factories")
    const energies = await query("SELECT * FROM energies")

    res.render('index', {
        factories,
        energies
    })

    // db.query(query,(err, result)=>{
    //     if (err){
    //         res.send(err)
    //     }res.render('index',{
    //         factories:result[0],
    //         energies: result[1]
    //     })
    // })



})
app.get('/table/add', (req, res) => {
    res.render("addintables")
})
app.post('/table/add/factory', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    //let factoryId = req.body.factoryId
    let name = req.body.name
    // let energyId = req.body.energyId
    let energyName = req.body.energyName
    let imageUpload = req.files.image
    let image = `public/images/${imageUpload.name}`
    //if(factoryName.length || energyName.length){

    if (imageUpload.mimetype === "image/jpeg" || imageUpload.mimetype === "image/jpg" || imageUpload.mimetype === "image/gif" || imageUpload.mimetype === "image/png") {

        imageUpload.mv(`public/images/${imageUpload.name}`, async function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
                try {
                    await query('INSERT INTO cars_table (name, image) VALUES (?,?);', [name, image])
                    res.redirect('/');
                } catch (err) {
                    res.send(err)
                }

                //res.send('File uploaded!');
            }


        );
    } else {
        message = "fichier invalide"
        res.render('addintables', {
            message
        })
    }
    //   console.log(imageUpload);
    //await query('insert into factories (name) values(?);',[factoryName]);
    //await query('insert into energies (name) values(?);', [energyName]);
    //res.send("ok")

    // await query('insert into cars (name) values(?);', [energyName]); 
    //}else {
    //   res.send('bug')
    // }
})


// app.delete('/table/delete',(req, res)=>{
//     let id = req.param.id

// })
app.listen(port, console.log(`localhost run on port:${port}`))