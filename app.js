const mealsContainer = document.querySelector('#meals-container');
const favouriteMeals = document.querySelector('#favourite-meals-items');
const navButton = document.querySelector('#nav-button');
const navInput = document.querySelector('#nav-input');
const mealInfoClose = document.querySelector('#meal-info-close');
const mealInfoContainer = document.querySelector('#meal-info-container');
const mealInfoOverlay = document.querySelector('#meal-info-overlay');

initialize();

function initialize() {
  getRandomRecipe();
  getFavRecipes();
  // add burek
  const ids = getRecipesLS();
  if (!ids.includes('53060')) {
    addRecipeLS('53060');
  }
}

async function getRandomRecipe() {
  const requestRecipe = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');

  const requestRecipeData = await requestRecipe.json();

  const randomRecipe = requestRecipeData.meals[0];

  mealsContainer.append(createRecipe(randomRecipe, true));
}

async function getRecipes(term) {
  const requestRecipe = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);

  const requestRecipeData = await requestRecipe.json();

  const recipes = requestRecipeData.meals;

  mealsContainer.innerHTML = '';
  // is there any recipes for term
  if (recipes) {
    for (let recipe of recipes) {
      mealsContainer.append(createRecipe(recipe, false));
    }
  }
}

function createRecipe(recipe, isRandom) {
  const mealContainer = document.createElement('div');

  mealContainer.classList.add('meal-container');

  // set an id of an meal that is connected to api id
  mealContainer.setAttribute('data-id', recipe.idMeal);

  // addEventListener for containers (addRecipeToFav and openRecipeInfo)
  mealContainer.addEventListener('click', async (e) => {
    const hearth = e.target.closest('#meal-hearth-container');
    const container = e.target.closest('.meal-container');
    const recipeId = container.getAttribute('data-id');

    // is container clicked or hearth specifically?
    if (hearth) {
      addRecipeToFav(e, recipeId);
    } else if (container) {
      openMealInfo(recipeId);
    }
  });

  mealContainer.innerHTML = `<header class="meal-container-header">
          ${isRandom ? `<h2>Random Recipe</h2>` : ''}
            <div class="meal-container-img-container">
              <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
            </div>
          </header>
          <footer class="meal-container-footer">
            <h2>${recipe.strMeal}</h2>
            <div id="meal-hearth-container">
            <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512">
              <style>
                svg {
                  fill: #bcc0c8;
                }
              </style>
              <path
                d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"
              />
            </svg>
            </div>
          </footer>`;

  return mealContainer;
}

async function getRecipeById(id) {
  const request = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);

  const requestData = await request.json();

  const recipe = requestData.meals[0];

  return recipe;
}

async function getFavRecipes() {
  favouriteMeals.innerHTML = '';
  const recipeIds = getRecipesLS();

  for (let i = 0; i < recipeIds.length; i++) {
    const recipe = await getRecipeById(recipeIds[i]);

    createFavouriteMealsItem(recipe);
  }
}

async function addRecipeToFav(e, id) {
  // make hearth active
  const hearth = e.target.closest('svg');

  if (!hearth.classList.contains('active')) {
    hearth.classList.add('active');

    const recipe = await getRecipeById(id);

    createFavouriteMealsItem(recipe);

    addRecipeLS(recipe.idMeal);
  }
}

function getRecipesLS() {
  const recipeIds = JSON.parse(localStorage.getItem('recipeIds'));

  return recipeIds === null ? [] : recipeIds;
}

function removeRecipeLS(id) {
  const recipeIds = getRecipesLS();

  localStorage.setItem('recipeIds', JSON.stringify(recipeIds.filter((e) => e !== id)));
}

function addRecipeLS(id) {
  const recipeIds = getRecipesLS();

  localStorage.setItem('recipeIds', JSON.stringify([...recipeIds, id]));
}

async function openMealInfo(id) {
  const mealInfoImg = document.querySelector('#meal-info-img');
  const mealInfoTitle = document.querySelector('#meal-info-title');
  const mealInfoText = document.querySelector('#meal-info-text');
  const mealInfoUl = document.querySelector('#meal-info-ingrediants-ul');

  const recipe = await getRecipeById(id);

  mealInfoImg.setAttribute('src', recipe.strMealThumb);
  mealInfoImg.setAttribute('alt', recipe.strMeal);

  mealInfoTitle.textContent = recipe.strMeal;

  mealInfoText.textContent = recipe.strInstructions;

  for (let i = 1; i <= 20; i++) {
    const li = document.createElement('li');
    li.classList.add('meal-info-ingrediants-li');

    const strIngredient = `strIngredient${i}`;
    const strMeasure = `strMeasure${i}`;

    if (recipe[strIngredient]) {
      li.textContent = `${recipe[strIngredient]}:${recipe[strMeasure]}`;
      mealInfoUl.append(li);
    }
  }

  mealInfoContainer.classList.add('active');
  mealInfoOverlay.classList.add('active');
}

function createFavouriteMealsItem(recipe) {
  const recipeIds = getRecipesLS();

  const favouriteMealsItem = document.createElement('div');
  favouriteMealsItem.classList.add('favourite-meals-item');
  favouriteMealsItem.setAttribute('data-id', recipe.idMeal);

  favouriteMealsItem.addEventListener('click', (e) => {
    console.log(e.target);
    openMealInfo(recipe.idMeal);
  });

  const removeButton = document.createElement('div');
  removeButton.classList.add('favourite-meal-remove-container');

  removeButton.innerHTML = `<svg id="favourite-meal-remove" xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512">
          <style>
            svg {
              fill: #bcc0c8;
            }
          </style>
          <path
            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
          />
        </svg>`;

  removeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    removeRecipeLS(recipe.idMeal);
    getFavRecipes();
  });

  favouriteMealsItem.innerHTML += ` 
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
            <span id="favourite-meals-text">${recipe.strMeal}</span>`;

  favouriteMealsItem.prepend(removeButton);
  favouriteMeals.append(favouriteMealsItem);
}

navButton.addEventListener('click', (e) => {
  getRecipes(navInput.value);
});

mealInfoClose.addEventListener('click', (e) => {
  mealInfoContainer.classList.remove('active');
  mealInfoOverlay.classList.remove('active');
});
