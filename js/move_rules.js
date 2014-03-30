
  
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
  return 1;
};
  
checkKnightMoveRules = function(curFile,curRank,tarFile,tarRank) {
  return 1;
};
  
checkRookMoveRules = function(curFile,curRank,tarFile,tarRank) {
  return 1;
};
  
checkQueenMoveRules = function(curFile,curRank,tarFile,tarRank) {
  return 1;
};
  
checkKingMoveRules = function(curFile,curRank,tarFile,tarRank) {
  return 1;
};

// Array of the check functions
var isMoveLegal = new Array(checkPawnMoveRules, checkBishopMoveRules, checkKnightMoveRules, checkRookMoveRules, checkQueenMoveRules, checkKingMoveRules);

