// OxygenBox.js - defines the OxygenBox class which provides oxygen to the player

class OxygenBox extends Box {
    constructor(x,y,amount,img) {
        super(x,y,img); // call the parent class constructor
        this.oxygenAmount = amount; // amount of oxygen this box provides
    }

    display() {
        if(!this.isCollected) {
            // use parent display method
            super.display();

            // add special oxygen box indicator
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(10);
            text("O₂", this.position.x+5, this.position.y+5);
        }
    }

    collect(player) {
        super.collect(player); // call parent collect method
        if (oxygenSound) {
            oxygenSound.setVolume(0.8);
            oxygenSound.play();
        }
        

        player.currentOxygen += this.oxygenAmount;
        player.currentOxygen = constrain(player.currentOxygen, 0, player.maxOxygen);
    }
}