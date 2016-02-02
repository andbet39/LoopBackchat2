var loopback = require('loopback');
var boot = require('loopback-boot');

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

var idx=0;
  // start the server if `$ node server.js`
  if (require.main === module){
    //app.start();
    app.io = require('socket.io')(app.start(),{origins:'localhost:*'});
    app.io.on('connection', function(socket){
      console.log('a user connected');


      socket.on('subscribe', function(room) {
          console.log('joining room', room);
          socket.join(room);
      });

      socket.on('message',function(message){
        console.log(message);
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