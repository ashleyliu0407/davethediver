// sushi_bar_customers.js
// Customer creating, movement, ordering, and eating logic

// customer system variables
let customers = [];
let customerTimer = 0;
let customerCreateInterval = 500; // this will be randomized
let minCreateInterval = 720; // minimum 12 seconds at 60fps
let maxCreateInterval = 1200; // maximum 20 seconds at 60fps
let customerSideImages = {}; // side walking images
let customerFrontImages = {}; // front facing images

function getAllCustomerTypes() {
    // derive from images loaded in loadCustomerImages()
    // e.g., ['customer1','customer2', ...]
    return Object.keys(customerFrontImages);
  }
  
function getActiveCustomerTypes() {
    // count ANY customer currently present (including 'leaving' so it truly never "appears twice")
    const types = new Set();
    for (const c of customers) types.add(c.type);
    return types;
}
  
function getAvailableCustomerTypes() {
    const all = getAllCustomerTypes();
    const active = getActiveCustomerTypes();
    return all.filter(t => !active.has(t));
}

// load customer images (called from main preload)
function loadCustomerImages() {
  // image names: customer1_side.png, customer1_front.png, etc.
  for (let i = 1; i <= 5; i++) {
    customerSideImages['customer' + i] = loadImage('images/customer' + i + '_side.png');
    customerFrontImages['customer' + i] = loadImage('images/customer' + i + '_front.png');
  }
}

function updateCustomers() {
  // create new customers
  customerTimer++;
  if (customerTimer >= customerCreateInterval) {
    createCustomer();
    customerTimer = 0;
    // randomize next create interval
    customerCreateInterval = int(random(minCreateInterval, maxCreateInterval));
  }
  
  // update each customer
  for (let i = customers.length - 1; i >= 0; i--) {
    let customer = customers[i];
    
    if (customer.state === 'walking') {
      // check if there's another walking customer in front blocking the path
      let blocked = false;
      for (let other of customers) {
        if (other !== customer && other.state === 'walking') {
          // if another walking customer is ahead and close, slow down/stop
          if (other.x > customer.x && other.x < customer.x + 120) {
            blocked = true;
            break;
          }
        }
      }
      
      // walk from left to right (only if not blocked)
      if (!blocked) {
        customer.x += 2;
      }
      
      // reached target position
      if (customer.x >= customer.targetX) {
        customer.state = 'turning';
        customer.turnTimer = 0;
      }
    } else if (customer.state === 'turning') {
      // brief pause while turning
      customer.turnTimer++;
      if (customer.turnTimer >= 20) {
        customer.state = 'ordering';
        customer.facing = 'front';
      }
    } else if (customer.state === 'ordering') {
      // show the order as dialogue
      customer.dialogue = customer.order;
      // waiting for food - check if dish is on their plate
      let plateIndex = customer.plateIndex;
      if (plateDishes[plateIndex] !== null) {
        // dish served!
        let servedDish = plateDishes[plateIndex].dishName;
        let servedIngredients = plateDishes[plateIndex].ingredientList || [];
        
        // Calculate earnings
        let earnings = calculateEarnings(customer.order, servedDish, servedIngredients);
        
        // Set customer dialogue based on correctness
        if (servedDish === customer.order) {
          customer.dialogue = 'Thanks!';
        } else {
          customer.dialogue = 'It can be better.';
        }
        
        // Store earnings info for display
        customer.earningsInfo = earnings;
        
        // preserve the intended after-eating comment
        customer.postEatDialogue = customer.dialogue;

        customer.state = 'eating';
        customer.eatTimer = 0;
      }
    } else if (customer.state === 'eating') {
      customer.dialogue = '...';
      customer.eatTimer++;
      if (customer.eatTimer >= 240) { // eat for 4 seconds
        // after eating, show the earnings calculation
        customer.state = 'postComment';
        customer.postTimer = 0;
        
        // Show earnings breakdown as dialogue
        if (customer.earningsInfo) {
          customer.dialogue = customer.earningsInfo.displayText;
        } else {
          customer.dialogue = customer.postEatDialogue || 'Thanks!';
        }
      }
    } else if (customer.state === 'postComment') {
      // brief window to display the after-eating comment and earnings
      customer.postTimer++;
      if (customer.postTimer >= 90) { // ~1.5s to read earnings
        // ADD MONEY TO TOTAL FIRST (before leaving)
        if (customer.earningsInfo && !customer.moneyAdded) {
          totalMoney += customer.earningsInfo.total;
          customer.moneyAdded = true; // flag to prevent double-adding
          console.log('Added $' + customer.earningsInfo.total + ' to total. New total: $' + totalMoney);
        }
        
        // Show floating earnings message
        if (customer.earningsInfo) {
          addEarningsMessage(
            '+$' + customer.earningsInfo.total,
            platePositions[customer.plateIndex].x,
            platePositions[customer.plateIndex].y - 50
          );
        }
        
        // clear plate and leave
        plateDishes[customer.plateIndex] = null;
        customer.state = 'leaving';
        customer.facing = 'side'; // turn to side when leaving
      }
    } else if (customer.state === 'leaving') {
      // walk off to the right and fade out
      customer.x += 2;
      customer.alpha -= 5; // gradually fade out
      if (customer.alpha <= 0) {
        customers.splice(i, 1); // remove customer
      }
    }
  }
}

