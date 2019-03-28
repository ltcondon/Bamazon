// ==================================== VARIABLES & CONNECTIONS ==========================================


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

  // Initial gold amount:
  var gold = 500;

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

    // Initial prompt is kicked off:
    beginPrompt();
  });



 // ==================================== BEGIN INQUIRER PROMPT ===========================================

function beginPrompt() {
    inquirer.prompt([
        
        {
        type: "list",
        message: "Ahoy there, weary traveler! Rest those tired legs and have a look'see at me wares, ye won't be dissappointed.",
        choices: ["View items for sale", "View my inventory", "Exit"],
        name: "action"
        }

    // Redirect to appropriate function:
    ]).then(function(res) {
        switch(res.action) {

            case "View items for sale":
            return viewShopInventory();

            case "View my inventory":
            return viewMyInventory();

            case "Exit":
            console.log("\nWho needs ye, then!\n\n")
            connection.end();
            return;

        }
    })
}


// ====================================== VIEW SHOP INVENTORY ============================================

// -- If user elects to view the shop inventory:

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
        console.log("\n\n" + table.toString() + "\nYer gold: " + gold + "\n");

    // Ask user if they'd like to purchase anything from the shop:
    inquirer.prompt([
        {
            type: "input",
            message: "Anything catch yer eye, young traveler?"
            + "\n\nType the ID of an item you wish to purchase. [Enter 'B' to GO BACK or 'Q' to EXIT]",
            name: "id"

        }
    
      // According to their answer(s)...:
      ]).then(function(answer) {

        // Validate input:
        if (answer.id.toLowerCase() === "q") {return connection.end();}
        if (answer.id.toLowerCase() === "b") {return beginPrompt();}

 

          // ...and grab corresponding item from inventory:
          connection.query(
            "SELECT * FROM shop_inventory WHERE ?",
            {
                id: answer.id

            }, function(err, res) {

                // if the item chosen does not exist in the inventory:
                if (typeof(res[0]) === 'undefined') {
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Come to waste me time, traveler?! I clearly don't carry such an item!",
                            choices: ["My mistake, let me look again...", "Sorry, I'll come back later."],
                            name: "action"
                        }
                    ]).then(function(response) {
                        switch(response.action) {
                            case "My mistake, let me look again...":
                            return viewShopInventory();
    
                            case "Sorry, I'll come back later.":
                            console.log("Good riddance!")
                            return connection.end();
                        }
                    })
                }

              // Otherwise, continue the prompt and ask how many items they'll be purchasing:
                else {

                    if (err) throw (err);

                    inquirer.prompt([
                        {
                            type: "input",
                            message: "Ah yes, one of me most popular goods." 
                            + "How many " + res[0].item + "(s) would ye like to purchase?",
                            name: "amount"
                        }
                    ]).then(function(secondAnswer) {
         

              // Relay item/amount to purchaseItem function:
                purchaseItem(res[0], secondAnswer.amount)
          })
        }
      })
    })
  })
}


// ========================================= PURCHASE ITEM ===============================================

// -- If user elects to purchase an item fronm the shop:

function purchaseItem(item, amount) {
    inquirer.prompt([
        {
            type: "list",
            message: "Purchase " + amount + " " + item.item + "(s)?",
            choices: ["Yes", "No", "Go Back"],
            name: "purchase"
        }
    ]).then(function(answer) {
        switch(answer.purchase) {
            case "No":
            console.log("All right then, be gone with ye!");
            return connection.end();

            case "Go Back":
            return viewShopInventory();

            case "Yes":
            console.log("\nPurchasing " + amount + " " + item.item + "...\n")
            
            // If user doesn't have enough gold...
            if ((gold * amount) < (item.price * amount)) {
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Ye don't have enough gold for this purchase! Do I look like a charity to ye, traveler?!",
                        choices: ["My mistake, let me look again...", "Sorry, I'll come back later."],
                        name: "action"
                    }
                ]).then(function(response) {
                    switch(response.action) {
                        case "My mistake, let me look again...":
                        return viewShopInventory();

                        case "Sorry, I'll come back later.":
                        console.log("Good riddance!")
                        return connection.end();
                    }
                })
            }

            // If the merchant doesn't have enough of the item(s) requested:
            else if (item.stock < amount) {
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Here to waste me time, are ye traveler? I clearly don't have enough " + item.item + "(s) for such a purchase!",
                        choices: ["My mistake, let me look again...", "Sorry, I'll come back later."],
                        name: "action"
                    }
                ]).then(function(response) {
                    switch(response.action) {
                        case "My mistake, let me look again...":
                        return viewShopInventory();

                        case "Sorry, I'll come back later.":
                        console.log("Good riddance!")
                        return connection.end();
                    }
                })
            }
            
            // If user has enough gold and the merchant has enough stock...            
            else {
                
            connection.query(
                "INSERT INTO my_inventory SET ?",
                [{
                    item: item.item,
                    count: amount,
                    sell_price: (item.price / 2)
                }],
                function(err, res) {
                    if (err) throw (err);
                    console.log(res.affectedRows + " purchase(s) made!\n");
                }
            )
            gold -= (item.price * amount);
            var currentStock = item.stock;
            connection.query(
                "UPDATE shop_inventory SET stock = " + (currentStock - amount) + " WHERE id = " + item.id,
                function(err, res) {
                    if (err) throw (err);
                    console.log("\n" + amount + " item(s) were added to your inventory. You have " + gold + " gold remaining.\n");
                    
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Thanks for yer business. Care to keep browsing?",
                            choices: ["Sure.", "No thanks."],
                            name: "continue"
                        }
                    ]).then(function(response) {
                        switch (response.continue) {
                            case "Sure.":
                            return viewShopInventory();

                            case "No thanks.":
                            console.log("\nAll right then. Safe travels, comrade.\n\n");
                            return connection.end();
                        }
                    })
                }
            )
          }
        }
    })
}


