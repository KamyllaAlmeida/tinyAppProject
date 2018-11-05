var express = require("express");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
var methodOverride = require('method-override');

var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["lighthouselabs", "Kamylla"],
  // Cookie Options
  maxAge: 2 * 60 * 60 * 1000 // 2 hours
}));
app.use(methodOverride('_method'));


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
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "b2xVn2": {
    id: "b2xVn2",
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


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


app.get("/", (req, res) => {
  let id = req.session.user_id;
  if(id) {
    res.redirect("/urls");
  }else{
    res.redirect("/login");
  }
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
  let id = req.session.user_id;
  if (id) {
    let userURLs = {};
    for (var i in urlDatabase) {
      if(id == urlDatabase[i].userID) {
        userURLs[i] = urlDatabase[i];
      }
    }
    let templateVars = { 
      user: users[id],
      urls: userURLs 
    };
    res.render("urls_index", templateVars);
  } else {
    res.statusCode = 401;
    res.end("Please, log in.");
  }
});

// Page New URL
app.get("/urls/new", (req, res) => {
  let id = req.session.user_id; 
  let templateVars = { 
    user: users[id],
    urls: urlDatabase 
  };
  if(templateVars.user) {
    res.render("urls_new", templateVars);
  }else {
    res.redirect("/login");
  }
});

// Creating new URL
app.post("/urls", (req, res) => {
  let userID = req.session.user_id;
  if(userID) {
    let id = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[id] = {
      longURL: longURL,
      userID: userID
    };
    res.redirect("/urls/" + id);
  }else {
    res.statusCode = 401;
    res.end("Please, log in.");
  }
        
});

app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  let userID = req.session.user_id;

  if(id in urlDatabase && urlDatabase[id].userID === userID) {
    let templateVars = {
      user: users[userID],
      shortURL: id,
      longURL: urlDatabase[id].longURL 
    };
    res.render("urls_show", templateVars);
  } else {
    res.statusCode = 404;
    res.end("URL not registered.");
  }
});

//Updating long URL
app.put("/urls/:id", (req, res) => {
  let id = req.params.id;
  let userID = req.session.user_id; 
  let longURL = req.body.longURL;
  if(userID && urlDatabase[id].userID === userID) {
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
  } else{
    res.statusCode = 401;
    res.redirect("/login");
  }
});

//Redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if(shortURL in urlDatabase) {
    res.redirect(urlDatabase[shortURL].longURL);
  }else {
    res.statusCode = 401;
    res.end("Short URL does not exist.");
  }
});

// Deleting url
app.delete("/urls/:id", (req, res) => {
  let userID = req.session.user_id; 
  const id = req.params.id;
  if(userID && urlDatabase[id].userID === userID) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else{
    res.redirect("/login");
  } 
});

// User login 
app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  if(userID) {
    res.redirect("/urls");
  }else {
    res.render("login");
  }
});

// User login (email and password)
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = 0;

  if (email === "" || password === "") {
    res.statusCode = 403;
    res.end("Enter email and password.");
  }
  
  for(var user_id in users) {
    if(users[user_id].email === email && bcrypt.compareSync(password, users[user_id].password)) {
      id = user_id;
    }
  }
  if(id) {
    req.session.user_id = id;
    res.redirect("/urls");
  }else{
    res.statusCode = 403;
    res.end("This email has not been registered.");
  }
});

// Logout method
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login"); 
});

// Render the registration page
app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  if(userID) {
    res.redirect("/urls");
  }else {
    res.render("register");
  }
  
});

//Creating a new User and setting cookie session
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  
  if(email === "" || password === "") {
    res.statusCode = 400;
    res.end("Please, enter e-mail and password.");
  }

  for(var item in users) {
    if(users[item].email === email) {
    res.statusCode = 400;
    res.end("This email is already being used.");
    }
  }
  
  if(email && password) {
  users[id] = {
    id: id,
    email: email, 
    password: hashedPassword
  }
  req.session.user_id = id;
  res.redirect("/urls");
  }


});





