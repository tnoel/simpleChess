
  
checkPawnMoveRules = function(curFile,curRank,tarFile,tarRank,pieces) {
  // TODO: first check special case of en passant
  if ((enPassantFlag >= 0) && (Math.abs(curFile-enPassantFlag) == 1) && (curRank == 3+turn) && (tarRank == 2+2*turn) && (tarFile == enPassantFlag)){
    // Looks like we're trying to en passant
    enPassantTaken=1;
    return 1;
  }
  // very different if in capture mode or not
  targetSquare={file: tarFile, rank: tarRank};
  matched_pi=checkForPiece(targetSquare,1-turn,pieces);
  if (matched_pi >= 0) {
    // capture mode
    if (Math.abs(curFile-tarFile) == 1){
      oneForward = curRank + (2*turn-1);
      if (tarRank == oneForward){
	// looks like it's a legal capture
	return 1;
      }
    }
  } else {
    // non-capture mode
    if (curFile == tarFile) {
      oneForward = curRank + (2*turn-1);
      if (tarRank == oneForward){
	return 1;
      } else if (curRank == 1+5*(1-turn)) {
	// we're on the home rank, check if it's two forward
	twoForward = curRank + (4*turn-2);
	if (tarRank == twoForward){
	  // check to be sure we're not jumping over someone
	  match1=checkForPiece({file:curFile,rank:oneForward},turn,pieces);
	  match2=checkForPiece({file:curFile,rank:oneForward},1-turn,pieces);
	  if ((match1<0) && (match2<0)){
	    // TODO: Throw en passant flag!
	    enPassantFlag = curFile;
	    enPassantThrown=1;
	    return 1;
	  }
	}
      }
    }
  }
  return 0; // otherwise it wasn't legal
};
  
checkBishopMoveRules = function(curFile,curRank,tarFile,tarRank,pieces) {
  // First check if it's diagonal
  if (Math.abs(curFile-tarFile) == Math.abs(curRank-tarRank)){
    // Then check the path
    if (checkPath(curFile,curRank,tarFile,tarRank,pieces)) {
      return 1;
    }
  }
  return 0; // otherwise illegal
};
  
checkKnightMoveRules = function(curFile,curRank,tarFile,tarRank,pieces) {
  dFile = Math.abs(curFile-tarFile);
  dRank = Math.abs(curRank-tarRank);
  if (((dFile == 1) && (dRank == 2)) || ((dFile == 2) && (dRank == 1))) {
    return 1; // No need to check path! woop.
  };
  return 0; // otherwise illegal
};
  
checkRookMoveRules = function(curFile,curRank,tarFile,tarRank,pieces) {
  // check that it's horizontal or vertical
  if ((curFile == tarFile) || (curRank == tarRank)) {
    // Check path
    if (checkPath(curFile,curRank,tarFile,tarRank,pieces)) {
      return 1;
    }
  }
  return 0; // otherwise illegal
};
  
checkQueenMoveRules = function(curFile,curRank,tarFile,tarRank,pieces) {
  // check diagonal or horizontal or vertical
  diag = Math.abs(curFile-tarFile) == Math.abs(curRank-tarRank);
  horizvert = (curFile == tarFile) || (curRank == tarRank);
  if (diag || horizvert){
    // Then check the path
    if (checkPath(curFile,curRank,tarFile,tarRank,pieces)) {
      return 1;
    }
  }
  return 0; // otherwise illegal
};
  
checkKingMoveRules = function(curFile,curRank,tarFile,tarRank,pieces) {
  dFile = Math.abs(curFile-tarFile);
  dRank = Math.abs(curRank-tarRank);

  // Check for castling
  kingHomeFile=4;
  kingHomeRank=7*(1-turn);
  if ((curFile==kingHomeFile) && (curRank==kingHomeRank) && (dFile == 2) && (dRank == 0)){
    // Looks like we're trying to castle. check that it's ok.
    castleSide = (sign(curFile-tarFile)==1) ? 0 : 1; // 0 for queenside, 1 for kingside
    if (castling[turn][castleSide]){
      // castling is allowed, just need to check the paths.
      if (checkPath(curFile,curRank,7*castleSide,kingHomeRank,pieces)){
	// Check the we're not moving out of or through check
	// are we currently in check?
	inCheck = checkForCheck(turn,pieces);
	if (inCheck == 1) {return 0;} // if in check, can't castle
	// check that we're not in check in between
	tempPieces = clonePieces(pieces);
	tempPieces[turn][15].move({file:kingHomeFile+2*castleSide-1,rank:kingHomeRank});
	inCheck = checkForCheck(turn,tempPieces);
	if (inCheck == 1) {return 0;} // tried to move through check
	// final position will be checked later in master function.
	castleFlag = castleSide;
	return 1;
      }
    }
  }

  if ((dFile <= 1) && (dRank <= 1)) {
    return 1; // No need to check path! woop.
  };
  return 0; // otherwise illegal
};

