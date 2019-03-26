var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "quiz_db"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    beginPrompt();
  });

  function beginPrompt() {
    inquirer.prompt([
        {
        type: "list",
        message: "Ahoy there, traveler! "
        }
    ])
  }