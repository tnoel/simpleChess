$(function(){
$("#promote_dialog").dialog({
    
  autoOpen: false,
      modal: true,
      buttons: {
      
    Queen: function() { 
	$(this).dialog("close");
	callback(4);
      },
	Rook: function() { 
	$(this).dialog("close");
	callback(3);
      },
        Knight: function() {
	$(this).dialog("close"); 
	callback(2);
      },
	Bishop: function() {
	$(this).dialog("close");
	callback(1);
      }
    },
      width: "450px",
      closeOnEscape: false,
      open: function(event, ui) { $(this).parent().children().children('.ui-dialog-titlebar-close').hide(); }
    
    
  });
  });
function callback(type){
  livePieces[selection.color][selection.pi].changeType(type);
}
