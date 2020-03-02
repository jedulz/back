class Food{
    constructor(x,y,radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    draw(){
        ctx.fillText('🍓', this.x-this.radius, this.y+this.radius);
    }
}