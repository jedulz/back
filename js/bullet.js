class Bullet{
    constructor(x,y, direction){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.direction = direction;
        this.dx = 0;
    }
    update(){
        if(this.direction == 'right'){
            this.dx = 10;
        }else{
            this.dx = -10;
        }

        this.x += this.dx;
    }
    draw(){
        ctx.font = "30px Arial";
        ctx.fillText('🍓', this.x, this.y);
    }
}