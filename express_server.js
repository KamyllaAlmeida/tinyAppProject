var express = require("express");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
 
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let string_length = 6;
  let randomstring = '';
  for (let i=0; i<string_length; i++) {
    let rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}

var urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca",
    userID: "b2xVn1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "b2xVn2"
  }
};



const users = { 
  "b2xVn1": {
    id: "b2xVn1",
    name: "User", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "b2xVn2": {
    id: "b2xVn2",
    name: "User2", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Show a list of URLs
app.get("/urls", (req, res) => {
  let id = req.cookies["user_id"]; 
  let userURLs = {};
  for (var i in urlDatabase){
    if(id == urlDatabase[i].userID) {
      userURLs[i] = urlDatabase[i];
    }
  }
  let templateVars = { 
    user: users[id],
    urls: userURLs 
  };
  console.log(userURLs);
  res.render("urls_index", templateVars);
});

// Page New URL
app.get("/urls/new", (req, res) => {
  let id = req.cookies["user_id"]; 
  let templateVars = { 
    user: users[id],
    urls: urlDatabase 
  };
  if(templateVars.user){
    res.render("urls_new", templateVars);
  }else{
    res.redirect("/login");
  }
});

// Creating new URL
app.post("/urls", (req, res) => {
  let userID = req.cookies["user_id"];
  let id = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: longURL,
    userID: userID
  };
  res.redirect("http://localhost:8080/urls/" + id);    
});

app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  let templateVars = {
    user: users[id],
    shortURL: id,
    longURL: urlDatabase[id].longURL };
  res.render("urls_show", templateVars);
});

//Updating long URL
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  let userID = req.cookies["user_id"]; 
  let longURL = req.body.longURL;
  if(userID) {
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
  } else{
    res.redirect("/login");
  }
});

//Redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Deleting urls
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.cookies["user_id"]; 
  const id = req.params.id;
  if(userID) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else{
    res.redirect("/login");
  }
});

// User login 
app.get("/login", (req, res) => {
  res.render("login");
});

// User login (email and password)
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = 0;

    for(var user_id in users){
    if(users[user_id].email === email && bcrypt.compareSync(password, users[user_id].password)){
      id = user_id;
    }
  }
  

  if(id){
    res.cookie('user_id', id);
    res.redirect("/urls");
  }else{
    res.statusCode = 403;
    res.end("This email has not been registered.");
  }
});

// Logout method
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login"); // Mudar para renderizar depois
});

// Render the registration page
app.get("/register", (req, res) => {
  res.render("register");
});

//Creating a new User and setting cookie(user_id)
app.post("/register", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  const id = generateRandomString();
  
  if(email === "" || password === ""){
    res.statusCode = 400;
    res.end("Please, enter e-mail and password.");
  }

  for(var item in users){
    if(users[item].email === email){
    res.statusCode = 400;
    res.end("This email is already being used.");
    }
  }
  
  if(email && password){
  users[id] = {
    id: id,
    email: email, 
    password: hashedPassword
  }
  console.log(users);
  res.cookie('user_id', id);
  res.redirect("/urls");
  }


});





