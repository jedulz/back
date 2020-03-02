

class Family{
    constructor(x,y,dx){
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.width = familyAttrs.width;
        this.height = familyAttrs.height;
        this.dy = 0;
        this.food = 10;
        this.health = 1;
        this.right = true;
        this.left = false;
        if(this.dx == 0){
            this.dx++;
        }
    }

    draw(){
        if(this.dx > 0){
            ctx.drawImage(porcupine,0, 0, 256, 256, this.x-this.width+10, this.y-this.height+5,this.width*3,this.height*3);
        }
        else{
            ctx.drawImage(porcupine, 256, 0, 512, 256, this.x-this.width-10, this.y-this.height+5, this.width*6, this.height*3);
        }
        //draw food
        // let berries = '';
        // for(let i = 0; i < this.food; i++){
        //     berries += '🍓';
        // }
        // ctx.font = "12px Arial";
        // ctx.fillStyle = 'white';
        // ctx.textAlign = 'left';
        // ctx.fillText(berries, this.x, this.y);
    }

    update(){
        if(this.x + this.width > canvas.width || this.x < 30){
            this.dx *= -1;
        }

        this.x += this.dx;
        this.food -= 0.008;

        //if the family hit the storage gives food
        if(hitSquare(this, stockPile) && stockPile.food > 0 && this.food < 10){
            stockPile.food--;
            this.food++;
            
        }
        if(this.x + this.width <= stockPile.x){
            //take one away from stockpile
            stockPile.food--;
            this.food++;
            //add one food

        }
    }
}