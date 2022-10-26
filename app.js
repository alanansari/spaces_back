const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

// fix for cors
const cors=require('cors')

app.use(cors({origin:true}))




app.use(express.json());

// add mongodb database and then start server
const dbURI = process.env.dbconfig;
mongoose.connect(dbURI)
.then(()=>{app.listen(process.env.PORT);})
.catch((err)=>{console.log(err)});

// routes
app.use(authRoutes);

