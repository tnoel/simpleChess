$(function() {
    $( "#flip" )
      .button()
      .click(function( event ) {
	  if ($(this).prop('value') == 'Rage Quit!'){
	    for (ci=0;ci<2;ci++){
	      for (pi=0;pi<16;pi++){
		allPieces[ci][pi].file = Math.random() * 7;
		allPieces[ci][pi].rank = Math.random() * 7;
		allPieces[ci][pi].angle = Math.random() - 0.5;
	      }
	    }
	    raged=1;
	  } else {
	    board_flipped=1-board_flipped;
	  }
	});
  });

$(function() {
    $( "#reset" )
      .button()
      .click(function(event){
	  reset();
	});
  });
