$(function() {
    $( "input[type=flip], a, button" )
      .button()
      .click(function( event ) {
        board_flipped=1-board_flipped;
      });
});

$(function() {
    $( "input[type=reset], a, button" )
      .button()
      .click(function(event){
	  reset();
	});
  });
