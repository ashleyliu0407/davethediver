// sushi_bar_data.js
// sushi bar game data: images, ingredients, recipes, menu items, and reservations

// image dictionaries
let images = {};
let ingredientImages = {};
let menuImages = {};
// let reservationImages = {};
let dishImages = {};

// ingredient list -- attributes: name, quality, freshness, image path
// let ingredients = [
//   {name: 'Salmon', quality: 5, freshness: 'Day 1', image: 'images/restaurant/ingredients/salmon.png'},
//   {name: 'Salmon', quality: 5, freshness: 'Day 2', image: 'images/restaurant/ingredients/salmon.png'},
//   {name: 'Yellowtail', quality: 4, freshness: 'Day 1', image: 'images/restaurant/ingredients/yellowtail.png'},
//   {name: 'Mackerel', quality: 5, freshness: 'Day 1', image: 'images/restaurant/ingredients/mackerel.png'},
//   {name: 'Sardine', quality: 3, freshness: 'Day 1', image: 'images/restaurant/ingredients/sardine.png'},
//   {name: 'Sea Urchin', quality: 5, freshness: 'Day 1', image: 'images/restaurant/ingredients/sea_urchin.png'},
//   {name: 'Eel', quality: 4, freshness: 'Day 1', image: 'images/restaurant/ingredients/eel.png'},
//   {name: 'Bluefin Tuna', quality: 5, freshness: 'Day 1', image: 'images/restaurant/ingredients/bluefin_tuna.png'},
//   {name: 'Rice', image: 'images/restaurant/ingredients/rice.png'} // Rice has no quality/freshness
// ];

// menu items -- dishes to display on menu
let menuItems = [
  {name: "Mackerel Sashimi", price: '$15', description: 'Mackerel', image: 'images/restaurant/dishes/mackerel_sashimi.png', available: false},
  {name: "Sardine Sashimi", price: '$12', description: 'Sardine', image: 'images/restaurant/dishes/sardine_sashimi.png', available: false},
  {name: "Salmon Sushi", price: '$35', description: 'Salmon + Rice', image: 'images/restaurant/dishes/salmon_sushi.png', available: false},
  {name: "Yellowtail Sushi", price: '$35', description: 'Yellowtail + Rice', image: 'images/restaurant/dishes/yellowtail_sushi.png', available: false},
  {name: "Dave's Sashimi Plate", price: '$50', description: 'Mackerel + Sardine + Salmon + Yellowtail', image: 'images/restaurant/dishes/sashimi_plate.png', available: false},
  {name: "Dave's Midnight Unadon", price: '$40', description: 'Eel + Rice', image: 'images/restaurant/dishes/unadon.png', available: false},
  {name: "Dave's Favorite Uni Bowl", price: '$50', description: 'Sea Urchin + Rice', image: 'images/restaurant/dishes/uni_bowl.png', available: false},
  {name: "Dave's Premium Deep Sea Set", price: '$150', description: 'Bluefin Tuna + Eel + Sea Urchin', image: 'images/restaurant/dishes/premium_deep_sea.png', available: false}
];

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