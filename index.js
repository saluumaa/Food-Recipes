const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');

// event listeners
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});


// get meal list that matches with the ingredients
function getMealList(){
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast`)
    .then(response => response.json())
    .then(data => {
        let html = "";
        if(data.meals){
            data.meals.forEach(meal => {
                html += `
                    <div class = "meal-item" data-id = "${meal.idMeal}">
                        <div class = "meal-img">
                            <img src = "${meal.strMealThumb}" alt = "food">
                        </div>
                        <div class = "meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href = "#" class = "recipe-btn">Get Recipe</a>
                        </div>
                    </div>
                `;
            });
            mealList.classList.remove('notFound');
        } else{
            html = "Sorry, we didn't find any meal!";
            mealList.classList.add('notFound');
        }
        mealList.innerHTML = html;
        document.querySelector('.Number').innerHTML = `Food (${mealList.children.length})`
    });
}

// get recipe of the meal
function getMealRecipe(e){
    e.preventDefault();
    if(e.target.classList.contains('recipe-btn')){
        let mealItem = e.target.parentElement.parentElement;
        let mealId = mealItem.dataset.id;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals, mealId));
    }
}

// create a modal
function mealRecipeModal(meal, mealId){
    console.log(meal);
    meal = meal[0];
    let html = `
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = "">
        </div>
        <h2 class = "recipe-title">${meal.strMeal}</h2>
        <p class = "recipe-category">${meal.strCategory}</p>
        <div class = "recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <h3 class="comment-holder">
          Comments (<span class="comment-count">0</span>)
        </h3>
        <ul class="comments-list">

        </ul>
        <h2 class="form-title">Add a comment</h2>
        <form class="comment-form">
          <input id="name" type="text" name="username" placeholder="Your name" required>
          <textarea id="textarea" placeholder="Your insights" name="comment" required minlength="1"></textarea>
          <button class="submit-btn" type="submit">Submit</button>
          <p class='save'></p>
        </form>

        `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
    const commentForms = document.querySelectorAll('form');
    commentForms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            // event.preventDefault();
            submitComment(event, mealId);
            
        }); 
    });
   displayComments(mealId);
    
}

const submitComment = async(event, mealId) => {
    const nameInput = document.getElementById('name');
    const commentInput = document.getElementById('textarea');
    const saveMsg = document.querySelector('.save');

    event.preventDefault();
    const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/CCOzPhk7tqpnIq5ba7VY/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            item_id: mealId,
            username: nameInput.value,
            comment: commentInput.value,
        }),
    });
    const data = await response.text();
    console.log(data)
    saveMsg.innerHTML = `successfully saved ${data}`;
    setTimeout(() => {
        saveMsg.style.display = 'none';
    }, 2000);
    nameInput.value = '';
    commentInput.value = '';
    displayComments(mealId);
};

const displayComments = async(mealId) => {
    const listComments = document.querySelector('.comments-list');
    const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/CCOzPhk7tqpnIq5ba7VY/comments?item_id=${mealId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    const comments = await response.json()
    listComments.innerHTML = '';
    console.log(comments)
    comments.forEach((comment) => {
        listComments.innerHTML += `
            <li>${comment.creation_date}  ${comment.username} : ${comment.comment}</li>
        `;
        document.querySelector('.comment-count').textContent = `${listComments.children.length}`
      });
}


document.addEventListener('DOMContentLoaded', getMealList)