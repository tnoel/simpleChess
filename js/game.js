
// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var objTo = document.getElementById('game_space')
board_size=640;
edge_size=20;
square_size=board_size/8;
canvas.width = board_size+2*edge_size;
canvas.height = canvas.width;
objTo.appendChild(canvas);
canvas.addEventListener("click",boardClick,false);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background_brown.png";

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
  if (board_flipped){
    return (7-this.file)*square_size + edge_size;
  } else {
    return this.file*square_size + edge_size;
  }
};
y = function() {
  if (board_flipped){
    return (7-this.rank)*square_size + edge_size;
  } else {
    return this.rank*square_size + edge_size;
  }
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
    this.file=livePieces[color][pi].file;
    this.rank=livePieces[color][pi].rank;
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
  this.angle=0;
  this.capture = function() {
    this.file=-2; // Just move the piece off the playable area
    this.rank=-2;
  }
  this.changeType = function(newType) {
    this.type=newType;
    this.image.src = imag_paths[this.color][newType];
  }
}

// A function for cloning the pieces (maybe useful for AI later?)
clonePieces = function(pieces){
  var newPieces = new Array;
  for (ci=0;ci<2;ci++){
    newPieces[ci] = new Array(16);
    for (pi=0;pi<16;pi++){
      newPieces[ci][pi] = cloneOnePiece(pieces[ci][pi]);
    }
  }
  return newPieces;
};
cloneOnePiece = function(pieceToClone){
  newPiece = new piece(pieceToClone.color,pieceToClone.type,pieceToClone.file,pieceToClone.rank);
  return newPiece;
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
  if (board_flipped){
    var square = { file: (7-Math.floor(x/square_size)), rank:(7-Math.floor(y/square_size))}
  } else {
    var square = { file: Math.floor(x/square_size), rank:Math.floor(y/square_size)}
  }
  return square;
};

function checkForPiece(square,color,pieces) {
  // function to check whether a piece is on a square
  for (var pi=0;pi<16;pi++) {
    if (pieces[color][pi].rank == square.rank && pieces[color][pi].file == square.file) {
      // we have a match!
      return pi;
    }
  }
  // if we've made it this far without a match, no selection.
  return -1;
};

function checkPawnPromote(color,pi,pieces) {
  // check if pawn should be promoted, and if so promote it
  curRank=pieces[color][pi].rank;
  if (curRank == 7*color) {
    // it has reached the opposite rank, promote the sucker.
    return 1;
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
    matched_pi=checkForPiece(square,turn,livePieces);
    if (matched_pi >= 0) {
      selection.select(turn,matched_pi);
      return;
    }
    // Check legality of move
    ruleResult = isMoveLegal(livePieces[selection.color][selection.pi].type,selection.file,selection.rank,square.file, square.rank,livePieces);
    if (ruleResult == 0){ return; } // Illegal move
    if (castleFlag >= 0){
      // looks like we're castling
      livePieces[turn][12+castleFlag].move({file:(square.file+1-2*castleFlag),rank:square.rank});
      castleFlag=-1;
      castling[turn]=[0,0];
    }
    if (enPassantTaken == 1){
      // we are en passanting.
      matched_pi=checkForPiece({file:square.file,rank:selection.rank},1-turn,livePieces);
      livePieces[1-turn][matched_pi].capture();
    }
    // Next check for capture
    matched_pi=checkForPiece(square,1-turn,livePieces);
    if (matched_pi >= 0) {
      // Capture a piece!
      livePieces[1-turn][matched_pi].capture();
      // // // The crux of the game!! piece becomes what it captured! // // //
      if ($('input:radio[name=game_mode]:checked').val() == 'variation'){
	if (livePieces[turn][selection.pi].type != 5){ // not a king
	  livePieces[turn][selection.pi].changeType(livePieces[1-turn][matched_pi].type);
	}
      }
    }
    // Move selected piece
    old_pos.select(selection.color,selection.pi);
    livePieces[turn][selection.pi].move(square);
    new_pos.select(selection.color,selection.pi);
    selection.made=0;
    if (livePieces[turn][selection.pi].type == 0){
      if (checkPawnPromote(turn,selection.pi,livePieces)){
	var promote_type=$('#promote_dialog').dialog("open");
      }
    } else if ((castling[turn][0] || castling[turn][1])){
      // check if we're voiding castling
      if (livePieces[turn][selection.pi].type == 5){
	castling[turn]=[0,0];
      } else if (livePieces[turn][selection.pi].type == 3){
	castleSide = Math.floor(livePieces[turn][selection.pi].file / 7);
	castling[turn][castleSide]=0;
      }
    }
      
    // switch turn
    turn=1-turn;

  } else {
    // Fresh selection. Check if piece is here.
    matched_pi=checkForPiece(square,turn,livePieces); // use turn for color to match
    if (matched_pi >= 0) {
      selection.select(turn,matched_pi);
    }
  }
}

var reset = function () {
  // reset selection objects
  window.selection = new select_class();
  window.new_pos = new select_class(); // highlight last piece moved
  window.old_pos = new select_class(); // highlight previous position of last piece moved

  // reset/initialize pieces
  for (var ci=0;ci<ncolors;ci++){
    livePieces[ci] = new Array(16);
    piece_rank = 7*(1-ci); // Assuming white on bottom
    pawn_rank = piece_rank + 2*ci - 1; // hacky hacky hacky
    for (var pi=0;pi<8;pi++){
      // First 8 are pawns
      livePieces[ci][pi] = new piece(ci,0,pi,pawn_rank);
    }
    // The rest just do by hand
    livePieces[ci][8]  = new piece(ci,1,2,piece_rank); // q's bishop
    livePieces[ci][9]  = new piece(ci,1,5,piece_rank); // k's bishop
    livePieces[ci][10] = new piece(ci,2,1,piece_rank); // q's knight
    livePieces[ci][11] = new piece(ci,2,6,piece_rank); // k's knight
    livePieces[ci][12] = new piece(ci,3,0,piece_rank); // q's rook
    livePieces[ci][13] = new piece(ci,3,7,piece_rank); // k's rook
    livePieces[ci][14] = new piece(ci,4,3,piece_rank); // q
    livePieces[ci][15] = new piece(ci,5,4,piece_rank); // k
  }
  turn=0;
  raged=0;
  enPassantFlag=-1;
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

	if (raged == 1){
	  for (var ci=0;ci<ncolors;ci++){
	    for (var i=0;i<16;i++){
	      ctx.save();
	      angle_temp = livePieces[ci][i].angle;
	      ctx.rotate(angle_temp);
	      xplot = livePieces[ci][i].x() * Math.cos(angle_temp) + livePieces[ci][i].y() * Math.sin(angle_temp);
	      yplot = -livePieces[ci][i].x() * Math.sin(angle_temp) + livePieces[ci][i].y() * Math.cos(angle_temp);
	      ctx.drawImage(livePieces[ci][i].image,xplot,yplot);
	      ctx.restore();
	    }
	  }
	} else {
	  for (var ci=0;ci<ncolors;ci++){
	    for (var i=0;i<16;i++){
	      ctx.drawImage(livePieces[ci][i].image,livePieces[ci][i].x(),livePieces[ci][i].y());
	    }
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
