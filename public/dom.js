let nameInput = document.querySelector('#name');
let expenseInput = document.querySelector('#expense');
let errors = document.querySelector('.errors');
let submitBtn = document.querySelector('.btn');

submitBtn.addEventListener('click', (e) => {

    e.preventDefault();
    console.log(nameInput.value,expenseInput.value);
    if(nameInput.value && expenseInput.value){
        db.collection('expenses').add({
            name: nameInput.value,
            expense: parseInt(expenseInput.value)
        }).then(doc => {
            console.log("Document:",doc);
            console.log("Document id",doc.id);
        }).catch(err => console.log(err));
    } else if(nameInput.value === ''){
        errors.innerHTML = 'Name cannot be empty.';
    } else if(expenseInput.value === ''){
        errors.innerHTML = 'Expense cannot be empty.';
    }
    

    nameInput.value = '';
    expenseInput.value = '';
})