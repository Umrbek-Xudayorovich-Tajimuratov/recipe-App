mealsdiv = document.getElementById("meals");
favMealsDiv = document.getElementById("fav-meals");
arrayMem = [];

writeMealsFromLS(); // favmeals section updated in every reload

// todo: fetch.get random meal array 
getRandomMeal();
async function getRandomMeal(){
    
    const random = await (await fetch("https://www.themealdb.com/api/json/v1/1/random.php")).json();
    randomMeal = random.meals[0];
    addMeal(randomMeal, true); // every page load run addMeal() function
}

// todo: fetch.get searched meal by name
async function getMealBySearch(term){
    const meals = await (await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="+term)).json();
    return meals.meals;
}

// todo: add random Meal to html
function addMeal(mealData, random = false){

    const mealdiv = document.createElement("div");
    mealdiv.classList.add("meal"); // div.meal

    // in the .meal write new html(infos came from database)
    mealdiv.innerHTML = `
        <div class="meal-header">
            ${random ? ` <span class="random">Random recipe</span>` : ""}
            <img src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button id ="fa-heart${mealData.idMeal}">
            <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const heartBtn = mealdiv.querySelector(".meal-body button");

    // when heart btn click 
    heartBtn.addEventListener("click",()=>{
        heartBtn.classList.toggle("active"); // this switch on and of  with active class
        fav_meals_arr =[];

        if (heartBtn.classList.contains('active')) {
            a={ 
                id: `${mealData.idMeal}`,
                mealHtml: `
                <li>
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
                    <div>${mealData.strMeal}</div>
                    <div class ="deletefrom-favourite" onclick ="removeFavMeals(${mealData.idMeal})">
                        <i class="fas fa-window-close"></i>
                    </div>
                </li>`
            };

            if((fav_meals_arr.length == 0)){
                fav_meals_arr.push(a);
                addFavMeal(fav_meals_arr);
            }
            else{
                hasMeal = false;

                for(i=0; i < fav_meals_arr.length; i++){
                    hasMeal = (fav_meals_arr[i].id == randomMeal.idMeal);
                }

                if(!hasMeal){
                    fav_meals_arr.push(a);
                    addFavMeal(fav_meals_arr);
                }
            }
        }
        else{
            removeFavMeals(mealData.idMeal);
        }

    });

    meals.appendChild(mealdiv);
}


// todo: add meal to Favourite meals
function addFavMeal(fav_meals_arr){
    
    addMealToLS(fav_meals_arr);
    fav_meals_arr = getMealsFromLS();
    favMealsDiv.innerHTML = "";
    
    for (let key of fav_meals_arr) {
        favMealsDiv.innerHTML += key.mealHtml;
    }
    
}

// todo: remove meal to Favourite meals
function removeFavMeals(removeMealId){

    mealsHeartBtn = document.getElementById(`fa-heart${removeMealId}`);
 
    if(mealsHeartBtn != null && mealsHeartBtn.classList.contains('active')) {
        mealsHeartBtn.classList.remove("active");
    }
    
    // Take data From LocalStorage, delete unnecassary info and then remained data set to LocalStorage
    const FavMeals = getMealsFromLS();
    // delete unnecassary info look at the LocalStorage data
    for(i=0; i < FavMeals.length; i++){
        if(FavMeals[i].id == removeMealId) FavMeals.splice(i, 1);  
    }
    // remained data set to LocalStorage
    localStorage.setItem("favMealsLS", JSON.stringify(FavMeals));

    // favMealsDiv is the block which is token "my favourite meals"
    favMealsDiv.innerHTML = "";
    for (let key of FavMeals) {
        favMealsDiv.innerHTML += key.mealHtml;
    }
    if(FavMeals == null || FavMeals.length == 0){
        favMealsDiv.innerHTML = `<div class = "dontfind">Below Find many Many Meals. Add them Favourites</div>`;
    }

}

// todo: Add Meals to local storage
function addMealToLS(fav_meals_arr){
    mealmen = getMealsFromLS(); // get meals from API

    fav_meals_arr.forEach(element => {
        if(mealmen == null){
            mealmen = [];
            mealmen.push(element);
        }
        else if((mealmen.filter(elem => element.id == elem.id)).length == 0){
            mealmen.push(element);
        }
    });

    localStorage.setItem("favMealsLS", JSON.stringify(mealmen));
}

// todo: Get Meals from local storage
function getMealsFromLS(){
    return JSON.parse(localStorage.getItem("favMealsLS"));
}

// todo: In page reload, write Meals to favourite meals list from LS 
function writeMealsFromLS(){

    writeMeals = getMealsFromLS();
    if(writeMeals == null || writeMeals.length == 0){
        favMealsDiv.innerHTML = `<div class = "dontfind">Below Find many Many Meals. Add them Favourites</div>`;
    }
    else if(writeMeals != null && writeMeals.length != 0){
        favMealsDiv.innerHTML = "";
        for (let key of writeMeals) {
            favMealsDiv.innerHTML += key.mealHtml;
        }
    }
}

// todo: If search button clicked find all results and write meal section
searchBtn = document.getElementById("search");
searchInput = document.getElementById("search-input");

searchBtn.addEventListener("click", async ()=>{

    searchInputValue = searchInput.value; //input value
    const findMeals = await getMealBySearch(searchInputValue); // take various variants from API
    mealsdiv.innerHTML ="";
    
    if(findMeals == null){
        mealsdiv.innerHTML =`<div class = "dontfind">Sorry, In DataBase hasn't Meal mamed => ${searchInputValue}</div>`;
    }
    else if( searchInputValue == ""){
        mealsdiv.innerHTML =`<div class = "dontfind">Before click search button, 
        Enter a name of the searched Meal!</div>`;
    }
    else{
        findMeals.forEach((meal)=> addMeal(meal));
    }
});