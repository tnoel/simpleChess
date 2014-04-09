simpleChess
===========

This is just a fun project for me to learn some basics of html and javascript.

It is a simple chess game, that I plan to chip away at and add features/improvements.

There is one special thing about this game - it's a variation that I think may be fun to play. When a piece captures, it becomes the piece that it captured. For example, if a knight captures a pawn, the knight _becomes_ a pawn. I have no idea how this will pan out, but it's fun to think about.

Initial commit: So far the script is smart enough to handle the pieces, and even move them. The big things yet to be done are handling special moves (e.g. castling, promotion), and adding rules to check legality of moves. Once those tasks are done, it should be possible to use this as a board to play against someone sitting next to you. Maybe some day I'll add the ability to play online. I should also add various features like a reset button, logging, and ability to view previous moves.

Promotion is now handled correctly. Had to add jquery, which will probably be helpful for other things too. Next step castling?

Basic rules added. Most pieces will only move legally, notable exceptions: Castling, en passant, and no checking for check.

Castling has been added. Also did some work to make the page look nicer. Added some game controls. There is also an option to play standard chess.

Added en passant. Need to do more testing though.

TODO: check for check. Those are the big ones for now.