// Array of the check functions
var pieceMoveRules =  new Array(checkPawnMoveRules, checkBishopMoveRules, checkKnightMoveRules, checkRookMoveRules, checkQueenMoveRules, checkKingMoveRules);

sign = function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };

checkPath = function(curFile,curRank,tarFile,tarRank,pieces) {
  deltaFile=sign(tarFile-curFile);
  deltaRank=sign(tarRank-curRank);
  tempFile=curFile+deltaFile;
  tempRank=curRank+deltaRank;
  while ((tempFile != tarFile) || (tempRank != tarRank)){
    match1=checkForPiece({file:tempFile,rank:tempRank},turn,pieces);
    match2=checkForPiece({file:tempFile,rank:tempRank},1-turn,pieces);
    if ((match1 >= 0) || match2 >= 0){
      return 0;
    } else {
      tempFile += deltaFile;
      tempRank += deltaRank;
    }
  }
  // if we've made it this far, nothing is in our path.
  return 1;
};

// Master function to call
isMoveLegal = function(type,curFile,curRank,tarFile,tarRank,pieces) {
  enPassantThrown=0
  enPassantTaken=0
  result=pieceMoveRules[type](curFile,curRank,tarFile,tarRank,pieces);
  if ((enPassantThrown == 0) && (result == 1)){
    enPassantFlag=-1; // reset en passant flag
  }
  // jump out now if move is illegal
  if (result == 0) { return result;}

  // check if moving into check
  // first make a copy of pieces and theoretically move the piece
  tempPieces = clonePieces(pieces);
  piece_pi = checkForPiece({file:curFile,rank:curRank},turn,tempPieces)
  if (castleFlag >= 0){
    // looks like we're castling
    tempPieces[turn][12+castleFlag].move({file:(tarFile+1-2*castleFlag),rank:tarRank});
  }
  if (enPassantTaken == 1){
    // we are en passanting.
    matched_pi=checkForPiece({file:tarFile,rank:curRank},1-turn,tempPieces);
    tempPieces[1-turn][matched_pi].capture();
  }
  // Next check for capture
  matched_pi=checkForPiece({file:tarFile,rank:tarRank},1-turn,tempPieces);
  if (matched_pi >= 0) {
    // Capture a piece!
    tempPieces[1-turn][matched_pi].capture();
    // // // The crux of the game!! piece becomes what it captured! // // //
    if ($('input:radio[name=game_mode]:checked').val() == 'variation'){
      if (tempPieces[turn][selection.pi].type != 5){ // not a king
	  tempPieces[turn][selection.pi].changeType(tempPieces[1-turn][matched_pi].type);
      }
    }
  }
  // Move selected piece
  tempPieces[turn][selection.pi].move({file:tarFile,rank:tarRank});
  // now we can check for check
  result = checkForCheck(turn,tempPieces)
  return 1-result;

}

checkForCheck = function(color,piecesToCheck){
  tarFile = piecesToCheck[color][15].file; // king's location
  tarRank = piecesToCheck[color][15].rank;
  for (pi=0;pi<16;pi++){
    if (piecesToCheck[1-color][pi].file > 0){ // just make sure the piece isn't already captured!
      curFile = piecesToCheck[1-color][pi].file;
      curRank = piecesToCheck[1-color][pi].rank;
      type = piecesToCheck[1-color][pi].type;
      result=pieceMoveRules[type](curFile,curRank,tarFile,tarRank,piecesToCheck);
      if (result == 1) {return 1};
    }
  }
  return 0; // no check if we got this far.

}
