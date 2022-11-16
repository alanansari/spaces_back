const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const subspaceRoutes = require('./routes/subspaceRoutes');
const commentRoutes = require('./routes/commentRoutes');
const nodeCron = require("node-cron");
const nodecron = require('./utils/cleandb');
const fs = require('fs');

if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}
require('dotenv').config();

const app = express();

// fix for cors
const cors=require('cors');
app.use(cors({origin:true}));


app.use(express.json());

// add mongodb database and then start server
const dbURI = process.env.dbconfig;
mongoose.connect(dbURI)
.then(()=>{
    app.listen(process.env.PORT);
    console.log("connected");

    const job = nodeCron.schedule("*/10 * * * *", () => {
        nodecron.cleanDB();
        console.log("called");
    });
})
.catch((err)=>{
    console.log(err)
});




app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

// routes
app.use('/s',subspaceRoutes);
app.use('/p',postRoutes);
app.use('/c',commentRoutes)
app.use(authRoutes);