var TwitterListen = require('twitterlisten'),
    twitter_listen = new TwitterListen(["yolo"]);

twitter_listen.on('tweet', function(event_data){
  console.log('@'+event_data.user.screen_name);
  console.log(event_data.text);
  console.log(event_data.geo);
  console.log(event_data.coordinates);
  console.log(event_data.place);
  console.log(event_data.user.location);
  console.log('=======');
})
