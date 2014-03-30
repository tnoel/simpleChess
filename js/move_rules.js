
  
checkPawnMoveRules = function(color,pi,targetSquare) {
  // very differnt if in capture mode or not
  matched_pi=checkForPiece(targetSquare,1-color);
  if (matched_pi >= 0) {
    // capture mode
  } else {
    // non-capture mode

  }
  return 0; // just a value to check we got into this function
};
  
checkBishopMoveRules = function(color,pi,targetSquare) {
  return 1;
};
  
checkKnightMoveRules = function(color,pi,targetSquare) {
  return 2;
};
  
checkRookMoveRules = function(color,pi,targetSquare) {
  return 3;
};
  
checkQueenMoveRules = function(color,pi,targetSquare) {
  return 4;
};
  
checkKingMoveRules = function(color,pi,targetSquare) {
  return 5;
};

// Array of the check functions
var isMoveLegal = new Array(checkPawnMoveRules, checkBishopMoveRules, checkKnightMoveRules, checkRookMoveRules, checkQueenMoveRules, checkKingMoveRules);

