
var seperate_line = '----------------------------------';
var total_tweets = db.tweets.find().count()-45;              //find the total number of tweetes, because there are 45 incorrect text, wo should minus 45;




print('');
print(seperate_line);
print('Query1: How many unique user are there?');
var total_user = db.tweets.distinct("id_member").length; //find unique user by "distinct"
print('Total user:'+total_user);


print('');
print(seperate_line);
print('Query2: How many tweets(%) did the top 10 users(measured by the number of messages) publish?');
var top_10 = db.tweets.aggregate([{$group:{_id:"$id_member",num_tweets:{$sum:1}}},{$sort:{num_tweets:-1}},{$skip:1},{$limit:10}]);
//aggregate the collection of tweets according to the id_member, and sort it according to the number of tweets published by the same user. The value of -1 to specify an descending sort.
var i = 0, top10_tweets = 0;
while(i<10)   //calculate all tweets published by the top 10 user.
{
	top10_tweets += top_10['_firstBatch'][i]['num_tweets'];
	print('id_member: '+ top_10['_firstBatch'][i]['_id'] );
	print( 'num_tweets: '+top_10['_firstBatch'][i]['num_tweets']);
	print('');
	i++;
}
print('The top 10 users published: ' +top10_tweets/total_tweets *100 + " %");



print(''); 
print(seperate_line); 
print('Query3:What was the earliest and lastet data (YYYY-MM-DD HH:MM:SS) that a message was published?'); 
var earliest_date = db.tweets.find({},{"timestamp":1,"_id":0}).sort({timestamp: 1}).limit(1); 
//sort the collection of tweets according to the timestammp, and the value of 1 to specify an ascending sort.

if (earliest_date.length()) {                         //if the earliset_date is not null, then do the next execute statement.    
    de = earliest_date[0];                             //take the first data.     
    print( 'Earliest date: '+de['timestamp']);         //print the data in timestamp field.
 }
var latest_date = db.tweets.find({},{"timestamp":1,"_id":0}).sort({timestamp: -1}).limit(1);   
//sort the collection of tweets according to the timestammp, and the value of -1 to specify an descending sort.
if (latest_date.length()){                            //if the latest_date is not null, then do the next execute statement.
   dl = latest_date[0];                                //take the first data.
   print('Latest_date: '+ dl['timestamp']);            //print the data in timestamp field.
}



print('');
print(seperate_line);
print('Query4: What is the mean time delta between all message?');

var Date_latest = new Date(dl['timestamp']);     //new a Date_latest varibale in format of JavaScript.
var Date_earliest= new Date(de['timestamp']);    //new a Date_earliest varibale in foramat of JavaScript.
var date_difference = Date_latest - Date_earliest;   // compute the difference between this period in the unit of millisecond.
//print(date_difference);
var delta_mean = date_difference/(total_tweets-1)/1000;   // compute the delta_mean
print('The mean time delta is: '+ delta_mean + "  seconds.");




print('');
print('');
print('');
print(seperate_line);
print('Query5: What is the mean length of a message');
var s = 0;
db.tweets.find({},{"text":1 , "_id":0}).forEach(function(myDoc){          //take every data in text field by forEach(function()).
	if (myDoc && myDoc!=undefined && myDoc.text != undefined) {
		s += myDoc.text.length;                                               //add the length of all text together.
	}
});
print('Mean length of a message: ' + s/total_tweets);                     //the total length of tweets is divided by teh number of total tweets.



print('');
print(seperate_line);
print('Query6: What are the 10 most common unigram and bigram strings within the  message?');
function textToNgram(text, n){
	var ngram = [];   //new an array 
	var unigrams = text.split(' ');  // split a text into single word by spacing.
	for(var i = 0; i <= unigrams.length - n; i++){  //a loop to traverse every "unigram"  
		var grams = unigrams.slice(i,i+n);       // slice the array into two words combined together 
		ngram.push(grams.join(' '));             // put every two words together
	}
	return ngram;
}

var tweets = db.tweets.find();
// var len = 0;
// var hash_count = 0;

var unigram_map = {};   //a dictionary used to save single words and the number of time it appears, it's default value is 0
var bigram_map = {};    //a dictionary used to save  words and the number of time it appears, it's default value is 0
for(var i = 0;i < total_tweets; i ++ ) {   //a loop to traverse every text 
	 var text = tweets[i]['text'];        //take every text from record storing to varibale "texr"
	// len += text.length; 

	// hash_count += (text.match(/#/g)||[]).length;

	
	var unigrams = text.split(' ');     //split a text into single word by spacing, and store them to varibale "unigram"
	for (var j = 0; j < unigrams.length; j ++) {    //a loop to traverse content in every "unigram"
		if (unigram_map[unigrams[j]] == undefined) {   // if a word appears first time, it means that it does not exist in dictionary "unigram_map"
			unigram_map[unigrams[j]] = 1;              //then set the number of appearing time of this word 1 in the "unigram_map"
		}else {
			unigram_map[unigrams[j]] ++;               // if the word appeared before, then add 1 the number of appearing time
		}
	}

	var bigrams = textToNgram(text,2);             //call the function "textToNgram", and assign the value of "ngram" to "bigrams"
	for (var j = 0; j < bigrams.length; j ++) {    //a loop to traverse content in every "bigram"
		if (bigram_map[bigrams[j]] == undefined) { //if bigram words appear first time, it means that it does not exist in dictionary "bigram_map"
			bigram_map[bigrams[j]] = 1;            //then set the number of appearing time of bigram word 1 in the "biigram_map"
		}else {
			bigram_map[bigrams[j]] ++;            // if the bigram word appeared before, then add 1 to the number of appearing time
		} 
	}
}

