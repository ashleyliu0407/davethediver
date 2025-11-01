// sushi_bar_data.js
// sushi bar game data: images, ingredients, recipes, menu items, and reservations

// image dictionaries
let images = {};
let ingredientImages = {};
let menuImages = {};
// let reservationImages = {};
let dishImages = {};

// ingredient list -- attributes: name, quality, freshness, image path
let ingredients = [
  {name: 'Salmon', quality: 5, freshness: 'Day 1', image: 'images/salmon.png'},
  {name: 'Salmon', quality: 5, freshness: 'Day 2', image: 'images/salmon.png'},
  {name: 'Yellowtail', quality: 4, freshness: 'Day 1', image: 'images/yellowtail.png'},
  {name: 'Mackerel', quality: 5, freshness: 'Day 1', image: 'images/mackerel.png'},
  {name: 'Sardine', quality: 3, freshness: 'Day 1', image: 'images/sardine.png'},
  {name: 'Sea Urchin', quality: 5, freshness: 'Day 1', image: 'images/sea_urchin.png'},
  {name: 'Eel', quality: 4, freshness: 'Day 1', image: 'images/eel.png'},
  {name: 'Bluefin Tuna', quality: 5, freshness: 'Day 1', image: 'images/bluefin_tuna.png'},
  {name: 'Rice', image: 'images/rice.png'} // Rice has no quality/freshness
];

// menu items -- dishes to display on menu
let menuItems = [
  {name: "Mackerel Sashimi", price: '$15', description: 'Mackerel', image: 'images/mackerel_sashimi.png', available: false},
  {name: "Sardine Sashimi", price: '$12', description: 'Sardine', image: 'images/sardine_sashimi.png', available: false},
  {name: "Salmon Sushi", price: '$35', description: 'Salmon + Rice', image: 'images/salmon_sushi.png', available: false},
  {name: "Yellowtail Sushi", price: '$35', description: 'Yellowtail + Rice', image: 'images/yellowtail_sushi.png', available: false},
  {name: "Dave's Sashimi Plate", price: '$50', description: 'Mackerel + Sardine + Salmon + Yellowtail', image: 'images/sashimi_plate.png', available: false},
  {name: "Dave's Midnight Unadon", price: '$40', description: 'Eel + Rice', image: 'images/unadon.png', available: false},
  {name: "Dave's Favorite Uni Bowl", price: '$50', description: 'Sea Urchin + Rice', image: 'images/uni_bowl.png', available: false},
  {name: "Dave's Premium Deep Sea Set", price: '$150', description: 'Bluefin Tuna + Eel + Sea Urchin', image: 'images/premium_deep_sea.png', available: false}
];

// recipes -- keys are ingredient names joined by '+', values are dish name + image path
let recipes = {
  'Mackerel+Salmon+Sardine+Yellowtail': {dish: "Dave's Sashimi Plate", image: 'images/sashimi_plate.png'},
  'Bluefin Tuna+Eel+Sea Urchin': {dish: "Dave's Premium Deep Sea Set", image: 'images/premium_deep_sea.png'},
  'Eel+Rice': {dish: "Dave's Midnight Unadon", image: 'images/unadon.png'},
  'Rice+Sea Urchin': {dish: "Dave's Favorite Uni Bowl", image: 'images/uni_bowl.png'},
  'Rice+Salmon': {dish: 'Salmon Sushi', image: 'images/salmon_sushi.png'},
  'Rice+Yellowtail': {dish: 'Yellowtail Sushi', image: 'images/yellowtail_sushi.png'},
  'Mackerel': {dish: 'Mackerel Sashimi', image: 'images/mackerel_sashimi.png'},
  'Sardine': {dish: 'Sardine Sashimi', image: 'images/sardine_sashimi.png'},
};