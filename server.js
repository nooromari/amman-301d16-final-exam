'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');
const bodyParser = require('body-parser')

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
// app.use(urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: false }))

// Specify a directory for static resources
app.use(express.static('./public'));

// define our method-override reference
app.use(methodOverride('_method'));

// Set the view engine for server-side templating
app.set('view engine','ejs');

// Use app cors
app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/', handleHome);
app.get('/favorite-quotes', handleFav);
app.get('/favorite-quotes/:id', handleOne);
app.post('/favorite-quotes', handleSave);
app.put('/update-quotes/:id', handleUpdate);
app.delete('/favorite-quotes/:id', handleDelete);

// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --

function handleHome(req,res){
    const url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(data =>{
        const arr = data.body.map(item => new Quote(item))
        res.render('index',{data:arr});
    })
}

function handleSave(req,res){
    const {quote,character,image,characterDirection} =req.body;
    const sql = 'INSERT INTO quotes (quote,character,image,characterDirection) VALUES ($1,$2,$3,$4);';
    const VALUES = [quote,character,image,characterDirection];
    client.query(sql,VALUES).then(()=> res.redirect('/favorite-quotes'));
}

function handleFav(req,res){
    const sql = 'SELECT * FROM quotes;'
    client.query(sql).then(result =>{
        res.render('fav', {data:result.rows})
    })
}
// helper functions

function Quote(data){
    this.quote= data.quote;
    this.character= data.character;
    this.image= data.image;
    this.characterDirection= data.characterDirection;
}

function handleOne(req,res){
    const id = req.params.id;
    // console.log(id);
    const sql = 'SELECT * FROM quotes WHERE id=$1;';
    const value = [id];
    client.query(sql,value).then(result=>{
        res.render('details', {data:result.rows})
    })
}

function handleUpdate(req,res){
    const id = req.params.id;
    const quote = req.body.quote;
    // console.log(id,quote);
    const sql = 'UPDATE quotes SET quote=$2 WHERE id=$1;';
    const value = [id,quote];
    client.query(sql,value).then(result=>{
        res.redirect(`/favorite-quotes/${id}`)
    })

}

function handleDelete(req,res){
    const id = req.params.id;
    // console.log(id,quote);
    const sql = 'DELETE FROM quotes WHERE id=$1;';
    const value = [id];
    client.query(sql,value).then(result=>{
        res.redirect(`/favorite-quotes`)
    })
}
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
