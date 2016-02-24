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

    Sensdata.gethourStats = function(sens_id,start_dt,end_dt, cb) {
      Sensdata.getDataSource().connector.connect(function(err, db) {
        var collection = db.collection('Sensdata');

        console.log(start_dt);
        collection.aggregate([
          { $match: { sens_id: sens_id,
                      $and:[
                        {received:{$gte:start_dt}},
                        {received:{$lte:end_dt}}
                      ]
                    }
          },
          { $group: {"_id": {
            "year" : {
              $year : "$received"
            },
            "dayOfYear" : {
              $dayOfYear : "$received"
            },
            "hour" : {
              $hour : "$received"
            }
          },
            "count": {
              $sum: 1
            },
            "avg": {
              $avg: "$val"
            },
            "min": {
              $min: "$val"
            },
            "max": {
              $max: "$val"
            }
            }},{
            $sort: {
              "_id.year" : 1,
              "_id.dayOfYear" : 1,
              "_id.hour" : 1
            }
          }
        ], function(err, data) {
          if (err) return cb(err);
          return cb(null, data);
        });
      });
   };


    Sensdata.remoteMethod (
      'gethourStats',
      {
        http: {path: '/gethourstats', verb: 'get'},
        accepts: [{arg: 'sens_id', type: 'number', http: { source: 'query' } },
                 {arg: 'start_dt', type: 'date', http: { source: 'query' } },
                 {arg: 'end_dt', type: 'date', http: { source: 'query' } }
        ],

        returns: {arg: 'stats', type: 'string'}
      }
    );
};
