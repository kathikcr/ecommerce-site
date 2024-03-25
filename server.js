const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const { request } = require('http');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware for serving static files
app.use(express.static('public'));

// Set up EJS template engine
app.set('view engine', 'ejs');

// SQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  database: 'testing',
  user: 'root',
  password: 'root123',
});

// Check SQL Connection
connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL database:', error);
    return;
  }
  console.log('MySQL database is connected successfully');
});

// Set up session
app.use(
  session({
    secret: '1234567890abcdefghijklmnopqrstuvwxyz',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Create route for loading product data
app.get("/", (request, response) => {

  const query = "SELECT * FROM product LIMIT 10"; // Enclose the query in quotes

  // Execute Query
  connection.query(query, (error, result) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      response.status(500).send('Error fetching products');
      return;
    }

    if (!request.session.cart) {
      request.session.cart = [];
    }

    response.render('product', { products: result, cart: request.session.cart });
  });
});

// create route to add item to cart
app.post('/add_cart', (request, response) => {

	const product_id = request.body.product_id;

	const product_name = request.body.product_name;

	const product_price = request.body.product_price;

	let count = 0;

	for(let i = 0; i < request.session.cart.length; i++)
	{

		if(request.session.cart[i].product_id === product_id)
		{
			request.session.cart[i].quantity += 1;

			count++;
		}

	}

	if(count === 0)
	{
		const cart_data = {
			product_id : product_id,
			product_name : product_name,
			product_price : parseFloat(product_price),
			quantity : 1
		};

		request.session.cart.push(cart_data);
	}

	response.redirect("/");

});

//Create Route for Remove Item from Shopping Cart
app.get('/remove_item', (request, response) => {

	const product_id = request.query.id;

	for(let i = 0; i < request.session.cart.length; i++)
	{
		if(request.session.cart[i].product_id === product_id)
		{
			request.session.cart.splice(i, 1);
		}
	}

	response.redirect("/");

});

//port info
app.listen(3000, () => {
  console.log('Server has started on port number 3000');
});

