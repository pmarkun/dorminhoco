var express = require('express');
var faye = require('faye');

// Faye setup

var fayeServer = new faye.NodeAdapter({ mount: '/' });
var fayeClient = fayeServer.getClient();

// App setup

var app = express();
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

app.post('/play', function(req, res) {
  fayeClient.publish('/games/' + req.body.gameId + '/users/' + req.body.userId, {
    card : req.body.card
    }
  );
  res.send(200);
});

app.post('/join', function(req, res) {
    console.log(req.body.playerId + ' has joined game ' + req.body.gameId);
  fayeClient.publish('/games/' + req.body.gameId + '/admin', {
        gameId : req.body.gameId,
        playerId : req.body.playerId
    });
  res.send(200);
});

fayeServer.listen(8001);
app.listen(8000);
