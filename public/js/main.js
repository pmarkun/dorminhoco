var $SERVER_ADDR = "http://localhost:8000/message";

function Game(id) {
    this.id = id;
    this.deck = {};
    this.max_players = 5;
    this.max_cards = 5;
}

function Player(id) {
    this.id = id;
    this.hand = {};
}

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

function csvtojson(csvfile) {
  var data_pre = $.csv.toObjects(csvfile);
  var data_pos = {};
  $.each(data_pre, function(n, c) {
      data_pos[c['id']] = c;
  });
  return data_pos;
}

$(document).ready(function () {

game = new Game(0);

$.ajax({
    type: "GET",
    url: "cartas/cartas.csv",
    dataType: "text",
    success: function(data) {
         game.deck = csvtojson(data);

        }
    });
    
    
    var $userId = $('#user-id');
    var $selected = $('.selected').attr("id");
    var $msg = $('#msg');

    $('#deal').on('click', null, function() {
            var message = {
                userId : $('#user-id').val(),
                gameId : 0,
                card : game.deck[pickRandomProperty(game.deck)]
            }
            $.ajax({
                    type: 'POST',
                    url: 'http://localhost:8000/play',
                    data: message,
                    dataType: 'json'
                });
            });
    
    $('#send').on('click', null, function() {
        // seleciona e remove a carta ao enviar
        var selected = $('.selected');
        var id = selected.attr('id');
        
        selected.remove();
        delete player.hand[id];
        
        var message = {
          userId: $('#user-id').val(),
          gameId: 0,
          card: game.deck[id]
        };

        $.ajax({
          type: 'POST',
          url: 'http://localhost:8000/play',
          data: message,
          dataType: 'json'
        });
    });

    var client = new Faye.Client('http://localhost:8001/');
    
    $('#connect').on('click', null, function() {
        $myuserid = $('#my-user-id').val();
        $gameid = game.id;
        player = new Player($myuserid);
        
        $("#status").text('Connected to game ' + $gameid + ' with player id ' + $myuserid);
        $("#connect").attr("disabled", "disabled");
        
        client.subscribe('/games/' + game.id + '/users/' + player.id, function(obj) {
            player.hand[obj.id] = obj;
            $("#container").append(ich.card(obj));
            $("#"+obj.id).on('click', null, function() {
                $(".card").removeClass("selected");
                $(this).addClass("selected");
            });
        });
    });
});