function drawCustomers() {
  // draw in two passes: walking customers first (behind), then stationary customers (front)
  
  // PASS 1: Draw walking and leaving customers (behind)
  for (let customer of customers) {
    if (customer.state === 'walking' || customer.state === 'leaving') {
      push();
      imageMode(CENTER);
      
      // apply alpha for fade out effect
      tint(255, customer.alpha);
      
      // draw customer image based on facing direction
      let img = customerSideImages[customer.type];
      
      if (img) {
        image(img, customer.x, customer.y, 100, 150); // half body size
      }
      
      noTint(); // reset tint
      
      // draw dialogue text above head (also fade with customer)
      if (customer.dialogue) {
        fill(255, 255, 255, customer.alpha);
        stroke(0, 0, 0, customer.alpha);
        strokeWeight(2);
        textAlign(CENTER);
        textSize(16);
        text(customer.dialogue, customer.x, customer.y - 90);
      }
      
      pop();
    }
  }
  
  // PASS 2: Draw turning, ordering, and eating customers (in front)
  for (let customer of customers) {
    if (customer.state === 'turning' || customer.state === 'ordering' || customer.state === 'eating' || customer.state === 'postComment') {
      push();
      imageMode(CENTER);
      
      // apply alpha for fade out effect
      tint(255, customer.alpha);
      
      // draw customer image based on facing direction
      let img;
      if (customer.facing === 'side') {
        img = customerSideImages[customer.type];
      } else {
        img = customerFrontImages[customer.type];
      }
      
      if (img) {
        image(img, customer.x, customer.y, 100, 150); // half body size
      }
      
      noTint(); // reset tint
      
      // draw dialogue text above head (also fade with customer)
      if (customer.dialogue) {
        // For earnings display (postComment state), use multi-line and smaller text
        if (customer.state === 'postComment' && customer.earningsInfo) {
          fill(255, 215, 0, customer.alpha); // gold for money
          stroke(0, 0, 0, customer.alpha);
          strokeWeight(2);
          textAlign(CENTER);
          textSize(13);
          
          // Split by newlines and draw each line
          let lines = customer.dialogue.split('\n');
          let lineHeight = 16;
          let startY = customer.y - 90 - ((lines.length - 1) * lineHeight / 2);
          
          for (let i = 0; i < lines.length; i++) {
            text(lines[i], customer.x, startY + (i * lineHeight));
          }
        } else {
          // Normal dialogue
          fill(255, 255, 255, customer.alpha);
          stroke(0, 0, 0, customer.alpha);
          strokeWeight(2);
          textAlign(CENTER);
          textSize(16);
          text(customer.dialogue, customer.x, customer.y - 90);
        }
      }
      
      pop();
    }
  }
}

