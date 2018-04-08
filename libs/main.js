//ENUMS
var Color;
(function (Color) {
    Color[Color["Empty"] = 0] = "Empty";
    Color[Color["Red"] = 1] = "Red";
    Color[Color["Green"] = 2] = "Green";
})(Color || (Color = {}));
var Ver;
(function (Ver) {
    Ver[Ver["Top"] = 0] = "Top";
    Ver[Ver["Bottom"] = 2] = "Bottom";
})(Ver || (Ver = {}));
var Hor;
(function (Hor) {
    Hor[Hor["Left"] = 0] = "Left";
    Hor[Hor["Right"] = 1] = "Right";
})(Hor || (Hor = {}));
var Keycode;
(function (Keycode) {
    Keycode[Keycode["Left"] = 65] = "Left";
    Keycode[Keycode["Right"] = 68] = "Right";
    Keycode[Keycode["Up"] = 87] = "Up";
    Keycode[Keycode["Down"] = 83] = "Down";
    Keycode[Keycode["ZoomIn"] = 73] = "ZoomIn";
    Keycode[Keycode["ZoomOut"] = 79] = "ZoomOut";
})(Keycode || (Keycode = {}));
var Status;
(function (Status) {
    Status[Status["Menu"] = 0] = "Menu";
    Status[Status["Ingame"] = 1] = "Ingame";
})(Status || (Status = {}));
//CONST
var cellSize = 32; //size of basic cell in pixels
var sizeMultiple = 128; //2^(maxLevel-1) = size of biggest stone; 2^(maxLevel)*sizeMultiple = size of biggest cell resp. board
var Cell = /** @class */ (function () {
    function Cell(index, size, parent) {
        this.color = Color.Empty;
        //console.log("Cell: " + index + "; " + size);
        this.index = index;
        this.size = size;
        this.parent = parent;
        this.children = new Array();
    }
    Cell.prototype.add = function (originalX, originalY, x, y, size, color) {
        //console.log("add(" + x + ", " + y + ", " + size + ", " + color+")");
        if (size == this.size) {
            if (this.color == Color.Empty && this.children.length == 0) {
                this.color = color;
                this.originalPos = new Point(originalX, originalY);
                return this;
            }
            else {
                return undefined;
            }
        }
        var cellHalfSize = this.size / 2;
        if (x < cellHalfSize) {
            if (y < cellHalfSize) {
                var childIndex = 0;
                var offsetY = 0;
            }
            else {
                var childIndex = 2;
                var offsetY = cellHalfSize;
            }
            var offsetX = 0;
        }
        else {
            if (y < cellHalfSize) {
                var childIndex = 1;
                var offsetY = 0;
            }
            else {
                var childIndex = 3;
                var offsetY = cellHalfSize;
            }
            var offsetX = cellHalfSize;
        }
        if (this.children[childIndex] == undefined) {
            var child = new Cell(childIndex, cellHalfSize, this);
            this.children[childIndex] = child;
        }
        return this.children[childIndex].add(originalX, originalY, x - offsetX, y - offsetY, size, color);
    };
    Cell.prototype.getColor = function () {
        return this.color;
    };
    Cell.prototype.setColor = function (color) {
        this.color = color;
    };
    Cell.prototype.toString = function () {
        return "{" + this.index + ", color:" + this.color + "; size:" + this.size + "; originalPos:" + this.originalPos.toString() + "}";
    };
    return Cell;
}());
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    Point.prototype.toString = function () {
        return "[" + this.x + "; " + this.y + "]";
    };
    return Point;
}());
var Rectangle = /** @class */ (function () {
    function Rectangle(x, y, width, height) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Rectangle.prototype.toString = function () {
        return "[" + this.x + "; " + this.y + "; " + this.width + "; " + this.height + "]";
    };
    return Rectangle;
}());
var Player = /** @class */ (function () {
    function Player(id, color) {
        this.id = id;
        this.level = 0;
        this.color = color;
    }
    Player.prototype.levelUp = function () {
        this.level++;
        return this.level;
    };
    Player.prototype.getLevel = function () {
        return this.level;
    };
    return Player;
}());
var Round = /** @class */ (function () {
    function Round(playerId1, playerId2, maxLevel) {
        console.log("start game of: " + playerId1 + "; " + playerId2 + "; " + maxLevel);
        this.maxLevel = maxLevel;
        //players
        this.players = new Array();
        this.players.push(new Player(playerId1, Color.Red));
        this.players.push(new Player(playerId2, Color.Green));
        this.currentPlayer = 0; //todo random order
        //cells
        this.cell = new Cell(3, Math.pow(2, this.maxLevel) * sizeMultiple, undefined);
    }
    Round.prototype.nextPlayer = function () {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    };
    Round.prototype.setWindow = function (windowX, windowY, windowWidth, windowHeight) {
        this.window = new Rectangle(windowX, windowY, windowWidth, windowHeight);
        var result = this.getVisibleStones(this.cell, this.window);
        console.log("visible " + result.length + " cells: " + result.toString());
        return result;
    };
    Round.prototype.updateWindow = function (windowX, windowY, windowWidth, windowHeight) {
        var addStones = new Array();
        var removeStones = new Array();
        var newWindow = new Rectangle(windowX, windowY, windowWidth, windowHeight);
        if (!this.window) {
            this.window = new Rectangle(0, 0, 0, 0);
        }
        var result = this.getVisibleStonesIncrement(this.cell, newWindow);
        console.log("add " + result[0].length + " cells: " + result[0].toString());
        console.log("remove " + result[1].length + " cells: " + result[1].toString());
        this.window = newWindow;
        return result;
    };
    Round.prototype.getVisibleStones = function (cell, newWindow) {
        if (cell) {
            if (cell.getColor() != Color.Empty) {
                //is out
                if (cell.originalPos.x + cell.size < newWindow.x || cell.originalPos.y + cell.size < newWindow.y ||
                    cell.originalPos.x > newWindow.x + newWindow.width || cell.originalPos.y > newWindow.y + newWindow.height) {
                    cell.inWindow = false;
                    return [];
                }
                else {
                    cell.inWindow = true;
                    return [cell];
                }
            }
            else {
                var stones = new Array();
                for (var i = 0; i < 4; i++) {
                    if (cell.children[i]) {
                        stones = stones.concat(this.getVisibleStones(cell.children[i], newWindow));
                    }
                }
                return stones;
            }
        }
        return [];
    };
    Round.prototype.getVisibleStonesIncrement = function (cell, newWindow) {
        if (cell) {
            if (cell.getColor() != Color.Empty) {
                //is out
                if (cell.originalPos.x + cell.size < newWindow.x || cell.originalPos.y + cell.size < newWindow.y ||
                    cell.originalPos.x > newWindow.x + newWindow.width || cell.originalPos.y > newWindow.y + newWindow.height) {
                    if (cell.inWindow) {
                        cell.inWindow = false;
                        return [[], [cell]];
                    }
                    else {
                        return [[], []];
                    }
                }
                else {
                    if (!cell.inWindow) {
                        cell.inWindow = true;
                        return [[cell], []];
                    }
                    else {
                        return [[], []];
                    }
                }
            }
            else {
                var addStones = new Array();
                var removeStones = new Array();
                for (var i = 0; i < 4; i++) {
                    if (cell.children[i]) {
                        var arrays = this.getVisibleStonesIncrement(cell.children[i], newWindow);
                        addStones = addStones.concat(arrays[0]);
                        removeStones = removeStones.concat(arrays[1]);
                    }
                }
                return [addStones, removeStones];
            }
        }
        return [[], []];
    };
    Round.prototype.addStone = function (x, y) {
        var size = Math.pow(2, this.players[this.currentPlayer].getLevel());
        var color = this.players[this.currentPlayer].color;
        x = Math.round(x - (Math.abs(Math.round(x)) % size));
        y = Math.round(y - (Math.abs(Math.round(y)) % size));
        var cellHalfSize = (Math.pow(2, this.maxLevel) * sizeMultiple) / 2;
        if (x < -cellHalfSize || y < -cellHalfSize || x >= cellHalfSize || y >= cellHalfSize) {
            console.log("error: You try to put new stone out of playing area: " + x + "; " + y);
            return undefined;
        }
        var cell = this.cell.add(x, y, x + cellHalfSize, y + cellHalfSize, size, color);
        if (cell != undefined) {
            this.testWinRound(cell);
            this.nextPlayer();
            return cell;
        }
        else {
            console.log("error: You try to put new stone into full cell: " + x + "; " + y);
            return undefined;
        }
    };
    Round.prototype.testWinRound = function (cell) {
        var horizontal;
        horizontal = this.getLine(cell, new Point(-1, 0)).reverse().concat([cell]).concat(this.getLine(cell, new Point(1, 0)));
        var vertical;
        vertical = this.getLine(cell, new Point(0, -1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(0, 1)));
        var diagonal;
        diagonal = this.getLine(cell, new Point(-1, -1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(1, 1)));
        var antidiagonal;
        antidiagonal = this.getLine(cell, new Point(1, -1)).reverse().concat([cell]).concat(this.getLine(cell, new Point(-1, 1)));
        if (horizontal.length >= 5) {
            var winLine = horizontal;
        }
        else if (vertical.length >= 5) {
            var winLine = vertical;
        }
        else if (diagonal.length >= 5) {
            var winLine = diagonal;
        }
        else if (antidiagonal.length >= 5) {
            var winLine = antidiagonal;
        }
        if (winLine) {
            var str = "Player " + this.players[this.currentPlayer].id + " win: ";
            winLine.forEach(function (element) {
                str += element.originalPos.toString();
            });
            console.log(str);
            if (this.players[this.currentPlayer].getLevel() < this.maxLevel - 1) {
                this.upgradeLevel();
            }
            else {
                console.log("Player " + this.players[this.currentPlayer].id + " win whole game!");
            }
            return true;
        }
        return false;
    };
    Round.prototype.getLine = function (cell, vec) {
        if (vec.x < 0 && vec.y < 0) {
            //get left up
            var A = (Ver.Bottom | Hor.Right);
            var B = -1;
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = (Ver.Top | Hor.Right);
            var dir = -3;
        }
        else if (vec.x > 0 && vec.y < 0) {
            //get right up
            var A = (Ver.Bottom | Hor.Left);
            var B = -1;
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);
            var E = (Ver.Top | Hor.Left);
            var dir = -1;
        }
        else if (vec.x < 0 && vec.y > 0) {
            //get left down
            var A = (Ver.Top | Hor.Right);
            var B = -1;
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = (Ver.Bottom | Hor.Right);
            var dir = 1;
        }
        else if (vec.x > 0 && vec.y > 0) {
            //get right down
            var A = (Ver.Top | Hor.Left);
            var B = -1;
            var C = (Ver.Bottom | Hor.Left);
            var D = (Ver.Bottom | Hor.Right);
            var E = (Ver.Top | Hor.Right);
            var dir = 3;
        }
        else if (vec.x < 0) {
            //get left
            var A = (Ver.Top | Hor.Right);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Bottom | Hor.Left);
            var E = -1;
            var dir = -1;
        }
        else if (vec.x > 0) {
            //get right
            var A = (Ver.Top | Hor.Left);
            var B = (Ver.Bottom | Hor.Left);
            var C = (Ver.Top | Hor.Right);
            var D = (Ver.Bottom | Hor.Right);
            var E = -1;
            var dir = 1;
        }
        else if (vec.y < 0) {
            //get up
            var A = (Ver.Bottom | Hor.Left);
            var B = (Ver.Bottom | Hor.Right);
            var C = (Ver.Top | Hor.Left);
            var D = (Ver.Top | Hor.Right);
            var E = -1;
            var dir = -2;
        }
        else if (vec.y > 0) {
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
        for (var i = 0; i < 4; i++) {
            var index = cell.index;
            if (index == A || index == B) {
                cell = cell.parent.children[index + dir];
                if (cell && color == cell.getColor()) {
                    buffer.push(cell);
                }
                else {
                    return buffer;
                }
            }
            else {
                var counter = 0;
                //go up in tree
                while (cell.index == C || cell.index == D || cell.index == E) {
                    if (cell.parent.parent) {
                        counter++;
                        cell = cell.parent;
                    }
                    else {
                        return buffer; //finish in root
                    }
                }
                //go right from current cell
                cell = cell.parent.children[cell.index + dir];
                if (!cell || cell.getColor() != Color.Empty) {
                    return buffer;
                }
                //go down in tree
                while (counter > 1) {
                    counter--;
                    cell = cell.children[index - dir];
                    if (!cell || cell.getColor() != Color.Empty) {
                        return buffer;
                    }
                }
                //leaf
                cell = cell.children[index - dir];
                if (cell && color == cell.getColor()) {
                    buffer.push(cell);
                }
                else {
                    return buffer;
                }
            }
        }
        return buffer;
    };
    Round.prototype.upgradeLevel = function () {
        var size = Math.pow(2, this.players[this.currentPlayer].levelUp());
        var color = this.players[this.currentPlayer].color;
        //add all potential cells to array
        var queue = new Array();
        queue = this.getChildrenOfSize(this.cell, size);
        //assorted to win and pat Cells
        var winCells = new Array();
        var patCells = new Array();
        queue.forEach(function (cell) {
            var counter1 = 0;
            var counter2 = 0;
            var originalPos;
            for (var i = 0; i < 4; i++) {
                if (cell.children[i] && cell.children[i].originalPos) {
                    if (cell.children[i].getColor() == color) {
                        counter1++;
                    }
                    else {
                        counter2++;
                    }
                    if (originalPos == undefined) {
                        var x = cell.children[i].originalPos.x - (i % 2) * cell.children[i].size; //offset x position from child 
                        var y = cell.children[i].originalPos.y - Math.floor(i / 2) * cell.children[i].size; //offset y position from child 
                        originalPos = new Point(x, y);
                    }
                }
            }
            if (counter1 > counter2) {
                cell.setColor(color);
                cell.originalPos = originalPos;
                winCells.push(cell);
            }
            else if (counter1 == counter2 && counter1 > 0) {
                cell.originalPos = originalPos; //todo remove - only cells with not empty color has originalPos
                patCells.push(cell);
            }
        });
        var str = "All win cells: ";
        winCells.forEach(function (element) {
            str += element.originalPos.toString();
        });
        console.log(str);
        var str = "All pat cells: ";
        patCells.forEach(function (element) {
            str += element.originalPos.toString();
        });
        console.log(str);
    };
    Round.prototype.getChildrenOfSize = function (cell, size) {
        if (cell && cell.getColor() == Color.Empty) {
            if (cell.size > size) {
                return this.getChildrenOfSize(cell.children[0], size).concat(this.getChildrenOfSize(cell.children[1], size)).concat(this.getChildrenOfSize(cell.children[2], size)).concat(this.getChildrenOfSize(cell.children[3], size));
            }
            else {
                return [cell];
            }
        }
        else {
            return [];
        }
    };
    return Round;
}());
var Board = /** @class */ (function () {
    function Board(maxLevel) {
        this.zoomLevel = 1;
        this.maxZoomLevel = maxLevel + 1;
        this.isStable = true;
        this.centerPoint = new Point();
        this.zoomLevelNew = 1;
        this.centerPointNew = new Point();
    }
    Board.prototype.move = function (xDir, yDir) {
        console.log("move(" + xDir + ", " + yDir + ")");
        this.centerPointNew.x += xDir;
        this.centerPointNew.y += yDir;
    };
    Board.prototype.zoom = function (dir) {
        console.log("zoom(" + dir + ")");
        if (dir < 0) {
            if (this.zoomLevelNew + 1 > this.maxZoomLevel) {
                this.zoomLevelNew = this.maxZoomLevel;
            }
            else {
                this.zoomLevelNew += 1;
            }
        }
        else if (dir > 0) {
            if (this.zoomLevelNew - 1 < 1) {
                this.zoomLevelNew = 1;
            }
            else {
                this.zoomLevelNew -= 1;
            }
        }
        this.isStable = false;
        console.log("new zoom level (" + this.zoomLevelNew + ")");
    };
    Board.prototype.update = function () {
        this.zoomLevel = (this.zoomLevel + this.zoomLevelNew) / 2;
        if (Math.abs(this.zoomLevel - this.zoomLevelNew) < 0.001) {
            this.zoomLevel = this.zoomLevelNew;
            this.isStable = true;
        }
    };
    Board.prototype.setScale = function (scale) {
        //test boundaris 1 and maxZoomLevel
        var zoomLevelNew = Math.log(1 / scale) + 1;
        if (zoomLevelNew > this.maxZoomLevel) {
            this.zoomLevelNew = this.maxZoomLevel;
        }
        else if (zoomLevelNew < 0) {
            this.zoomLevelNew = 0;
        }
        else {
            this.zoomLevelNew = zoomLevelNew;
        }
        this.isStable = false;
    };
    Board.prototype.setPosition = function (position) {
        //test
    };
    Board.prototype.getScale = function () {
        return 1 / (Math.pow(2, this.zoomLevel - 1));
    };
    Board.prototype.getPosition = function () {
        return this.centerPoint;
    };
    return Board;
}());
//resolution of Round in cells
//resoulution of Board in pixels, 1 cell has constant size in px (32)
//resolution of screen in pixels, between game and windo is zoom, zoom=1 mean game=window, minimal zoom = 1/maxLevel 
