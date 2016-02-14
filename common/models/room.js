module.exports = function(Room) {
  Room.join = function(roomId,cb) {
      var response;
      Room.findById( roomId, function (err, instance) {
        response = instance;
        Room.app.io.to(instance.name).emit('message',{content:"Someone joined the room"});
        cb(null, response);
        console.log(response);
    });
  }

    Room.remoteMethod(
      'join',
      {
        http: {path: '/join', verb: 'get'},
        accepts: {arg: 'id', type: 'number', http: { source: 'query' } },
        returns: {arg: 'room', type: 'json'}
      }
    );

      Room.observe('after save', function(ctx, next) {
          if (ctx.instance) {
            console.log('Saved %s#%s', ctx.Model.modelName, ctx.instance.id);
            Room.app.io.emit('room_created',ctx.instance);
            
          } else {
            console.log('Updated %s matching %j',
              ctx.Model.pluralModelName,
              ctx.where);
          }
          next();
      });
};
