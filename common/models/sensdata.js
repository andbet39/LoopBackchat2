module.exports = function(Sensdata) {

    Sensdata.observe('after save', function(ctx, next) {
        if (ctx.instance) {
           
          Sensdata.app.io.to(ctx.instance.sens_id).emit('senordata_created',ctx.instance);
          
        } else {
          console.log('Updated %s matching %j',
            ctx.Model.pluralModelName,
            ctx.where);
        }
        next();
    });
  
};
