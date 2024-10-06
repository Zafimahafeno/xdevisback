var mysql = require("mysql2");
const localhost = "localhost";
const myusername = "root";
const mypassword = "";
const database = "asdf";

var con = mysql.createConnection({
  host: localhost,
  user: myusername,
  password: mypassword,
  database: database,
});
con.connect(() => {
  console.log("connexion database");
});
exports.con = con;
