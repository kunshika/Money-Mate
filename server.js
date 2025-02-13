var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    Category: String,
    Amount: Number,
    Info: String,
    Date: Date
});

const Expense = mongoose.model('Expense', expenseSchema); // Correct model name

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MoneyMate')
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Error connecting to database:', err));

// Add new expense
app.post("/add", async (req, res) => {
    const { category_select, amount_input, info, date_input } = req.body;

    const newExpense = new Expense({
        Category: category_select,
        Amount: amount_input,
        Info: info,
        Date: new Date(date_input) // Ensure this is correctly parsed to a Date object
    });

    try {
        await newExpense.save();
        console.log("Expense inserted successfully");
        res.status(201).json(newExpense); // Return the newly added expense as JSON
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Failed to add expense');
    }
});


// Fetch expenses
app.get("/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find({}); // Use async/await for finding
        res.json(expenses); // Send the expenses as a JSON response
    } catch (err) {
        console.error('Error fetching expenses:', err);
        return res.status(500).send("Error fetching expenses from the database.");
    }
});

// Serve the homepage
app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": "*"
    });
    return res.redirect('public/index.html');
});

app.delete("/delete/:id", async (req, res) => {
    const expenseId = req.params.id;

    try {
        await Expense.findByIdAndDelete(expenseId); // Find the expense by ID and delete it
        console.log(`Expense with ID ${expenseId}deleted successfully`);
        res.status(200).send(`Expense with ID ${expenseId}deleted successfully`);
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).send('Failed to delete expense');
    }
});

// Start the server
app.listen(5000, () => {
    console.log("Listening on port 5000");
});