// ====================================== VIEW USER INVENTORY ============================================

// -- If user elects to view their inventory:
function viewMyInventory() {
    connection.query("SELECT id, item, count, sell_price FROM my_inventory", function(err, res) {
        if (err) throw (err);

// Create and populate CLI table:
        var table = new Table ({
				head: ["ID", "Item Name", "Sell Price", "Count"],
				colWidths: [5, 30, 12, 7]
			});

		for (var i = 0; i < res.length; i++){
			table.push(
				// ["first value", "second value", "third value", "fourth value", " fifth value"]
				[res[i].id, res[i].item, res[i].sell_price, res[i].count]
                );
        }
        console.log("\n\n" + table.toString() + "\nYer gold: " + gold + "\n");

    // Ask user if they'd like to purchase anything from the shop:
    inquirer.prompt([
        {
            type: "input",
            message: "Anything ye wish to part with, young traveler?"
            + "\n\nType the ID of an item you wish to sell. [Enter 'B' to GO BACK or 'Q' to EXIT]",
            name: "id"

        }
    
      // According to their answer(s)...:
      ]).then(function(answer) {

        // Validate input:
        if (answer.id.toLowerCase() === "q") {return connection.end();}
        if (answer.id.toLowerCase() === "b") {return beginPrompt();}

 

          // ...and grab corresponding item from inventory:
          connection.query(
            "SELECT * FROM my_inventory WHERE ?",
            {
                id: answer.id

            }, function(err, res) {

                // if the item chosen does not exist in the inventory:
                if (typeof(res[0]) === 'undefined') {
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Come to waste me time, traveler?! Ye clearly don't carry such an item!",
                            choices: ["My mistake, let me look again...", "Sorry, I'll come back later."],
                            name: "action"
                        }
                    ]).then(function(response) {
                        switch(response.action) {
                            case "My mistake, let me look again...":
                            return viewMyInventory();
    
                            case "Sorry, I'll come back later.":
                            console.log("Good riddance!")
                            return connection.end();
                        }
                    })
                }

              // Otherwise, continue the prompt and ask how many they want to sell:
                else {

                    if (err) throw (err);

                    inquirer.prompt([
                        {
                            type: "input",
                            message: "Ah yes, a popular good in these woods." 
                            + "How many " + res[0].item + "(s) would ye like to sell?",
                            name: "amount"
                        }
                    ]).then(function(secondAnswer) {
         

              // Relay item/amount to purchaseItem function:
                sellItem(res[0], secondAnswer.amount)
          })
        }
      })
    })
  })
}

// =========================================== SELL ITEM ==================================================

// -- If user elects to sell an item to the shop:

function sellItem(item, amount) {
    inquirer.prompt([
        {
            type: "list",
            message: "Sell " + amount + " " + item.item + "(s)?",
            choices: ["Yes", "No", "Go Back"],
            name: "sell"
        }
    ]).then(function(answer) {
        switch(answer.sell) {
            case "No":
            console.log("All right then, be gone with ye!");
            return connection.end();

            case "Go Back":
            return viewMyInventory();

            case "Yes":
            console.log("\nSelling " + amount + " " + item.item + "(s)...\n")

            // If the user doesn't have enough of the item(s) requested:
            if (item.count < amount) {
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Here to waste me time, are ye traveler? Ye clearly don't have enough " + item.item + "(s) for such a sale!",
                        choices: ["My mistake, let me look again...", "Sorry, I'll come back later."],
                        name: "action"
                    }
                ]).then(function(response) {
                    switch(response.action) {
                        case "My mistake, let me look again...":
                        return viewMyInventory();

                        case "Sorry, I'll come back later.":
                        console.log("Good riddance!")
                        return connection.end();
                    }
                })
            }
            
            // If user has enough of the item...            
            else {
                
            connection.query(
                "INSERT INTO shop_inventory SET ?",
                [{
                    item: item.item,
                    stock: amount,
                    price: (item.sell_price * 2)
                }],
                function(err, res) {
                    if (err) throw (err);
                    console.log(res.affectedRows + " sale(s) made!\n");
                }
            )
            gold += (item.sell_price * amount);
            var currentStock = item.count;
            connection.query(
                "UPDATE my_inventory SET stock = " + (currentStock - amount) + " WHERE id = " + item.id,
                function(err, res) {
                    if (err) throw (err);
                    console.log("\n" + amount + " item(s) were sold to the merchant. You now have " + gold + " gold.\n");
                    
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Thanks for yer business. Anything else ye be selling?",
                            choices: ["Let me look.", "No, that's all."],
                            name: "continue"
                        }
                    ]).then(function(response) {
                        switch (response.continue) {
                            case "Let me look.":
                            return viewShopInventory();

                            case "No that's all.":
                            console.log("\nAll right then. Safe travels, comrade.\n\n");
                            return connection.end();
                        }
                    })
                }
            )
          }
        }
    })
}