function createCustomer() {
    // choose a customer type that is NOT currently active
    const availableTypes = getAvailableCustomerTypes();
    if (availableTypes.length === 0) {
      console.log('All customer types are already on-screen; skipping spawn.');
      return;
    }
    const customerType = availableTypes[int(random(availableTypes.length))];
  
    // filter only available dishes
    const availableDishes = menuItems.filter(item => item.available);
    if (availableDishes.length === 0) {
      console.log('No available dishes! Customer cannot be created.');
      return;
    }
    const randomDishItem = availableDishes[int(random(availableDishes.length))];
    const randomDish = randomDishItem.name;
  
    // track which plates are occupied by customers (count all states so we don't double-seat)
    const occupiedPlates = new Set(customers.map(c => c.plateIndex));
    // find free plates
    const freePlates = [];
    for (let i = 0; i < 3; i++) {
      if (!occupiedPlates.has(i)) freePlates.push(i);
    }
    if (freePlates.length === 0) {
      console.log('All 3 plates occupied! No room for new customer.');
      return;
    }
  
    // choose a free plate
    const plateIndex = freePlates[int(random(freePlates.length))];
    const targetX = platePositions[plateIndex].x;
  
    const newCustomer = {
      x: -100, // start off-screen left
      y: platePositions[plateIndex].y - 140, // stand behind counter
      targetX: targetX,
      plateIndex: plateIndex,
      type: customerType,
      facing: 'side',
      state: 'walking', // walking -> turning -> ordering -> eating -> postComment -> leaving
      order: randomDish,
      dialogue: null,
      turnTimer: 0,
      eatTimer: 0,
      alpha: 255,
      earningsInfo: null,
      moneyAdded: false // flag to prevent double-adding money
    };
  
    customers.push(newCustomer);
    console.log('New customer (' + customerType + ') ordering: ' + randomDish);
}
  
function checkCustomerOrder(plateIndex, dishName) {
  // find customer at this plate
  for (let customer of customers) {
    if (customer.plateIndex === plateIndex && customer.state === 'ordering') {
      if (dishName === customer.order) {
        customer.dialogue = 'Thanks!';
        return true;
      } else {
        customer.dialogue = 'It can be better.';
        return false;
      }
    }
  }
  return false;
}

function calculateEarnings(orderedDish, servedDish, servedIngredients) {
  // local helpers to avoid scope issues
  const getMenuItemByName = (name) => (menuItems || []).find(it => it.name === name) || null;
  const priceNumber = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    return Number(String(priceStr).replace('$','')) || 0;
  };

  // prices
  const orderedItem = getMenuItemByName(orderedDish);
  if (!orderedItem) {
    console.log('ERROR: Could not find menu item for ' + orderedDish);
    return { base: 0, tip: 0, total: 0, displayText: 'Error!' };
  }
  const orderedBase = priceNumber(orderedItem.price);

  // freshness (avg day number across served ingredients)
  let totalDay = 0, cnt = 0;
  for (const name of (servedIngredients || [])) {
    const ing = ingredients.find(i => i.name === name);
    if (ing && ing.freshness) {
      const m = String(ing.freshness).match(/Day\s+(\d+)/i);
      if (m) { totalDay += Number(m[1]); cnt++; }
    }
  }
  const avgDay = cnt > 0 ? totalDay / cnt : 999;
  const isFresh = avgDay < 2;  // Day 1 ⇒ fresh

  let base = 0, tip = 0, tipReason = '', displayText = '';

  if (servedDish === orderedDish) {
    // correct orders
    base = orderedBase;
    if (isFresh) {
      tip = 10;
      tipReason = 'Perfect. Exceptionally fresh!';
    } else {
      tip = 5;
      tipReason = 'Good. Could be a bit fresher.';
    }
  } else {
    // wrong orders
    const servedItem = getMenuItemByName(servedDish);
    const servedBase = servedItem ? priceNumber(servedItem.price) : orderedBase; // fallback
    base = Math.round(servedBase * 0.5);
    if (isFresh) {
      tip = 3;
      tipReason = 'Mix-up, but delicious and fresh.';
    } else {
      tip = 0;
      tipReason = 'Not my order, and not very fresh.';
    }
  }

  const total = base + tip;

  // nice display
  displayText = tip > 0
    ? `$${base} + $${tip} tip\n(${tipReason})`
    : `$${base}\n(${tipReason})`;

  console.log(`Earnings: $${base} base + $${tip} tip = $${total}`);
  return { base, tip, total, displayText, tipReason };
}
