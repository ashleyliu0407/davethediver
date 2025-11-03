let backgroundImg;
//LOCAL STORAGE
let gameData = JSON.parse(localStorage.getItem("gameData")) || {
  day: 1,
  coins: 100,
  inventory: [{name: 'Rice', image: 'images/restaurant/ingredients/rice.png'}]
};


//TEXT DETAILS
//change when have local var!!
// let day = parseInt(localStorage.getItem("day")) || 1;
let message = "Day " + gameData.day;
//x pos 
let x; 
//y pos
let y; 
//speed of sliding away
let slideSpeed = 10; 
//frames until starts sliding 
let startDelay = 100; 
let frameCounter = 0;
let dayIncremented = false; 


//button 
let playButton;
let gameStarted;

function preload(){
    backgroundImg = loadImage("images/day_screen.png");
   

}


function setup(){
    let cnv = createCanvas(1400,800);
    cnv.parent(document.body);

    textAlign(CENTER, CENTER);
    textSize(250);
    textFont("Quantico, sans-serif");
    fill(255);
    x = width / 2;
    y = height / 2;
  
   
}


function draw(){

 
  image(backgroundImg, 0, 0, width, height);
  frameCounter++;
  // wait a bit before sliding
  if (frameCounter > startDelay  && !dayIncremented) {
    x += slideSpeed;
   
    
  }

  if(frameCounter > 200){
    window.location.href = "boatStart.html";  // change this to your desired page
    // gameData.day++;
    // localStorage.setItem("gameData", JSON.stringify(gameData));
    dayIncremented = true; 
  }

  // draw text
  text(message, x, y);

  
}


// function nextDay() {
//   day++;
//   localStorage.setItem("day", day);
//   console.log("Day updated:", day);
// }

