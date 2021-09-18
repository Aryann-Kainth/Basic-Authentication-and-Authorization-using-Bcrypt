const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const User=require('./models/user');
const session=require('express-session');
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/pleasework', { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connetion error'));
db.once('open', () => {
    console.log('database connected');
})
app.set('view engine', 'ejs');
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }));
app.use(session({secret:'notagood'}));
app.get('/register', (req, res) => {
    res.render('register');
})
app.post('/landing', async (req, res) => {
    const {username,password}=  req.body;
    const hash=await bcrypt.hash(password,12);
    const user=new User({name:username,password:hash});
    await user.save();
    req.session.user_id=user._id;
    res.redirect('/login');
})
app.get('/login',(req,res)=>{
 res.render('login.ejs');
})
app.post('/login',async (req,res)=>{
    const {username,password}=req.body;
    const user=await User.findOne({name:username});
    if(!user)
    {
        res.send('Invalid Credentials');
    }
    const validpass=await bcrypt.compare(password,user.password); 
    if(validpass)
    {   req.session.user_id=user._id;
        res.send('You May Enter')
    }
    else{
        res.send('You shall not pass');
    }
})
app.get('/secret',(req,res)=>{
    if(!req.session.user_id)
    {
        res.redirect('/login');
    }
    res.render('secret');
})
app.post('/logout',(req,res)=>{
    req.session.user_id=null;
    res.redirect('/login');
})
app.listen(3000, () => {
    console.log('Port Active');
})