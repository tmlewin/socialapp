const mongoose = require('mongoose');
const bp = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

app.use(require('cors')());
app.use(bp.urlencoded({extended: true}));
app.use(bp.json());

mongoose.connect("mongodb+srv://admin:admin@cluster0.u6a8g.mongodb.net/socialapp?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true},() =>{
    console.log("connected to mongodb")
})
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.listen(port,()=>{
    console.log(`listening on port ${port}`)
}
)



