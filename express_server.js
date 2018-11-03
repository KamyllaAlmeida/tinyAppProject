var express = require("express");
var cookieParser = require('cookie-parser');

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("http://localhost:8080/urls/" + id);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  let templateVars = {
    username: req.cookies["username"],
    shortURL: id,
    longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

//Updating long URL
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

// I dont know what I need to do with this code
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Deleting urls
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
})

// User login with cookies
app.post("/login", (req, res) => {
  const name = req.body.username;
  res.cookie('username', name);
  res.redirect("/urls");
})

// Logout method
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})





