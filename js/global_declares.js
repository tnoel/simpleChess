// Some global objects
var allPieces = new Array;
var turn = 0;
var castling = [[1,1],[1,1]]; // whether castling is allowed for white/black and queen/king sides
var castleFlag = -1; // A flag for the rule check to throw if the move is a castling move
var board_flipped = 0;
var raged = 0;
var enPassantFlag = -1; // flag if enPassant is possible
