let expenses = [];
let totalAmount = 0;

const categorySelect = document.getElementById('category_select');
const amountInput = document.getElementById('amount_input');
const InfoInput = document.getElementById('info');
const dateInput = document.getElementById('date_input');
const addBtn = document.getElementById('add_btn');
const expenseTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');

function renderExpenseRow(expense) {
    const newRow = expenseTableBody.insertRow();

    const categoryCell = newRow.insertCell();
    const AmountCell = newRow.insertCell();
    const InfoCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function () {
        
        fetch(`/delete/${expense._id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                  
                    expenses.splice(expenses.indexOf(expense), 1);
                    if (expense.Category === 'Income') {
                        totalAmount -= expense.Amount;
                    }
                    if (expense.Category === 'Expense') {
                        totalAmount += expense.Amount;
                    }
                    totalAmountCell.textContent = totalAmount;
                    expenseTableBody.removeChild(newRow);
                    console.log('Expense deleted successfully');
                } else {
                    console.error('Failed to delete expense');
                }
            })
            .catch(err => {
                console.error('Error deleting expense:', err);
            });
    });

    categoryCell.textContent = expense.Category;
    AmountCell.textContent = expense.Amount;
    InfoCell.textContent = expense.Info;
    dateCell.textContent = new Date(expense.Date).toLocaleDateString(); 
    deleteCell.appendChild(deleteBtn);
}



// Fetch expenses from the database when the page loads
window.onload = function () {
    fetch('/expenses')
        .then(response => response.json())
        .then(data => {
            expenses = data;
            expenses.forEach(expense => {
                if (expense.Category === 'Income') {
                    totalAmount += expense.Amount;
                }
                if (expense.Category === 'Expense') {
                    totalAmount -= expense.Amount;
                }
                renderExpenseRow(expense); // Render each expense in the table
            });
            totalAmountCell.textContent = totalAmount;
        })
        .catch(err => {
            console.error('Error fetching expenses:', err);
        });
};

// Add new expense when "Add" button is clicked
addBtn.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission
    const category = categorySelect.value;
    const info = InfoInput.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (category === '' || category === 'choose') {
        alert('Please select a valid category');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (info === '') {
        alert('Please enter valid info');
        return;
    }
    if (date === '') {
        alert('Please select a date');
        return;
    }

    fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            category_select: category,
            amount_input: amount,
            info: info,
            date_input: date,
        }),
    })
    .then(response => response.json()) 
    .then(newExpense => {
        // Update the local state and UI
        expenses.push(newExpense);

        if (newExpense.Category === 'Income') {
            totalAmount += newExpense.Amount;
        } else if (newExpense.Category === 'Expense') {
            totalAmount -= newExpense.Amount;
        }

        totalAmountCell.textContent = totalAmount;
        renderExpenseRow(newExpense); // Render the newly added expense

        categorySelect.value = 'choose'; // Reset category to 'Choose Category'
        amountInput.value = '';          // Clear the amount input
        InfoInput.value = '';            // Clear the info input
        dateInput.value = '';  
    })
    .catch(err => {
        console.error('Error adding expense:', err);
    });
});

