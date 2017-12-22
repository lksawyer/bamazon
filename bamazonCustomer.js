
require('console.table');
var mysql = require("mysql");
var inquirer = require("inquirer");

//create connection to the bamazon DB on localhost
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'bamazon'
});
 
// connection.connect();

connection.connect(function(err) {
  if (err) throw err;

  itemsForSale();
 
});


//Display items that have quantity
function itemsForSale() {

	var query = "SELECT item_id, product_name, price  FROM products WHERE  stock_quantity > 0"
	var count = 0;

	connection.query(query, function (error, results, fields) {
		if (error) throw error;
		var consoleTable = []
		for(var i = 0; i < results.length; i++) {
			consoleTable.push(
				{
					item_id: results[i].item_id,
					product_name: results[i].product_name,
					price: results[i].price,
				}
			);
			count++
		};

		console.log();
		console.table(consoleTable);

		if(count === results.length) {
			userPrompt();
			count = 0;
		};

	});

};

function userPrompt() {

	var questions = [
		{
			type: 'input',
			name: 'item_ID',
			message: "What item_ID would you like to purchase?"
		},
		{
			type: 'input',
			name: 'purchase_quantity',
			message: "How many units of the product would you like to buy?"
		},
	];

	inquirer.prompt(questions).then(answers => {
		var item_ID = answers.item_ID;
		var purchase_quantity = answers.purchase_quantity;
		// console.log("What item_ID would you like to purchase? " + item_ID);
		// console.log("How many units of the product would you like to buy? " + purchase_quantity);
		order(item_ID, purchase_quantity);
	});


};

function order(item_ID, purchase_quantity) {

	var query = "SELECT item_id, price, stock_quantity FROM products WHERE item_ID = ?";
	var purchase_quantity = parseFloat(purchase_quantity);


	connection.query(query, item_ID, function (error, results, fields) {
		if (error) throw error;
		var stock_quantity = results[0].stock_quantity;
		var price = results[0].price;
		// console.log("Stock Quantity " + stock_quantity);
		// console.log("Purchase Quantity " + purchase_quantity);
		// console.log("Price " + price);
		
		if(stock_quantity >= purchase_quantity) {

			connection.query(
				"UPDATE products SET ? WHERE ?",
				[
					{
						stock_quantity: stock_quantity - purchase_quantity
					},
					{
						item_ID: item_ID
					}
				],
			function(error) {

				console.log();
				console.log("Order Toal: $" + (price * purchase_quantity));
				connection.end();
			});


		} else {

			console.log();
			console.log("Insufficient quantity!");
			connection.end();
		};


	});
	
};


