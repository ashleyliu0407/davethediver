// sushi_bar_data.js
// sushi bar game data: images, ingredients, recipes, menu items, and reservations
let images = {};
let ingredientImages = {};
let menuImages = {};
let dishImages = {};
let unlockNotification = null;
let unlockNotificationQueue = [];

// ingredient list -- attributes: name, quantity, freshness, image path
let ingredients = [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}];

// track which fish types have been caught (for unlocking)
let caughtFishTypes = new Set(JSON.parse(localStorage.getItem("caughtFishTypes") || "[]"));
let shownNotifications = new Set(JSON.parse(localStorage.getItem("shownNotifications") || "[]"));

// helper function to register caught fish
function registerCaughtFish(fishName) {
  caughtFishTypes.add(fishName);
  localStorage.setItem("caughtFishTypes", JSON.stringify([...caughtFishTypes]));
  checkForNewUnlocks();
}

// check if any new menu items can be unlocked
function checkForNewUnlocks() {
  let newlyUnlocked = [];
  for (let item of menuItems) {
    if (!item.unlocked && isMenuItemUnlocked(item)) {
      item.unlocked = true;
      newlyUnlocked.push(item);
    }
  }
  
  // only show notifications for dishes that haven't been shown before
  for (let item of menuItems) {
    if (item.unlocked && !shownNotifications.has(item.name)) {
      unlockNotificationQueue.push({
        dishName: item.name,
        dishImage: item.image,
        description: item.description
      });
      shownNotifications.add(item.name);
    }
  }
  
  // save shown notifications to localStorage
  if (unlockNotificationQueue.length > 0) {
    localStorage.setItem("shownNotifications", JSON.stringify([...shownNotifications]));
    console.log('Showing unlock notifications for: ' + unlockNotificationQueue.map(n => n.dishName).join(', '));
    
    // play sound once for the unlock event
    if (coinSound) {
      coinSound.play();
    }
  }
}

// check if a menu item is unlocked
function isMenuItemUnlocked(item) {
  // check money requirement
  if (totalMoney < item.requiredMoney) {
    return false;
  }
  
  // check if all required fish have been caught
  for (let fish of item.requiredFish) {
    if (!caughtFishTypes.has(fish)) {
      return false;
    }
  }
  
  return true;
}

// get unlock requirement text for a menu item
function getUnlockRequirementText(item) {
  let missing = [];
  
  // check money
  if (totalMoney < item.requiredMoney) {
    missing.push('Earn $' + item.requiredMoney + ' total');
  }
  
  // check fish
  let missingFish = [];
  for (let fish of item.requiredFish) {
    if (!caughtFishTypes.has(fish)) {
      missingFish.push(fish);
    }
  }
  
  if (missingFish.length > 0) {
    missing.push('Catch your first ' + missingFish.map(f => f.toLowerCase()).join(', ') + ' to unlock');
  }
  
  return missing.length > 0 ? missing.join(' | ') : 'UNLOCKED';
}

// automatically register fish from inventory as caught
function registerInventoryFish() {
  let fishRegistered = 0;
  
  for (let ingredient of ingredients) {
    if (ingredient.name === 'Rice') {
      continue;
    }
    
    // if this fish isn't already registered, add it
    if (!caughtFishTypes.has(ingredient.name)) {
      caughtFishTypes.add(ingredient.name);
      fishRegistered++;
      console.log('First time catching: ' + ingredient.name);
    }
  }

  if (fishRegistered > 0) {
    localStorage.setItem("caughtFishTypes", JSON.stringify([...caughtFishTypes]));
    console.log('Registered ' + fishRegistered + ' fish from inventory');
  }
}

// extract fish ingredients from a recipe (excludes Rice)
function extractFishFromRecipe(recipeKey) {
  let ingredients = recipeKey.split('+');
  // filter out non-fish items (rice, etc.)
  return ingredients.filter(ing => ing !== 'Rice');
}

// auto-populate requiredFish based on recipes
function autoGenerateUnlockRequirements() {
  for (let item of menuItems) {
    // find the recipe key for this dish
    let recipeKey = Object.keys(recipes).find(key => recipes[key].dish === item.name);
    
    if (recipeKey) {
      // extract fish from recipe and set as required fish
      item.requiredFish = extractFishFromRecipe(recipeKey);
    } else {
      item.requiredFish = []; // No requirements if no recipe
    }
  }
}