var unigram_keys = Object.keys(unigram_map); // 
var unigram_arr = [];
for (var i = unigram_keys.length - 1; i >= 0; i--) {
	unigram_arr.push({'name':unigram_keys[i],'v':unigram_map[unigram_keys[i]]});
};

var comp = function(a,b){ if (a.v<b.v) {return 1;}else if(a.v>b.v){ return -1;} else{ return 0;}};
var unigram_sorted = unigram_arr.sort(comp);

print('The 10 most common unigrams as following: ');
for (var i = 0,j = (unigram_sorted.length > 11? 11 : unigram_sorted.length- 1); i < j; i++) {
	var unigram = unigram_sorted[i];
	print(unigram['name'] +' - ' + unigram['v']);
};

print('The 10 most common bigrams as following: ');
var bigram_keys = Object.keys(bigram_map);
var bigram_arr = [];
for(var i = bigram_keys.length - 1; i >=0; i--){
   bigram_arr.push({'name':bigram_keys[i],'v':bigram_map[bigram_keys[i]]})
};

var bigram_sorted = bigram_arr.sort(comp);

for(var i = 0, j = (bigram_sorted.length > 11? 11 : bigram_sorted.length - 1); i < j; i++){
    var bigram = bigram_sorted[i];
	print(bigram['name'] +' - ' + bigram['v']);

};







print('');
print(seperate_line);
print('Query7: What is the average number of hashtags(#)used within a message?');
var sum_Hashtag = 0;
var reg = new RegExp('#','g');          //regular expression matching the hashtag(#), "g" means global matching all hashtag
db.tweets.find({}, {_id: 1, text: 1}).forEach(function(myDoc){            //retrieval every data in text field by forEach(function()).
var matching = myDoc.text.match(reg);                                     //put the "#" in the varibale matching.
if(matching !== null){                                                    //if the matching is not null, do the next execute statement.
sum_Hashtag += matching.length;                                           //calculate number of all "#".
}
})
print('There are ' + sum_Hashtag + ' hashtags(#) and only ' + (sum_Hashtag / total_tweets) + ' used per message.');



print('');
print(seperate_line);
print('Query8: Which are within the UK contains the largest number of published  message?');
var South_East_England = db.tweets.find({geo_lat:{$gt:51,$lt:52},geo_lng:{$gt:-1,$lt:1.5}}).count();
print('South_East_England: '+ South_East_England);

var London =db. dtweets.find({geo_lat:{$gt:51.321456,$lt:51.745171},geo_lng:{$gt:-0.483398 ,$lt:0.127500263672}}).count();
print('London: '+ London);

var North_West_England = db.tweets.find({geo_lat:{$gt:53.779028,$lt:54.855556},geo_lng:{$gt:-3.691389,$lt:-2.043457}}).count();
print('North_West_England: '+ North_West_England);

var East_England = db.tweets.find({geo_lat:{$gt:51.813143,$lt:52.806944},geo_lng:{$gt:0.643945,$lt:1.757813}}).count();
print('East_England: '+East_England);

var West_Midlands = db.tweets.find({geo_lat:{$gt:51.704339,$lt:52.272640},geo_lng:{$gt:-2.46094,$lt:-1.880354}}).count();
print('West_Midlands: '+ West_Midlands);

var South_West_England = db.tweets.find({geo_lat:{$gt:50,$lt:51.5},geo_lng:{$gt:-6,$lt:-2 }}).count();
print('South_West_England: '+ South_West_England);

var Yorkshire_Humber = db.tweets.find({geo_lat:{$gt:53.570764,$lt:54.448751},geo_lng:{$gt:-1.801758,$lt:-0.955078}}).count();
print('Yorkshire_Humber: '+ Yorkshire_Humber);

var East_Midlands = db.tweets.find({geo_lat:{$gt:52.847018,$lt:53.622925},geo_lng:{$gt:-1.40625,$lt:0.153809 }}).count();
print('East_Midlands: '+ East_Midlands);

var North_East_England = db.tweets.find({geo_lat:{$gt:54.8,$lt:55.7},geo_lng:{$gt:-2.2,$lt:1.15}}).count();
print('North_East_England: '+ North_East_England);

var North_Ireland = db.tweets.find({geo_lat:{$gt:53.999159,$lt:55.044811},geo_lng:{$gt:-7.536621 ,$lt:-5.515137}}).count();
print('North_Ireland: '+ North_Ireland);

var Wales = db.tweets.find({geo_lat:{$gt:51.2,$lt:53.5},geo_lng:{$gt:-2.2,$lt:1.15}}).count();
print('Wales: '+ Wales);

var Scotland = db.tweets.find({geo_lat:{$gt:55.731234,$lt:58.520477},geo_lng:{$gt:-7.053222,$lt:-1.977539}}).count();
print('Scotland: '+Scotland);

var areas = [South_East_England, London, North_West_England, East_England, West_Midlands, South_West_England, Yorkshire_Humber, East_Midlands, North_East_England, North_Ireland, Wales, Scotland];

var areasnames = ['South_East_England', 'London', 'North_West_England', 'East_England', 'West_Midlands', 'South_West_England', 'Yorkshire_Humber', 'East_Midlands', 'North_East_England', 'North_Ireland', 'Wales', 'Scotland'];
var max_area = 0;
var max_index = 0;
for (var i =0 ;i < areas.length;i ++) {
	if (areas[i] > max_area) {
		max_area = areas[i];
		max_index = i;
	}
}

print(areasnames[max_index]+' contains the largest number of published messages: '+ max_area);