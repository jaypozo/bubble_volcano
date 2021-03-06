var mongoose = require('mongoose'),
    auth_data = require('./auth_data.json'),
    request = require('request'),
    winston = require('winston'),
    Twit = require('twit');
require('winston-mail');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({colorize:true}),
    new (winston.transports.Mail)({to:"jay@jaymatter.com",from:"jaypozo@gmail.com", host:"smtp.gmail.com", port:465, username:"jaypozo@gmail.com", password:"STIMillionsGeO.*(", ssl:true})
  ]
});

var T = new Twit({
  consumer_key : auth_data.consumer_key,
  consumer_secret : auth_data.consumer_secret,
  access_token : auth_data.access_token,
  access_token_secret : auth_data.access_token_secret
})

var stream = T.stream('statuses/filter', {track:'#yolo'});

var confirm_messages = [
  ', the volcano is listening! Watch for those bubbles!',
  ', hello! Heard you tweet and the volcano is listening!',
  ' Bubble, bubble toil and trouble...the volcano is listening...',
  ' keep your eyes peeled for bubbles...',
  ' I am getting ready to bubble for you.',
  ' your volcano sacrifice has been received. Watch for bubbles!',
  ' find the vocano.. and it will bubble for you soon...',
  ' I am listening... and the bubbles are coming...',
  ' are you watching the volcano? It will bubble soon!',
  ' the volcano has heard you.. and is getting ready to bubble...',
  ' the volcano is listening... and is getting ready to bubble...'
];

var bubble_messages = [
  ' these bubbles are for you!',
  ' bubbling now!',
  ' your sacrifice has been approved!',
  ', these bubbless are for you!!',
  ' bubbbllllleeeeeeeees! These are for you!',
  ' the volcano is happy. Bubbling now!',
  ' sacrificing bubbles for you!',
  ' the volcano is bubbling for you!',
  ' these bubbles are bubbling over for you!',
  ' are you watching?! Bubbles!',
  ' are you watching the volcano? Bubbles!',
  ' these bubbles are bubbling for you!'
];
stream.on('disconnect', function(){
  // reconnect
  logger.log('Twitter stream disconnected.')
})

logger.log('info','Starting node app');

stream.on('tweet', function(event_data){
  var date = new Date();
  var current_time = date.getTime();
  console.log('MACHINE STATUS : Tweet heard: '+event_data.text);
  var tweet = new Tweet({name:event_data.user.screen_name, text:event_data.text, time:current_time, sent:false});
  tweet.save();
  //confirmTweet('@'+event_data.user.screen_name);
})

mongoose.connect(auth_data.mongo_endpoint);
mongoose.connection.on('error',function(err){
  logger.log('DB Error: '+err);
})
var Tweet = mongoose.model("Tweet", {name:String, text:String, time:Number, sent:Boolean});

// stop blowing bubbles
var stopBubbles = function(){
  console.log('MACHINE STATUS : Stopping bubbles!');
  request.get('http://localhost:8080/bubbles/off');
}

// trigger the bubble machine for 30 seconds!
var blowBubbles = function(){
  console.log('MACHINE STATUS : Blowing bubbles!');
  request.get('http://localhost:8080/bubbles/on');
  setTimeout(stopBubbles, 20000);
}

// send a tweet that says your bubbles are coming!
var bubbleTweet = function(tweet_doc){
  var random_num = Math.floor(Math.random()*bubble_messages.length);
  T.post('statuses/update', {status:'@'+tweet_doc.name+bubble_messages[random_num]}, function(err,reply){
    if (err) {logger.log('Tweet error: ', err);}
    console.log('MACHINE STATUS : Sending bubbles tweet '+(reply ? reply.text : reply));
  })
}

// send a tweet that says your tweet is queued!
var confirmTweet = function(username){
  var random_num = Math.floor(Math.random()*confirm_messages.length);
  T.post('statuses/update', {status:username+confirm_messages[random_num]}, function(err,reply){
    if (err) {logger.log('Confirm tweet error: ', err);}
    console.log('MACHINE STATUS : Confirm tweet '+(reply ? reply.text : reply));
  })
}

// Check the database for tweets. If there is one, tweet and bubble
var checkTweets = function(){
  var tweet = Tweet.find({sent:false}).sort({time:1}).limit(1) 
    tweet.exec(function(err,docs){
      if (docs.length > 0){
        //bubbleTweet(docs[0]);
        Tweet.update({_id:docs[0]._id},{sent:true})
        blowBubbles();
      }
    })
}

blowBubbles();
setInterval(checkTweets, 60000);
