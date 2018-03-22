enum Color {Red, Green}

class Round
{
    readonly maxLevel:number;
    private center:Point;
    private currentPlayer:number;
    private players:Array<Player>;

    constructor(playerId1:string, playerId2:string, maxLevel:number)
    {
        this.center = new Point();

        this.players = new Array();
        this.players.push(new Player(playerId1));
        this.players.push(new Player(playerId2));
        this.currentPlayer = 0;//todo random order
    }

    public nextPlayer()
    {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    public addStone(x:number,y:number)
    {
        var size:number = this.players[this.currentPlayer].getLevel();
        var color = this.currentPlayer;

        //test empty space
        var stone = new Stone(x, y, size, color);
        //add to
    }

    getAllStones()
    {

    }
}

class Point
{
    public x:number = 0;
    public y:number = 0;

    constructor(x?:number, y?:number)
    {
        this.x = x;
        this.y = y;
    }
}

class Stone
{
    private x:number;
    private y:number;
    private size:number;
    private color:Color;

    constructor(x:number, y:number, size:number, color:Color)
    {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }


}

class Player
{
    private level:number;
    readonly id:string;

    constructor(id:string)
    {
        this.id = id;
        this.level = 0;
    }

    public levelUp()
    {
        this.level++;
    }

    public getLevel():number
    {
       return this.level;
    }
}







klik na tlacitko start
vykresli grid
vykresli animovane kameny
getAllStones()
vykresli animovane pouzitelna pole
getFullPlaces()
interaktivni faze
addStone()
otestuj dohrani kola
testFinish()
zmen aktivniho hrace