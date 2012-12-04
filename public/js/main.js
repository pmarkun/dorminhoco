$SUBSCRIBER_ADDR = 'http://localhost:8001';
$SERVER_ADDR = 'http://localhost:8000';

function Game() {
    this.id = 0;
    this.deck = {};
    this.max_players = 5;
    this.max_cards = 5;
}

function Player(id) {
    this.id = id;
    this.hand = {};
}
//Deal
function Deal(id) {
    c = Object.keys(player.hand).length+1;
    for (c; c <= game.max_cards; c++) {
        var cardid = pickRandomProperty(game.deck);
        var message = {
            userId : id,
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
            
        $("#deal").attr("disabled", "disabled");
}
//End Deal

//Play
function Play() {
    var selected = $('.selected');
    var id = selected.attr('id');
        
    selected.remove();
    
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
function Join(id) {
    var join_subscription = client.subscribe('/games/' + game.id + '/users/' + player.id, function(obj) {
        $("#play").removeAttr("disabled");
        player.hand[obj.card.id] = obj.card;
        $("#container").append(ich.card(obj.card));
        $("#"+obj.card.id).on('click', null, function() {
            $(".card").removeClass("selected");
            $(this).addClass("selected");
        });
    });
        
    join_subscription.callback(function() {
        var message = {
            userId: player.id,
            gameId: game.id
        };

        $.ajax({
            type: 'POST',
            url: $SERVER_ADDR + '/join',
            data: message,
            dataType: 'json'
        });
        
        //Deal(player.id);
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
function Create(game) {
    var admin_subscription = client.subscribe('/games/' + game.id + '/admin', function(obj) {
        console.log(obj);
        console.log("Player " + obj.playerId + ' has joined the game' );
    });
    
    admin_subscription.callback(function () {
        join_subscription = Join(game);
    });
    
    return admin_subscription;
}
//End Create game
        
$(document).ready(function () {   
    client = new Faye.Client($SUBSCRIBER_ADDR);
    var $userId = $('#user-id');
    var $selected = $('.selected').attr("id");   
    
    // Play Button
    $('#play').on('click', null, function() {
        Play();
        $("#play").attr("disabled", "disabled");
        delete player.hand[id];
    });
    //End Play Button
    
    //Connect button
    $('#connect').on('click', null, function() {
        game = new Game();
        game.id = $('#gameid').val();
        game.admin = 0;
        
        player = new Player(1);
        
        join_subcription = Join(game.id);
        
        $("#status").text('Connected to game ' + game.id + ' with player id ' + player.id);
        $("#connect").attr("disabled", "disabled");
        $("#create").attr("disabled", "disabled");
    });
    //End connect button
    
    //Create game button
    $('#create').on('click', null, function() {
        game = new Game();
        game.id = $('#gameid').val();
        game.admin = 0;
        
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
            
        admin_subscription = Create(game);
        });
    //End create game button
    
});
