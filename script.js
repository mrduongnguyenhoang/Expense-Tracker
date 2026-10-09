const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
// Đã đồng bộ ID thành "transaction-list" khớp hoàn toàn với thẻ <ul> trong HTML
const transactionListEl = document.getElementById("transaction-list"); 
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");

// SỬA LỖI 1: Đổi tên mảng thành số nhiều 'transactions' đồng nhất toàn bài
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

transactionFormEl.addEventListener("submit", addTransaction);

function addTransaction(e) {
  e.preventDefault();
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);

  // Kiểm tra tính hợp lệ của dữ liệu đầu vào
  if (description === "" || isNaN(amount)) {
    alert("Vui lòng nhập mô tả và số tiền hợp lệ.");
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));
  
  updateTransactionList();
  updateSummary();

  // Reset (xóa sạch) ô nhập liệu sau khi thêm thành công
  descriptionEl.value = "";
  amountEl.value = "";
}

function updateTransactionList() {
  transactionListEl.innerHTML = "";
  
  // Đảo ngược mảng để giao dịch mới nhất luôn nhảy lên đầu danh sách
  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    // SỬA LỖI 2: Đã đổi thành chèn vào thẻ cha 'transactionListEl' thay vì tự chèn vào chính nó
    transactionListEl.appendChild(transactionEl);
  });
}

function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");
  
  li.innerHTML = `
    <span>${transaction.description}</span>
    <span>
      ${formatCurrency(transaction.amount)}
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    </span>
  `;
  return li;
}

function updateSummary() {
  // Tính tổng số dư hiện tại
  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  
  // Tính tổng các khoản thu nhập (số tiền dương)
  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // SỬA LỖI 3: Đổi dấu thành '< 0' để lọc đúng các khoản chi tiêu (số tiền âm)
  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  
  // Dùng Math.abs() để đổi số tiền chi tiêu âm thành số dương hiển thị cho đẹp mắt
  expenseAmountEl.textContent = formatCurrency(Math.abs(expenses)); 
}

function formatCurrency(number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(number);
}

function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateTransactionList();
  updateSummary();
}

// Chạy lần đầu tiên khi tải lại trang để nạp dữ liệu cũ từ LocalStorage lên giao diện
updateTransactionList();
updateSummary();
