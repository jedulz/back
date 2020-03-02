/*
    Add a location to store the food
*/
class StockPile{
    constructor(){
        this.width = burrowOpening.width;
        this.height = burrowOpening.height*3;
        this.x = 30;
        this.y = canvas.height-this.height;
        this.food = 10;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
        //draw the food
        ctx.font = "30px Arial bold";
        ctx.fillStyle = "white";
        ctx.fillText('Storage:', this.x, this.y+20);
        ctx.fillText('🍓 x' + this.food, this.x, this.y+this.height/2);
    }

    addFood(){

    }
}