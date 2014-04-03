
  
checkPawnMoveRules = function(curFile,curRank,tarFile,tarRank) {
  // TODO: first check special case of en passant

  // very differnt if in capture mode or not
  targetSquare={file: tarFile, rank: tarRank};
  matched_pi=checkForPiece(targetSquare,1-turn);
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
	  match1=checkForPiece({file:curFile,rank:oneForward},turn);
	  match2=checkForPiece({file:curFile,rank:oneForward},1-turn);
	  if ((match1<0) && (match2<0)){
	    // TODO: Throw en passant flag!
	    return 1;
	  }
	}
      }
    }
  }
  return 0; // otherwise it wasn't legal
};
  
checkBishopMoveRules = function(curFile,curRank,tarFile,tarRank) {
  // First check if it's diagonal
  if (Math.abs(curFile-tarFile) == Math.abs(curRank-tarRank)){
    // Then check the path
    if (checkPath(curFile,curRank,tarFile,tarRank)) {
      return 1;
    }
  }
  return 0; // otherwise illegal
};
  
checkKnightMoveRules = function(curFile,curRank,tarFile,tarRank) {
  dFile = Math.abs(curFile-tarFile);
  dRank = Math.abs(curRank-tarRank);
  if (((dFile == 1) && (dRank == 2)) || ((dFile == 2) && (dRank == 1))) {
    return 1; // No need to check path! woop.
  };
  return 0; // otherwise illegal
};
  
checkRookMoveRules = function(curFile,curRank,tarFile,tarRank) {
  // check that it's horizontal or vertical
  if ((curFile == tarFile) || (curRank == tarRank)) {
    // Check path
    if (checkPath(curFile,curRank,tarFile,tarRank)) {
      return 1;
    }
  }
  return 0; // otherwise illegal
};
  
checkQueenMoveRules = function(curFile,curRank,tarFile,tarRank) {
  // check diagonal or horizontal or vertical
  diag = Math.abs(curFile-tarFile) == Math.abs(curRank-tarRank);
  horizvert = (curFile == tarFile) || (curRank == tarRank);
  if (diag || horizvert){
    // Then check the path
    if (checkPath(curFile,curRank,tarFile,tarRank)) {
      return 1;
    }
  }
  return 0; // otherwise illegal
};
  
checkKingMoveRules = function(curFile,curRank,tarFile,tarRank) {
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
      if (checkPath(curFile,curRank,7*castleSide,kingHomeRank)){
	// TODO: Check the we're not moving in/out of check
	// all clear
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

checkPath = function(curFile,curRank,tarFile,tarRank) {
  deltaFile=sign(tarFile-curFile);
  deltaRank=sign(tarRank-curRank);
  tempFile=curFile+deltaFile;
  tempRank=curRank+deltaRank;
  while ((tempFile != tarFile) || (tempRank != tarRank)){
    match1=checkForPiece({file:tempFile,rank:tempRank},turn);
    match2=checkForPiece({file:tempFile,rank:tempRank},1-turn);
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
isMoveLegal = function(type,curFile,curRank,tarFile,tarRank) {

  result=pieceMoveRules[type](curFile,curRank,tarFile,tarRank);

  // TODO: Does this result in own player in check?

  return result;

}