// check if we have ingredients for a dish
function hasIngredientsForDish(dishName) {
  // find recipe for this dish
  let recipeKey = Object.keys(recipes).find(key => recipes[key].dish === dishName);
  if (!recipeKey) return false;
  
  let requiredIngredients = recipeKey.split('+');
  
  // check if each ingredient exists with quantity > 0 OR is on the table
  for (let ingName of requiredIngredients) {
    // check inventory
    let inInventory = ingredients.find(ing => 
      ing.name === ingName && (ing.quantity === undefined || ing.quantity > 0)
    );
    
    // check table positions
    let onTable = tablePositions.some(pos => 
      pos.ingredient && pos.ingredient.name === ingName
    );
    
    // ingredient must be either in inventory or on table
    if (!inInventory && !onTable) {
      return false; // missing ingredient
    }
  }
  
  return true;
}

// recipes -- keys are ingredient names joined by '+', values are dish name + image path
let recipes = {
  'Mackerel+Salmon+Sardine+Yellowtail': {dish: "Dave's Sashimi Plate", image: 'images/restaurant/dishes/sashimi_plate.png'},
  'Bluefin Tuna+Eel+Sea Urchin': {dish: "Dave's Premium Deep Sea Set", image: 'images/restaurant/dishes/premium_deep_sea.png'},
  'Eel+Rice': {dish: "Dave's Midnight Unadon", image: 'images/restaurant/dishes/unadon.png'},
  'Rice+Sea Urchin': {dish: "Dave's Favorite Uni Bowl", image: 'images/restaurant/dishes/uni_bowl.png'},
  'Rice+Salmon': {dish: 'Salmon Sushi', image: 'images/restaurant/dishes/salmon_sushi.png'},
  'Rice+Yellowtail': {dish: 'Yellowtail Sushi', image: 'images/restaurant/dishes/yellowtail_sushi.png'},
  'Mackerel': {dish: 'Mackerel Sashimi', image: 'images/restaurant/dishes/mackerel_sashimi.png'},
  'Sardine': {dish: 'Sardine Sashimi', image: 'images/restaurant/dishes/sardine_sashimi.png'},
};

// menu items -- dishes to display on menu
let menuItems = [
  {name: "Mackerel Sashimi", price: '$15', description: 'Mackerel', image: 'images/restaurant/dishes/mackerel_sashimi.png', available: false, requiredFish: ['Mackerel'], requiredMoney: 0, unlocked: false},
  {name: "Sardine Sashimi", price: '$12', description: 'Sardine', image: 'images/restaurant/dishes/sardine_sashimi.png', available: false, requiredFish: ['Sardine'], requiredMoney: 0, unlocked: false},
  {name: "Salmon Sushi", price: '$35', description: 'Salmon + Rice', image: 'images/restaurant/dishes/salmon_sushi.png', available: false, requiredFish: ['Salmon'], requiredMoney: 0, unlocked: false},
  {name: "Yellowtail Sushi", price: '$35', description: 'Yellowtail + Rice', image: 'images/restaurant/dishes/yellowtail_sushi.png', available: false, requiredFish: ['Yellowtail'], requiredMoney: 0, unlocked: false},
  {name: "Dave's Sashimi Plate", price: '$50', description: 'Mackerel + Sardine + Salmon + Yellowtail', image: 'images/restaurant/dishes/sashimi_plate.png', available: false, requiredFish: ['Mackerel', 'Sardine', 'Salmon', 'Yellowtail'], requiredMoney: 0, unlocked: false},
  {name: "Dave's Midnight Unadon", price: '$40', description: 'Eel + Rice', image: 'images/restaurant/dishes/unadon.png', available: false, requiredFish: ['Eel'], requiredMoney: 0, unlocked: false},
  {name: "Dave's Favorite Uni Bowl", price: '$50', description: 'Sea Urchin + Rice', image: 'images/restaurant/dishes/uni_bowl.png', available: false, requiredFish: ['Sea Urchin'], requiredMoney: 0, unlocked: false},
  {name: "Dave's Premium Deep Sea Set", price: '$150', description: 'Bluefin Tuna + Eel + Sea Urchin', image: 'images/restaurant/dishes/premium_deep_sea.png', available: false, requiredFish: ['Bluefin Tuna', 'Eel', 'Sea Urchin'], requiredMoney: 0, unlocked: false},
];