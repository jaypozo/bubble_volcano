var TwitterListen = require('twitterlisten'),
    twitter_listen = new TwitterListen(["kelohavolcano"]), 
    mongoose = require('mongoose'),
    auth_data = require('./auth_data.json'),
    gpio = require('pi-gpio'),
    Twit = require('twit');

var T = new Twit({
  consumer_key : auth_data.consumer_key,
  consumer_secret : auth_data.consumer_secret,
  access_token : auth_data.access_token,
  access_token_secret : auth_data.access_token_secret
})

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

mongoose.connect('mongodb://localhost/volcano');

var Tweet = mongoose.model("Tweet", {name:String, text:String, time:Number});

twitter_listen.on('tweet', function(event_data){
  var date = new Date();
  var current_time = date.getTime();
  console.log('MACHINE STATUS : Tweet heard: '+event_data.text);
  var tweet = new Tweet({name:event_data.user.screen_name, text:event_data.text, time:current_time});
  tweet.save();
  confirmTweet('@'+event_data.user.screen_name);
})

// stop blowing bubbles
var stopBubbles = function(){
  console.log('MACHINE STATUS : Stopping bubbles!');
  gpio.open(16, "output", function(err){
    gpio.write(16, 0, function(){
      gpio.close(16);
    })
  })
}

// trigger the bubble machine for 30 seconds!
var blowBubbles = function(){
  console.log('MACHINE STATUS : Blowing bubbles!');
  gpio.open(16, "output", function(err){
    gpio.write(16, 1, function(){
      gpio.close(16);
    })
  });
  setTimeout(stopBubbles, 30000);
}

// send a tweet that says your bubbles are coming!
var bubbleTweet = function(tweet_doc){
  var random_num = Math.floor(Math.random()*bubble_messages.length);
  T.post('statuses/update', {status:'@'+tweet_doc.name+bubble_messages[random_num]}, function(err,reply){
    if (err) {console.log('Error: ', err);}
    console.log('MACHINE STATUS : Sending bubbles tweet '+(reply ? reply.text : reply));
  })
}

// send a tweet that says your tweet is queued!
var confirmTweet = function(username){
  var random_num = Math.floor(Math.random()*confirm_messages.length);
  T.post('statuses/update', {status:username+confirm_messages[random_num]}, function(err,reply){
    if (err) {console.log('Error: ', err);}
    console.log('MACHINE STATUS : Confirm tweet '+(reply ? reply.text : reply));
  })
}

// Check the database for tweets. If there is one, tweet and bubble
var checkTweets = function(){
  var tweet = Tweet.find().sort({time:1}).limit(1) 
    tweet.exec(function(err,docs){
      if (docs.length > 0){
        bubbleTweet(docs[0]);
        Tweet.remove({_id:docs[0]._id}).exec();
        blowBubbles();
      }
    })
}

setInterval(checkTweets, 90000);
