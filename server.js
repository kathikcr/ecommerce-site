const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

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

// Route for homepage
app.get("/", (req, res) => {
  res.render('index'); // Renders the index.ejs file located in the views folder
});

// Create route for loading product data
app.get("/products", (req, res) => {
  const query = "SELECT * FROM product LIMIT 9"; // Enclose the query in quotes

  // Execute Query
  connection.query(query, (error, result) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).send('Error fetching products');
      return;
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    res.render('product', { products: result, cart: req.session.cart });
  });
});

// Create route to add item to cart
app.post('/add_cart', (req, res) => {
  const product_id = req.body.product_id;
  const product_name = req.body.product_name;
  const product_price = req.body.product_price;
  let count = 0;

  for (let i = 0; i < req.session.cart.length; i++) {
    if (req.session.cart[i].product_id === product_id) {
      req.session.cart[i].quantity += 1;
      count++;
    }
  }

  if (count === 0) {
    const cart_data = {
      product_id: product_id,
      product_name: product_name,
      product_price: parseFloat(product_price),
      quantity: 1
    };

    req.session.cart.push(cart_data);
  }

  res.redirect("/products");
});

// Create Route for Remove Item from Shopping Cart
app.get('/remove_item', (req, res) => {
  const product_id = req.query.id;

  for (let i = 0; i < req.session.cart.length; i++) {
    if (req.session.cart[i].product_id === product_id) {
      req.session.cart.splice(i, 1);
    }
  }

  res.redirect("/products");
});

// Port info
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server has started on port number ${PORT}`);
});