let expenses = [];
let editing = null;
let budget = null;
let chart = null;
let currMonth = () => (new Date()).toISOString().slice(0,7);

function renderSummary() {
  let month = document.getElementById('filter-date').value || currMonth();
  let sum = expenses.filter(e => e.date.slice(0,7) === month)
                    .reduce((acc, e) => acc + Number(e.amount), 0);
  document.getElementById('total-summary').innerHTML = 
    `💸 Total Spent: ₹${sum} (${month})`;
  if (budget && sum > budget) 
    document.getElementById('budget-alert').innerText = 
      `🚨 Budget limit ₹${budget} crossed!`;
  else 
    document.getElementById('budget-alert').innerText = '';
}

function renderChart() {
  let month = document.getElementById('filter-date').value || currMonth();
  let exp = expenses.filter(e => e.date.slice(0,7) === month);
  let categoryMap = {};
  exp.forEach(e => categoryMap[e.category]=(categoryMap[e.category]||0)+Number(e.amount));
  let ctx = document.getElementById('category-chart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: ['#2196f3','#64b5f6','#00bcd4','#c1e1ff','#283593','#90caf9','#399cef','#42a5f5']
      }]
    },
    options: {responsive: false}
  });
}

function renderExpenses() {
  let list = document.getElementById('expenses-list');
  let search = document.getElementById('search').value.toLowerCase();
  let cat = document.getElementById('filter-category').value;
  let month = document.getElementById('filter-date').value;
  let filtered = expenses.filter(e => 
    (!cat || e.category === cat) &&
    (!month || e.date.slice(0,7) === month) &&
    (e.place.toLowerCase().includes(search) || e.category.toLowerCase().includes(search))
  );
  list.innerHTML = '';
  if(filtered.length === 0) { list.innerHTML = '<p>No expenses found.</p>'; return;}
  filtered.forEach((exp, idx) => {
    list.innerHTML += `
      <div class="expense-card">
        <div class="expense-info">
          <strong>₹${exp.amount}</strong> <span>[${exp.category}]</span>
          <span class="place">at ${exp.place}</span>
          <span class="date">${exp.date}</span>
        </div>
        <div class="actions">
          <button class="edit" onclick="editExpense(${idx})">🖋️</button>
          <button class="delete" onclick="deleteExpense(${idx})">🗑️</button>
        </div>
      </div>
    `;
  });
  renderSummary();
  renderChart();
}

document.getElementById('expense-form').onsubmit = function(e) {
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const place = document.getElementById('place').value;
  if(editing != null){
    expenses[editing] = {amount, category, date, place};
    editing = null;
  }else{
    expenses.push({amount, category, date, place});
  }
  document.getElementById('expense-form').reset();
  renderExpenses();
};

function editExpense(idx) {
  let exp = expenses[idx];
  document.getElementById('amount').value = exp.amount;
  document.getElementById('category').value = exp.category;
  document.getElementById('date').value = exp.date;
  document.getElementById('place').value = exp.place;
  editing = idx;
}

function deleteExpense(idx) {
  expenses.splice(idx,1);
  renderExpenses();
}

function setBudget() {
  budget = document.getElementById('budget').value;
  renderSummary();
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}

function exportPDF() {
  const doc = new window.jspdf.jsPDF();
  doc.text("Expense Tracker Report", 10, 10);
  let y=20;
  expenses.forEach(e=>{
    doc.text(`₹${e.amount} | ${e.category} | ${e.place} | ${e.date}`,10,y);
    y+=10;
  });
  doc.save("expenses_report.pdf");
}

document.getElementById('filter-date').value = currMonth();
window.onload = renderExpenses;
