// Some global objects
var allPieces = new Array;
var turn = 0;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
board_size=640;
edge_size=2;
square_size=board_size/8;
canvas.width = board_size+2*edge_size;
canvas.height = canvas.width;
document.body.appendChild(canvas);
canvas.addEventListener("click",boardClick,false);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background_bw.png";

// Some book keeping for the pieces
colors=["white","black"];
ncolors=colors.length; //obviously 2...
piece_types=["pawn","bishop","knight","rook","queen","king"];
npiece_types=piece_types.length;

// list of paths for piece images
var imag_paths = new Array(ncolors);
for (var ci=0;ci<ncolors;ci++){
  imag_paths[ci] = new Array(npiece_types)
  for (var pi=0;pi<npiece_types;pi++){
    temp_path = "images/";
    temp_path = temp_path.concat(colors[ci],"_",piece_types[pi],".png");
    imag_paths[ci][pi]=temp_path;
  }
}

// functions for getting x and y values from file/rank
x = function() {
  return this.file*square_size + edge_size;
};
y = function() {
  return this.rank*square_size + edge_size;
};

// Selection object (for highlighting the selected square
function select_class() {
  this.made=0; // whether a selection has been made
  this.image = new Image()
  this.image.src = "images/highlight.png"
  this.file=0;
  this.rank=0;
  this.color=0;
  this.pi=0;
  this.x = x;
  this.y = y;
  this.select = function(color,pi){
    this.file=allPieces[color][pi].file;
    this.rank=allPieces[color][pi].rank;
    this.color=color;
    this.pi=pi;
    this.made=1;
  }
};

// Piece class
function piece(color,type,file,rank) {
  this.color=color;
  this.type=type;
  this.file=file;
  this.rank=rank;
  this.image = new Image();
  this.image.src = imag_paths[color][type];
  this.x = x;
  this.y = y;
  this.move = function(square) {
    this.file=square.file;
    this.rank=square.rank;
  };
  this.capture = function() {
    this.file=-2; // Just move the piece off the playable area
    this.rank=-2;
  }
  this.changeType = function(newType) {
    this.type=newType;
    this.image.src = imag_paths[this.color][newType];
  }
}

function getCursorPosition(e) {
  // hopefully return the .file and .rank of the clicked square
  var x;
  var y;
  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  }
  else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= canvas.offsetLeft+edge_size+1; // the 1 and 2 are fudge factors I haven't figured out
  y -= canvas.offsetTop+edge_size+2;
  x = Math.min(x, board_size);
  y = Math.min(y, board_size);
  var square = { file: Math.floor(x/square_size), rank:Math.floor(y/square_size)}
  return square;
};

function checkForPiece(square,color) {
  // function to check whether a piece is on a square
  for (var pi=0;pi<16;pi++) {
    if (allPieces[color][pi].rank == square.rank && allPieces[color][pi].file == square.file) {
      // we have a match!
      return pi;
    }
  }
  // if we've made it this far without a match, no selection.
  return -1;
};

function checkPawnPromote(color,pi) {
  // check if pawn should be promoted, and if so promote it
  curRank=allPieces[color][pi].rank;
  if (curRank == 7*color) {
    // it has reached the opposite rank, promote the sucker.
    var promote_type=$('#promote_dialog').dialog("open"); // launches dialog and changes piece type
  }
}

function boardClick(e) {
  var square = getCursorPosition(e);
  if (square.file < 0 || square.file > 7 || square.rank < 0 || square.rank > 7){
    return;
  }

  if (selection.made) {
    // selection was already made, move a piece, or the selection
    // First check for re-selection
    matched_pi=checkForPiece(square,turn);
    if (matched_pi >= 0) {
      selection.select(turn,matched_pi);
      return;
    }
    // TODO: Check legality of move
    ruleResult = isMoveLegal(allPieces[selection.color][selection.pi].type,selection.file,selection.rank,square.file, square.rank);
    if (ruleResult == 0){ return; }
    // TODO: Check for special moves - promotion, castling
    // Next check for capture
    matched_pi=checkForPiece(square,1-turn);
    if (matched_pi >= 0) {
      // Capture a piece!
      allPieces[1-turn][matched_pi].capture();
      // // // The crux of the game!! piece becomes what it captured! // // //
      if (allPieces[turn][selection.pi].type != 5){ // not a king
	allPieces[turn][selection.pi].changeType(allPieces[1-turn][matched_pi].type);
      }
    }
    // Move selected piece
    old_pos.select(selection.color,selection.pi);
    allPieces[turn][selection.pi].move(square);
    new_pos.select(selection.color,selection.pi);
    selection.made=0;
    if (allPieces[turn][selection.pi].type == 0){
      checkPawnPromote(turn,selection.pi);
    }
    // switch turn
    turn=1-turn;

  } else {
    // Fresh selection. Check if piece is here.
    matched_pi=checkForPiece(square,turn); // use turn for color to match
    if (matched_pi >= 0) {
      selection.select(turn,matched_pi);
    }
  }
  //selection.select(square.file,square.rank);
}

var reset = function () {
  // reset selection objects
  window.selection = new select_class();
  window.new_pos = new select_class(); // highlight last piece moved
  window.old_pos = new select_class(); // highlight previous position of last piece moved

  // reset/initialize pieces
  for (var ci=0;ci<ncolors;ci++){
    allPieces[ci] = new Array(16);
    piece_rank = 7*(1-ci); // Assuming white on bottom
    pawn_rank = piece_rank + 2*ci - 1; // hacky hacky hacky
    for (var pi=0;pi<8;pi++){
      // First 8 are pawns
      allPieces[ci][pi] = new piece(ci,0,pi,pawn_rank);
    }
    // The rest just do by hand
    allPieces[ci][8]  = new piece(ci,1,2,piece_rank); // q's bishop
    allPieces[ci][9]  = new piece(ci,1,5,piece_rank); // k's bishop
    allPieces[ci][10] = new piece(ci,2,1,piece_rank); // q's knight
    allPieces[ci][11] = new piece(ci,2,6,piece_rank); // k's knight
    allPieces[ci][12] = new piece(ci,3,0,piece_rank); // q's rook
    allPieces[ci][13] = new piece(ci,3,7,piece_rank); // k's rook
    allPieces[ci][14] = new piece(ci,4,3,piece_rank); // q
    allPieces[ci][15] = new piece(ci,5,4,piece_rank); // k
  }

  render();
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (selection.made){
	  ctx.drawImage(selection.image,selection.x(),selection.y());
	}
	if (old_pos.made){
	  ctx.drawImage(old_pos.image,old_pos.x(),old_pos.y());
	}
	if (new_pos.made){
	  ctx.drawImage(new_pos.image,new_pos.x(),new_pos.y());
	}

	for (var ci=0;ci<ncolors;ci++){
	  for (var i=0;i<16;i++){
	    ctx.drawImage(allPieces[ci][i].image,allPieces[ci][i].x(),allPieces[ci][i].y());
	  }
	}
};

// The main game loop
var main = function () {
  render();

};

// Let's play this game!
reset();
setInterval(main, 10); // Execute as fast as possible
