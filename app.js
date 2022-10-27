const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const bodyParser = require('body-parser')



const jsonParser = bodyParser.json()

const app = express();

// fix for cors
const cors=require('cors')

app.use(cors({origin:true}))


app.use(express.json());

// add mongodb database and then start server
const dbURI = process.env.dbconfig;
mongoose.connect(dbURI)
.then(()=>{app.listen(process.env.PORT);
console.log("connected")})
.catch((err)=>{console.log(err)});

// routes
app.use(authRoutes);

