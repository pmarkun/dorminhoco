$SUBSCRIBER_ADDR = 'http://localhost:8001';
$SERVER_ADDR = 'http://localhost:8000';

function Game() {
    this.id = 0;
    this.deck = {};
    this.max_players = 1;
    this.max_cards = 5;
    this.players = [];
}

function Player(id) {
    this.id = id;
    this.hand = {};
}
//Deal
function Deal(game) {
    if (game.players.length < game.max_players) {
        $('#status').text('Still missing ' + (game.max_players-game.players.length) + ' players');
    }
    else {
        console.log(game);
        game.players.forEach(function (player) {
            console.log(player);
            for (c=1; c <= game.max_cards; c++) {
                var cardid = pickRandomProperty(game.deck);
                var message = {
                    userId : player,
                    gameId : game.id,
                    card : game.deck[cardid]
                };

                $.ajax({
                    type: 'POST',
                    url: $SERVER_ADDR + '/play',
                    data: message,
                    dataType: 'json'
                });

                delete game.deck[cardid];
            }
        });
    }
}
//End Deal

//Play
function Play(id) {
    var message = {
      userId: $('#user-id').val(),
      gameId: game.id,
      card: player.hand[id]
    };

    $.ajax({
      type: 'POST',
      url: $SERVER_ADDR + '/play',
      data: message,
      dataType: 'json'
    });
}
//End Play

//Join
function Join(game, player) {
    var join_subscription = client.subscribe('/games/' + game.id + '/users/' + player.id, function(obj) {
        $("#play").removeAttr("disabled");
        player.hand[obj.card.id] = obj.card;
        $("#container").baraja().add(ich.card(obj.card));
        $("#"+obj.card.id).on('click', null, function() {
            $(".card").removeClass("selected");
            $(this).addClass("selected");
        });
    });

    join_subscription.callback(function() {
        var message = {
            playerId: player.id,
            gameId: game.id
        };

        $.ajax({
            type: 'POST',
            url: $SERVER_ADDR + '/join',
            data: message,
            dataType: 'json'
        });
    });
    return join_subscription;
}

//Load deck
function LoadDeck() {
    $.ajax({
        type: "GET",
        url: "cartas/cartas.csv",
        dataType: "text",
        success: function(data) {
            csvtojson(data);
        }
    });
}
//End load deck

//Create game
function Create(game, player) {
    var admin_subscription = client.subscribe('/games/' + game.id + '/admin', function(obj) {
        game['players'].push(obj.playerId);
        $('#players').append('<p>'+obj.playerId+'</p>');
    });

    admin_subscription.callback(function () {
        join_subscription = Join(game, player);
    });

    return admin_subscription;
}
//End Create game

$(document).ready(function () {
    client = new Faye.Client($SUBSCRIBER_ADDR);
    var $userId = $('#user-id');
    var $selected = $('.selected').attr("id");

    $('#container').baraja().fan();

    // Play Button
    $('#play').on('click', null, function() {
        var selected = $('.selected');
        var id = selected.attr('id');

        Play(id);
        $("#play").attr("disabled", "disabled");
        selected.remove();
        delete player.hand[id];
    });
    //End Play Button

    //Connect button
    $('#connect').on('click', null, function() {
        game = new Game();
        game.id = $('#gameid').val();
        var myid = $('#myid').val()

        player = new Player(myid);

        join_subcription = Join(game, player);

        $("#status").text('Connected to game ' + game.id + ' with player id ' + player.id);
        $("#connect").attr("disabled", "disabled");
        $("#create").attr("disabled", "disabled");
    });
    //End connect button

    //Create game button
    $('#create').on('click', null, function() {
        game = new Game();
        game.id = $('#gameid').val();
        game.admin = $('#myid').val();

        $.ajax({
            type: "GET",
            url: "cartas/cartas.csv",
            dataType: "text",
            async: false,
            success: function(data) {
                game.deck = csvtojson(data);
            }
        });

        player = new Player(game.admin);

        $('#status').text('Created game ' + game.id + ' with player id ' + player.id);
        $("#connect").attr("disabled", "disabled");
        $("#create").attr("disabled", "disabled");

        admin_subscription = Create(game, player);

        // Deal button
        $('#deal').show();
        $('#deal').on('click', null, function() {
            var id = $('#user-id').val();
            Deal(game);
        });
        //End deal button
        });
    //End create game button

});
