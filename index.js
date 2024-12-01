import express from "express";
import bodyParser from "body-parser";
import { db } from "./db_config.js";

const app = express();
const port = 3000;

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let userId = 1;

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
  // Gets the id, name and colour code of users from db
  // const result = await db.query("SELECT users.id,name,color FROM public.visited_countries JOIN users ON visited_countries.id=users.id")
  const result = await db.query("SELECT * FROM users");
  let usersInfo = [];
  result.rows.forEach((user) => {
    usersInfo.push(user);
  });
  return usersInfo;
}

async function displayUserMap(req, res, next) {
  // Displays the visited countries map of the selected user

  const countries = await checkVisisted(userId);
  const userData = await userInfo();
  // console.log("This are the users: " + JSON.stringify(userData));

  const userIndex = userData.findIndex((user) => user["id"] === userId);
  const userColor = userData[userIndex]["color"];
  // console.log("user color: " + userColor);

  return res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: userData,
    color: userColor,
  });
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const userData = await userInfo();
  // console.log("This are the users available to backend: " + JSON.stringify(userData));

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: userData,
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
    console.log("This is data - " + data.country_code);
    console.log("This is user id: " + userId);
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, userId]
      );
      // res.redirect("/user");
      await displayUserMap(req, res);
    } catch (err) {
      console.log(err);
      res.status(500).send("Error inserting into the database");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error querying database");
  }
});
app.post("/user", async (req, res) => {
  // Handles the mult-user functionality
  if (req.body["user"]) {
    userId = parseInt(req.body["user"]);
  }
  
  if (req.body["add"]) {
    return res.render("new.ejs");
  }

  await displayUserMap(req, res);
  
  // const countries = await checkVisisted(userId);
  // const userData = await userInfo();
  // // console.log("This are the users: " + JSON.stringify(userData));

  // const userIndex = userData.findIndex((user) => user["id"] === userId);
  // const userColor = userData[userIndex]["color"];
  // // console.log("user color: " + userColor);

  // res.render("index.ejs", {
  //   countries: countries,
  //   total: countries.length,
  //   users: userData,
  //   color: userColor,
  // });
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const result = await db.query(
    "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id", 
    [req.body["name"], req.body["color"]]
  );
  userId = result.rows[0]["id"];

  const countries = await checkVisisted(userId);
  const userData = await userInfo();
  // console.log("This are the users: " + JSON.stringify(userData));

  const userIndex = userData.findIndex((user) => user["id"] === userId);
  const userColor = userData[userIndex]["color"];
  // console.log("user color: " + userColor);

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: userData,
    color: userColor,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
