var loopback = require('loopback');
var boot = require('loopback-boot');

var redis = require("redis"),
    redis_client = redis.createClient(6379,'10.0.0.1');



var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module){
    //app.start();



      redis_client.on("message", function (channel, message) {
      //console.log("Nodejs : "+ message);

      var res = message.split(":");

      if(res[0]=="SN"){

        var Sensdata = app.models.Sensdata;
          Sensdata.create({
            sens_id:res[1],
            val:res[2],
            type:res[3].replace(/\r?\n|\r/g, ""),
            received:new Date()
          });

      }

    });


    //redis_client.subscribe("messages");


    app.io = require('socket.io')(app.start(),{origins:'localhost:*'});
    app.redis_client =redis_client;


    app.io.on('connection', function(socket){
      console.log('a user connected');


      socket.on('subscribe', function(room) {
          console.log('joining room', room);
          socket.join(room);
      });

      socket.on('leave', function(room) {
          console.log('Leaving room'+room);
          socket.leave(room);
      });



      socket.on('message',function(message){
        //console.log(message);
        if(message.room){
          app.io.to(message.room).emit('message',message);
        }else{
          app.io.emit('message',message);
        }
      });


      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
}
    //app.start();
});
