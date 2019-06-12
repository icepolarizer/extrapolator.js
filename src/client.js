$(document).ready(function() {
    // Use a "/test" namespace.
    // An application can open a connection on multiple namespaces, and
    // Socket.IO will multiplex all those connections on a single
    // physical channel. If you don't care about multiple channels, you
    // can set the namespace to an empty string.
    namespace = '/test';
    // Connect to the Socket.IO server.
    // The connection URL has the following format, relative to the current page:
    //     http[s]://<domain>:<port>[/<namespace>]
    var socket = io(namespace);
    var encryptionKey;
    var recv;
    var user_id;


    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    socket.on('connect', function() {
        socket.emit('my_event', {data: 'I\'m connected!'});
    });


    // Event handler for server sent data.
    // The callback function is invoked whenever the server emits data
    // to the client. The data is then displayed in the "Received"
    // section of the page.
    socket.on('qkd', function(msg, cb) {
        $('#log').append('<br>' + $('<div/>').text('#Info: ' + msg.data).html());
        encryptionKey = bobKeygen(msg.laser.LASER); // Make bobKeygen ASAP
        console.log("EncryptionKey: ", encryptionKey);
        if (cb)
            cb();
    });


    socket.on('my_response', function(msg, cb) {
        $('#log').append('<br>' + $('<div/>').text('#Info: ' + msg.data).html());
        if (cb)
            cb();
    });


    socket.on('usr_msg', function(msg, cb) {
        var decrypted = CryptoJS.AES.decrypt(msg.data, encryptionKey);
        decrypted = decrypted.toString(CryptoJS.enc.Utf8);
        $('#log').append('<br>' + $('<div/>').text('<@' + msg.sender + '> ' + decrypted).html());

        var msg_log = document.getElementById('log');
        msg_log.scrollTop = msg_log.scrollHeight;

        if (Notification.permission !== 'granted')
            Notification.requestPermission();
        else {
            if (!document.hasFocus()) {
                var notification = new Notification('Cattleya❃', {
                icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                body: decrypted,
                });

                setTimeout(function () {
                    notification.close();
                }, 5000);

                notification.onclick = function () {
                    window.focus();
                };
            }

        }
        if (cb)
            cb();
    });


    // Interval function that tests message latency by sending a "ping"
    // message. The server then responds with a "pong" message and the
    // round trip time is measured.
    var ping_pong_times = [];
    var start_time;
    window.setInterval(function() {
        start_time = (new Date).getTime();
        socket.emit('my_ping');
    }, 1000);


    // Handler for the "pong" message. When the pong is received, the
    // time from the ping is stored, and the average of the last 30
    // samples is average and displayed.
    socket.on('my_pong', function() {
        var latency = (new Date).getTime() - start_time;
        ping_pong_times.push(latency);
        ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
        var sum = 0;
        for (var i = 0; i < ping_pong_times.length; i++)
            sum += ping_pong_times[i];
        $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
    });


    // Handlers for the different forms in the page.
    // These accept data from the user and send it to the server in a
    // variety of ways


    $('form#join').submit(function(event) {
        var laser = aliceKeygen();
        encryptionKey = laser.Akey;
        recv = $('#join_room').val();
        $('#log').append('<br>' + $('<div/>').text('Connection Complete. KEY: ' + encryptionKey).html());
        socket.emit('join', {room: $('#join_room').val(), laser: laser});
        return false;
    });


    $('form#login').submit(function(event) {
        user_id = $('#login_id').val();
        socket.emit('login', {id: user_id});
        console.log(user_id);
        return false;
    });


    $('form#send_room').submit(function(event) {
        event.preventDefault();
        console.log($('#room_data').val());
        //var encrypted = 'fuck';
        if (recv == undefined) {
            recv = user_id;
        }

        var encrypted = CryptoJS.AES.encrypt($('#room_data').val(), encryptionKey).toString();
        console.log("Encrypted: ", encrypted);
        socket.emit('usr_msg', {sender: $('#login_id').val(), recv: recv, data: encrypted});

        var msg_field = document.getElementById('send_room');
        msg_field.reset();
        return false;
    });


    /*
    $('form#close').submit(function(event) {
        socket.emit('close_room', {room: $('#close_room').val()});
        return false;
    });


    $('form#disconnect').submit(function(event) {
        socket.emit('disconnect_request');
        return false;
    });


    $('form#leave').submit(function(event) {
        socket.emit('leave', {room: $('#leave_room').val()});
        return false;
    });


    $('form#emit').submit(function(event) {
        socket.emit('my_event', {data: $('#emit_data').val()});
        return false;
    });


    $('form#broadcast').submit(function(event) {
        socket.emit('my_broadcast_event', {data: $('#broadcast_data').val()});
        return false;
    });*/
});