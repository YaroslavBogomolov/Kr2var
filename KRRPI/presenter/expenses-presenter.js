import ExpensesListComponent from "../view/expenses-list-component.js";
import ExpenseComponent from "../view/expense-component.js";
import { render } from "../framework/render.js";
import AddExpensesComponent from "../view/addExpenseComponent.js";
import EditExpenseModal from "../view/edit-expense-component.js";



export default class ExpensesPresenter{
    constructor(container,expensesModel){
        this.container = container;
        this.expensesModel = expensesModel;
        this.currentFilter = "all"; 
        this.modalOpen = false; 
    }

    init(){
        const expensesListComponent= new ExpensesListComponent;
        const addExpenseComponent = new AddExpensesComponent;
        const filterElement = document.querySelector("#category-filter");//filter
        

        render(document.querySelector("#add-expense-form"),addExpenseComponent);
        render(this.container,expensesListComponent);
      

        this.setAddExpenseHandler(addExpenseComponent);
        this.updateExpensesView();
        
        this.setFilterHandler(filterElement); // Установить обработчик для фильтрации

      }

    
    /* updateExpensesView() {
    this.renderExpenses(this.expensesModel.getExpenses()); // Обновляем список книг через renderBooks
    } */
  

    renderExpenses(expenses) {
        const listElement = document.querySelector("#expenses-list");
        listElement.innerHTML = ""; // Очистить список перед рендерингом
        
    
        expenses.forEach((expense) => {
          const expenseComponent = new ExpenseComponent(expense, this.handleDeleteExpense.bind(this),this.handleEditExpense.bind(this)); // для удаления добавлено his.handleDeleteBook.bind(this)
          render(listElement, expenseComponent);
          expenseComponent.setEventListeners(); // добавлено при создании удаления, для прослушки
        });
    }
    updateExpensesView() {
      const expenses = this.expensesModel.getExpenses();
  
      const filteredExpenses = this.filterExpenses(expenses, this.currentFilter);
  
      this.renderExpenses(filteredExpenses);
  }
  
  
    filterExpenses(expenses,filter){
      if (filter === "all"){
        return expenses;
      }
      return expenses.filter((expense) => expense.category === filter);
    }
  
    setFilterHandler(filterElement){
      filterElement.addEventListener("change", (event) => {
        this.currentFilter = event.target.value; 
        this.updateExpensesView(); 
      });
    }
    // удаление
  handleDeleteExpense(expenseId) {
    this.expensesModel.deleteExpense(expenseId);
    this.updateExpensesView(); // Обновляем список книг после удаления
  }

  setAddExpenseHandler(formComponent){
    formComponent.getElement().addEventListener("submit",(event)=>{
      event.preventDefault();

      const formData = new FormData(event.target);
      const newExpense = {
        id: Date.now(), // Уникальный ID
        name: formData.get("name"),
        amount: formData.get("amount"),
        category: formData.get("category"),
      };
      this.expensesModel.addExpense(newExpense);
      // Обновляем список книг
      this.renderExpenses(this.expensesModel.getExpenses());
    
      // Очищаем форму
      event.target.reset();
    })
  }

  handleEditExpense(expenseId) {
    if (this.modalOpen) return; // Проверка на открытое окно
  
    this.modalOpen = true; // Устанавливаем флаг в true, чтобы не открывать новое окно
  
    const expense = this.expensesModel.getExpenseId(expenseId);
    if (!expense) {
      console.error("Книга не найдена");
      return;
    }
  
    // Создаем модальное окно и передаем обработчики через конструктор
    const editModal = new EditExpenseModal(
      expense,
      (updatedExpense) => { // Обработчик для сохранения
        this.expensesModel.updateExpense(updatedExpense);
        this.updateExpensesView();
        modalOverlay.remove(); // Закрываем окно
        this.modalOpen = false; // Сбрасываем флаг
      },
      () => { // Обработчик для отмены
        modalOverlay.remove(); // Закрываем окно без изменений
        this.modalOpen = false; // Сбрасываем флаг
      }
    );
  
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("modal-overlay");
  
    // Добавляем модальное окно в body
    document.body.appendChild(modalOverlay);
    modalOverlay.appendChild(editModal.getElement());
  
    editModal.setEventListeners(); // Вызываем метод, чтобы установить обработчики
  }
}