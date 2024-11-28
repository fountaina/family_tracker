import express from "express";
import bodyParser from "body-parser";
import { db } from "./db_config.js";

const app = express();
const port = 3000;

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisisted(userId=1) {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id=$1", [userId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function userInfo() {
  // Gets the id, name and colour code of users frm db
  const result = await db.query("SELECT users.id,name,color FROM public.visited_countries JOIN users ON visited_countries.id=users.id")
  let usersInfo = []
  result.rows.forEach((user) => {
    usersInfo.push(user);
  });
  return usersInfo;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: "teal",
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  console.log("This is the body name: " + req.body["user"]);
  if (req.body["user"]) {
    const userId = parseInt(req.body["user"]);
    const countries = await checkVisisted(userId);
    const userData = await userInfo();
    console.log("This are the users: " + JSON.stringify(userData));

    const userColor = userData[userId - 1]["color"];
    console.log("user color: " + userColor);

    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: userData,
      color: userColor,
    });
  } else {
    res.render("new.ejs");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
