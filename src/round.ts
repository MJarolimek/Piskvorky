enum Color {Empty, Red, Green}
enum Ver {Top, Bottom=2}
enum Hor {Left, Right}

export class Round
{
    readonly sizeMultiple = 128;
    readonly maxLevel:number;   //2^(maxLevel-1) = size of biggest stone; 2^(maxLevel)*sizeMultiple = size of biggest cell resp. playground
    private center:Point;
    private currentPlayer:number;
    private players:Array<Player>;
    private cell:Cell;

    constructor(playerId1:string, playerId2:string, maxLevel:number)
    {
        console.log("start game of: " + playerId1 + "; " + playerId2 + "; " + maxLevel);

        this.center = new Point();
        this.maxLevel = maxLevel;
        
        //players
        this.players = new Array();
        this.players.push(new Player(playerId1, Color.Red));
        this.players.push(new Player(playerId2, Color.Green));
        this.currentPlayer = 0;//todo random order

        //cells
        this.cell = new Cell(3, Math.pow(2, this.maxLevel) * this.sizeMultiple, undefined);
    }

    public nextPlayer()
    {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    public addStone(x:number, y:number):Cell
    {
        var size:number = Math.pow(2, this.players[this.currentPlayer].getLevel());
        var color = this.players[this.currentPlayer].color;

        x = Math.round(x - (Math.abs(Math.round(x)) % size));
        y = Math.round(y - (Math.abs(Math.round(y)) % size));

        var cellHalfSize = (Math.pow(2, this.maxLevel) * this.sizeMultiple)/2;
        if(x < -cellHalfSize || y < -cellHalfSize || x >= cellHalfSize || y >= cellHalfSize)
        {
            console.log("error: You try to put new stone out of playing area: "+ x + "; "+ y);
            return undefined;
        }
        
        var cell = this.cell.add(x, y, x + cellHalfSize, y + cellHalfSize, size, color);
    
        if(cell != undefined)
        {

            this.testWinRound(cell);
            this.nextPlayer();
            return cell;
        }
        else
        {
            console.log("error: You try to put new stone into full cell: "+ x + "; " + y);

            return undefined;
        }
    }

    public testWinRound(cell:Cell):boolean
    {
        var horizontal:Array<Cell>;
        horizontal = this.getLine(cell, new Point(-1,0)).reverse().concat([cell]).concat(this.getLine(cell, new Point(1,0)));

        var vertical:Array<Cell>;
        vertical = this.getLine(cell, new Point(0,-1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(0,1)));

        var diagonal:Array<Cell>;
        diagonal = this.getLine(cell, new Point(-1,-1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(1,1)));

        var antidiagonal:Array<Cell>;
        antidiagonal = this.getLine(cell, new Point(1,-1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(-1,1)));

        if(horizontal.length >= 5)
        {
            var winLine = horizontal;
        }
        else if(vertical.length >= 5)
        {
            var winLine = vertical;
        }
        else if(diagonal.length >= 5)
        {
            var winLine = diagonal;
        }
        else if(antidiagonal.length >= 5)
        {
            var winLine = antidiagonal;
        }

        if(winLine)
        {
            var str = "Player " + this.players[this.currentPlayer].id + " win: ";
            winLine.forEach(element => {
                str += element.originalPos.toString();
            });
            console.log(str);

            if(this.players[this.currentPlayer].getLevel() < this.maxLevel-1)
            {
                this.upgradeLevel();
            }
            else
            {
                console.log("Player " + this.players[this.currentPlayer].id + " win whole game!");
            }

            return true;
        }

        return false;
    }

    private getLine(cell:Cell, vec:Point):Array<Cell>
    {
        if(vec.x < 0 && vec.y < 0)
        {
            //get left up
            var A = (Ver.Bottom | Hor.Right);
            var B = -1;
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = (Ver.Top | Hor.Right);

            var dir = -3;
        }
        else if(vec.x > 0 && vec.y < 0)
        {
            //get right up
            var A = (Ver.Bottom | Hor.Left);
            var B = -1;
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);
            var E = (Ver.Top | Hor.Left);

            var dir = -1;
        }
        else if(vec.x < 0 && vec.y > 0)
        {
            //get left down
            var A = (Ver.Top | Hor.Right);
            var B = -1;
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = (Ver.Bottom | Hor.Right);
            
            var dir = 1;
        }
        else if(vec.x > 0 && vec.y > 0)
        {
            //get right down
            var A = (Ver.Top | Hor.Left);
            var B = -1;
            var C = (Ver.Bottom | Hor.Left);
            var D = (Ver.Bottom | Hor.Right);
            var E = (Ver.Top | Hor.Right);

            var dir = 3;
        }
        else if(vec.x < 0)
        {
            //get left
            var A = (Ver.Top | Hor.Right);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = -1;

            var dir = -1;
        }
        else if(vec.x > 0)
        {
            //get right
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Bottom | Hor.Left);
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);
            var E = -1;

