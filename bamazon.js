// Require node packages:
var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

// Initiate MySQL connection:
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "storefront_DB"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    beginPrompt();
  });

  // Begin inquirer prompt:
  function beginPrompt() {
    inquirer.prompt([
        
        {
        type: "list",
        message: "Ahoy there, weary traveler! Care to break for a brief rest and take a peek at my wares?",
        choices: ["View items for sale", "View my inventory", "Exit"],
        name: "action"
        }

    // Break into appropriate function:
    ]).then(function(res) {
        switch(res.action) {

            case "View items for sale":
            return viewShopInventory();

            case "View my inventory":
            return viewMyInventory();

            case "Exit":
            connection.end();
            return;

        }
    })
  }


// -- If user elects to view shop inventory: -- 
var gold = 500;

function viewShopInventory() {
    connection.query("SELECT id, item, stock, price FROM shop_inventory", function(err, res) {
        if (err) throw (err);

    // Create and populate CLI table:
        var table = new Table ({
				head: ["ID", "Item Name", "Price", "Stock"],
				colWidths: [5, 30, 7, 7]
			});

		for (var i = 0; i < res.length; i++){
			table.push(
				// ["first value", "second value", "third value", "fourth value", " fifth value"]
				[res[i].id, res[i].item, res[i].price, res[i].stock]
                );
        }
        console.log(table.toString());
    })

    // Ask user if they'd like to purchase anything from the shop:
    inquirer.prompt([
        {
            type: "input",
            message: "Anything that catches your eye, young traveler? [Enter 'B' to GO BACK or 'Q' to EXIT]",
            name: "id"

        },
        {
            type: "input",
            message: "Ahh yes, a popular item indeed. How many would you like?",
            name: "amount"
        }
    
      // According to their answer(s)...:
      ]).then(function(answer) {

        // Validate input:
        if (answer.id.toLowerCase() === "q") {return connection.end();}
        if (answer.id.toLowerCase() === "b") {return beginPrompt();}
        if (!typeof(answer.id) === 'number') {
            console.log("\n\nI don't see any of those in stock...\n\n");
            return viewShopInventory();
      }

          // ...and grab corresponding item from inventory:
          connection.query(
            "SELECT * FROM shop_inventory WHERE ?",
            {
                id: answer.id
            }, function(err, res) {
                // Catch any errors, and relay item/amount to purchaseItem function:
                if (err) throw (err);
                // purchaseItem(res, answer.amount)
                console.log(res);
        })
        
    })
}

function purchaseItem(item, amount) {
    console.log("purchase " + amount + item.item + "?");
}


// -- If user elects to view their inventory: --

function viewMyInventory() {
    connection.query("SELECT id, item, count, sell_price FROM my_inventory", function(err, res) {
        if (err) throw (err);

        connection.query("SELECT id, item, count, sell_price FROM my_inventory", function(err, res) {
            if (err) throw (err);
    
            // console.log(res);
    
            var table = new Table ({
                    head: ["Item ID", "Name", "Sell Price", "Count (#)"],
                    colWidths: [5, 20, 10, 5]
                });
    
            for (var i = 0; i < res.length; i++){
                table.push(
                    // ["first value", "second value", "third value", "fourth value", " fifth value"]
                    [res[i].id, res[i].item, res[i].sell_price, res[i].count]
                    );
            }
        })
        console.log(table);
        inquirer.prompt([
            
        ])
    })
    // connection.end();
}
