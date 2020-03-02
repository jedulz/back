
class Enemy{
    constructor(x, dx){
        this.width = 100;
        this.height = 200;
        this.x = x;
        this.y = ground - this.height;
        this.dx = dx;
        this.dy = 0;
        this.food = 2;
    }

    draw(){
        if(this.dx > 0){
            ctx.drawImage(bear, 272, 0, 544, 272, this.x-50, this.y, this.width*4, this.height);
        }
        else{
            ctx.drawImage(bear, 0, 0, 272, 272, this.x-50, this.y, this.width*2, this.height);
        }
    }

    update(){
        this.x += this.dx;

        //increase speed in relation to how much food the player is holding
        let temp = this.dx;
        this.dx = 0;
        for (let i = 0; i < player.food; i++) {
            if(temp > 0){
                this.dx += 1;
            }else{
                this.dx -= 1;
            }
            
        }

        if(this.food != 0){
            for (let i = 0; i < foodArray.length; i++) {
                if(hitDot(this, foodArray[i])){
                    this.food--;
                    foodArray.splice(i, 1);
                }
            }
        }
    }
}