            var dir = 1;
        }
        else if(vec.y < 0)
        {
            //get up
            var A = (Ver.Bottom | Hor.Left);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Top | Hor.Right);
            var E = -1;
            
            var dir = -2;
        }
        else if(vec.y > 0)
        {
            //get down
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Top | Hor.Right);
            var C = (Ver.Bottom | Hor.Left);
            var D = (Ver.Bottom | Hor.Right);
            var E = -1;

            var dir = 2;
        }

        var color = cell.getColor();
        var buffer = new Array();

        for(var i=0; i < 4; i++)    //4 iteration
        {
            var index = cell.index;
            
            if(index == A || index == B) //in same parent
            {
                cell = cell.parent.children[index+dir];

                if(cell && color == cell.getColor())    //same color
                {
                    buffer.push(cell);
                }
                else    //empty or different color
                {
                    return buffer;
                }
            }
            else    //in different parent
            {
                var counter = 0;

                //go up in tree
                while(cell.index == C || cell.index == D || cell.index == E)
                {
                   if(cell.parent.parent)
                   {
                       counter++;
                       cell = cell.parent;
                   }
                   else
                   {
                        return buffer;  //finish in root
                   }
                }

                //go right from current cell
                cell = cell.parent.children[cell.index+dir];

                if(!cell || cell.getColor() != Color.Empty)
                {
                    return buffer;
                }

                //go down in tree
                while(counter > 1)
                {
                    counter--;
                    cell = cell.children[index-dir];
                    if(!cell || cell.getColor() != Color.Empty)
                    {
                        return buffer;
                    }
                }
                
                //leaf
                cell = cell.children[index-dir];
                if(cell && color == cell.getColor())
                {
                    buffer.push(cell);
                }
                else    //empty or different color
                {
                    return buffer;
                }
            }
        }
        return buffer;
    }

    private upgradeLevel()
    {
        var size = Math.pow(2, this.players[this.currentPlayer].levelUp());
        var color = this.players[this.currentPlayer].color;

        //add all potential cells to array
        var queue:Array<Cell> = new Array();
        queue = this.getChildrenOfSize(this.cell, size);

        //assorted to win and pat Cells
        var winCells:Array<Cell> = new Array();
        var patCells:Array<Cell> = new Array();
    
        queue.forEach(cell => 
        {
           var counter1 = 0;
           var counter2 = 0;
           var originalPos;

           for(var i=0; i < 4; i++)
           {
                if(cell.children[i] && cell.children[i].originalPos)
                {
                    if(cell.children[i].getColor() == color)
                    {
                        counter1++;
                    }
                    else
                    {
                        counter2++;
                    }

                    if(originalPos == undefined)
                    {
                        var x = cell.children[i].originalPos.x - (i%2)*cell.children[i].size;            //offset x position from child 
                        var y = cell.children[i].originalPos.y - Math.floor(i/2)*cell.children[i].size;  //offset y position from child 
                        originalPos = new Point(x, y);
                    }
                }
           }

           if(counter1 > counter2)  //win
           {
               cell.setColor(color);
               cell.originalPos = originalPos;
               winCells.push(cell);
           }
           else if(counter1 == counter2 && counter1 > 0)    //pat and almost one cell is full on curent size
           {
                cell.originalPos = originalPos; //todo remove - only cells with not empty color has originalPos
                patCells.push(cell);
           } 
        });

        var str = "All win cells: ";
        winCells.forEach(element => {
            str += element.originalPos.toString();
        });
        console.log(str);

        var str = "All pat cells: ";
        patCells.forEach(element => {
            str += element.originalPos.toString();
        });
        console.log(str);
    }

    private getChildrenOfSize(cell:Cell, size:number):Array<Cell>
    {
        if(cell && cell.getColor() == Color.Empty)
        {
            if(cell.size > size) //bigger
            {
                return this.getChildrenOfSize(cell.children[0], size).concat(this.getChildrenOfSize(cell.children[1], size)).concat(this.getChildrenOfSize(cell.children[2], size)).concat(this.getChildrenOfSize(cell.children[3], size));
            }
            else
            {
                return [cell];
            }
        }
        else    //empty
        {
            return [];
        }
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

    public toString():string
    {
        return "["+this.x+"; "+this.y+"]";
    }
}


class Cell
{
    readonly index:number;
    readonly size:number;
    readonly parent:Cell;
    private color:Color = Color.Empty;
    public children:Array<Cell>;
    public originalPos:Point;

    constructor(index:number, size:number, parent:Cell)
    {
        //console.log("Cell: " + index + "; " + size);
        this.index = index;
        this.size = size;
        this.parent = parent;
        this.children = new Array();
    }

    public add(originalX:number, originalY:number, x:number, y:number, size:number, color:Color):Cell
    {
        //console.log("add(" + x + ", " + y + ", " + size + ", " + color+")");
        if(size == this.size)   //stone cover full cell
        {
            if(this.color == Color.Empty && this.children.length == 0)  //cel has to has no children
            {
                this.color = color;
                this.originalPos = new Point(originalX, originalY);
                return this;
            }
            else
            {
                return undefined;
            }
        }
        
        var cellHalfSize =  this.size/2;
        if(x < cellHalfSize)   //left
        {
            if(y < cellHalfSize)   //top
            {
                var childIndex = 0;
                var offsetY = 0;
            }
            else    //bottom
            {
                var childIndex = 2;
                var offsetY = cellHalfSize;
            }
            var offsetX = 0;
        }
        else    //right
        {
            if(y < cellHalfSize)   //top
            {
                var childIndex = 1;
                var offsetY = 0;
            }
            else    //bottom
            {
                var childIndex = 3;
                var offsetY = cellHalfSize;
            }
            var offsetX = cellHalfSize;
        }

        if(this.children[childIndex] == undefined)    //create child
        {
            var child = new Cell(childIndex, cellHalfSize, this);
            this.children[childIndex] = child;
        }
        
        return this.children[childIndex].add(originalX, originalY, x - offsetX, y - offsetY, size, color);
    }

    public getColor():Color
    {
        return this.color;
    }

    public setColor(color:Color)
    {
        this.color = color;
    }

}

export class Player
{
    private level:number;
    readonly id:string;
    readonly color:Color; 

    constructor(id:string, color)
    {
        this.id = id;
        this.level = 0;
        this.color = color;
    }

    public levelUp():number
    {
        this.level++;
        return this.level;
    }

    public getLevel():number
    {
       return this.level;
    }
}

/*



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

*/