const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs');
const ytdl = require('ytdl-core');
var Player;
var playlist = [];
var playing = false;
var channel;
var chatchannel;
var PlaylistMax = 50;
var request = require("request");
var guild;


function JsonRequest(url,callback){
	console.log(url);
	var data = request({url: url,json: true}, function (error, response, body) {
		//console.log(body);
        callback(body);
	});
}

function AddPlaylistSongs(url,message){
	json = JsonRequest(url,function(body){
		if(body['items'] != undefined || body['items'] != null){
			var NextPageToken = body['nextPageToken'];
			var count = 0;
			body['items'].forEach(function(item,index){
				var videourl = 'https://www.youtube.com/watch?v='+item['snippet']['resourceId']['videoId'];
				ytdl.getInfo(videourl, 'info',function(err,info){
					//console.log(info);
					AddSong(videourl,info['title'],info['author']['name'],info['length_seconds']);

				});


			});
			message.channel.sendMessage(body['items'].length +' songs has been added to the queue.');
		}


	});

}



var prefix = '!'; var commands = [];
var VC;


client.on('ready', () => {
  console.log('I am ready!');

  AddCommand('ping',function(message){
	  msgArray = message.content.split(' ');
	  message.channel.sendMessage("pong "+ client.ping + ' ms' +" "+ msgArray.slice(1).join(' '));
  });
  AddCommand('skip',function(message){
	  Skip();
  });
  AddCommand('help',function(message){
	  message.channel.sendMessage("```Hello world```");
  });
  AddCommand('join',function(message){
	  var author = message.author;
	  message.guild.channels.findAll('type','voice').forEach(function(item,index){
		  item['members'].array().forEach(function(gmember,index){
			  if(gmember['user'] === author){
				  VC = item.join();
				  message.channel.sendMessage("Joining "+item['name']+"...");

			  }
		  });

	  });

  });
  AddCommand('play',function(message){
		msgArray = message.content.split(' ');
		console.log(msgArray.length);
		if(msgArray.length >= 2){
			var author = message.author;
			  message.guild.channels.findAll('type','voice').forEach(function(item,index){
				  item['members'].array().forEach(function(gmember,index){
					  if(gmember['user'] === author){
								chatchannel = message.channel;
								channel = item;
								guild = message.guild;

								ytdl.getInfo(msgArray[1], 'info',function(err,info){
									if(info == null){//Im a playlist!!
										var playlistId = msgArray[1].split('=')[1];
										AddPlaylistSongs('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults='+PlaylistMax+'&pageToken=AIzaSyD3I9Ad8KnFxIbNyjfhnBxLy8Nd5NyRopU&playlistId='+playlistId+'&key=AIzaSyD3I9Ad8KnFxIbNyjfhnBxLy8Nd5NyRopU',message);
									}else{
										console.log(info['length_seconds']+" Time");
										AddSong(msgArray[1],info['title'],info['author']['name'],info['length_seconds']);
									}

								});


					  }
				  });

			 });
		}else{
			message.channel.sendMessage("Please provide a url.");
		}
  });

});

function AddSong(url,title,name,length){
	playlist.push(new Song(url,title,name,length));
	console.log(playlist);
	if(!playing){

		Play();
	}
}

function Skip(){
	console.log("Skipped")
	dispatcher.end();


}
function End(){
	console.log("Ended")
	playing = false;
	playlist = playlist.splice(1);
	Play();
}
//
//  function Play(){
// 	if(!playing && playlist.length > 0){
// 		   var voiceConnection = guild.voiceConnection;
// 		   if(voiceConnection){
// 			   playing = true;
//
// 			   dispatcher = voiceConnection.playStream(ytdl(playlist[0].url, { filter : 'audioonly' }));
// 			   dispatcher.on('end', (reason) => {
// 				  console.log('reason: '+ reason);
// 				  End();
// 				});
//
// 			   chatchannel.send("Playing " + playlist[0].name + " | " + playlist[0].author);
// 			   console.log("Playing " + playlist[0].name + " | " + playlist[0].author + " Length: " + playlist[0].length);
// 		   }else{
// 			   channel.join().then(Play);
// 		   }
// 	}
// }


 function Play(){
	if(!playing && playlist.length > 0){
    playing = true;
    channel.join()
    .then(connection => {
     const dispatcher = connection.playStream(ytdl(playlist[0].url, { filter : 'audioonly' })).on('end',End);

     chatchannel.send("Playing " + playlist[0].name + " | " + playlist[0].author);
	   console.log("Playing " + playlist[0].name + " | " + playlist[0].author + " Length: " + playlist[0].length);

    })
    .catch(console.error);



	}
}

client.on('message', message => {
	content = message.content + ' ';
	msgArray = message.content.split(' ');
	commands.forEach(function(item,index){
		if (message.content.startsWith(item.command)) {
			item.method(message);
		}

	});


});
function AddCommand(command,method){
	commands.push(new Command(prefix + command,method));
}
function Command(command,method){
	this.method = method;
	this.command = command;
}

function Song(url,name,author,length){
	this.url = url;
	this.name = name;
	this.author = author;
	this.length = length;
}


client.login('MzE5NDY5OTg4OTIwNTU3NTY4.DBYubw.lcotv1_kY82MCyjaowg51d5dbY8');
