
class Player{
    constructor(){
        this.width = 50;
        this.height = 50;
        this.x = 100;
        this.y = familyAttrs.y;
        this.dx = 0;
        this.dy = 0;
        this.moveRight = false;
        this.moveLeft = false;
        this.right = true;
        this.left = false;
        this.jumped = false;
        this.spikeSize = 30;
        this.health = 5;
        this.food = 10;
        this.inBurrow = true;
        this.backDamage = 10;
        this.spikeDamage = 5;
    }

    draw(){
        //draw player stats
        ctx.font = "30px Arial";
        
        let hearts = 'Health: ';
        let berries = 'Food: ';
        for(let i = 0; i < this.health; i++){
            hearts += '❤️';
        }        
        for(let i = 0; i < this.food; i++){
            berries += '🍓';
        }
        ctx.fillText(hearts, 10, 50);
        ctx.fillText(berries, 10, 100);

        if(this.right){
            ctx.drawImage(porcupine,0, 0, 256, 256, this.x-this.width+10, this.y-this.height+5,this.width*3,this.height*3);
        }
        else if(this.left){
            ctx.drawImage(porcupine, 256, 0, 512, 256, this.x-this.width-10, this.y-this.height+5, this.width*6, this.height*3);
        }
    }

    update(){
        
        //drop food by one
        this.food -= 0.01;

        //if not on ground
        if(this.y + this.height < ground){
            this.dy += gravity;
            this.y += this.dy;
        }
        if(this.jumped){
            this.y += this.dy;
        }
        //if below ground and not in burrow
        if(this.y + this.height > ground && !this.inBurrow){
            this.jumped = false;
            // to not get stuck in the ground
            this.y = ground - this.height;
        }

        //move in the direction of the keydown
        this.x += this.dx;


        // keep within the canvas
        if (this.x < 0){
          this.x = 0;
        }
        else if (this.x + this.width > game.width){
          this.x = game.width - this.width;
        }


        //check to see if in burrow
        if(this.inBurrow){
            this.y = familyAttrs.y;
        }

        //if player is in stockpile
        if(hitSquare(this, stockPile) && this.food > 10){
            this.food--;
            stockPile.food++;
        }
    }

    jump(){
        if(!this.inBurrow){
            this.dy = -10;
            this.jumped = true;
        }else if(this.x > burrowOpening.x && this.x < burrowOpening.x + burrowOpening.width && this.inBurrow){
            this.inBurrow = false;
            this.y = ground;
        }
    }

    fall(){
      // can only fall when rising
      if (this.dy < 0 && !this.inBurrow){
        this.dy = this.dy * 0.2; // setting it to zero made it too...magentic
      }
    }

    moveDown(){
        //if over the burrow opening
        if(this.x > burrowOpening.x && this.x < burrowOpening.x + burrowOpening.width){
            this.inBurrow = true;
        }
    }

    shoot(){
        let direction;
        if(this.right){
            direction = 'right';
        }else{
            direction = 'left';
        }
        bulletArray.push(new Bullet(this.x, this.y + this.height/2, direction));
        this.food--;
    }

}