let backgroundImg;

//TEXT DETAILS
//change when have local var!!
let day = 1;  
let message = "Day " + day;
//x pos 
let x; 
//y pos
let y; 
//speed of sliding away
let slideSpeed = 10; 
//frames until starts sliding 
let startDelay = 100; 
let frameCounter = 0;


//button 
let playButton;
let gameStarted;

function preload(){
    backgroundImg = loadImage("images/day_screen.png");
   

}


function setup(){
    createCanvas(1400,800);
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
  if (frameCounter > startDelay) {
    x += slideSpeed;
    
  }

  if(frameCounter > 200){
     window.location.href = "boatStart.html";  // change this to your desired page
  }

  // draw text
  text(message, x, y);
  
  
  
}

