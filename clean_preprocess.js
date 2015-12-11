var seperate_line = '--------------------------------------';


print('');
print(seperate_line);
print('Step 1: clean incorrect id_menber which is less than 0.');
var reg = /^[1-9]+[0-9]*]*$/;     //reguar express determing whether it starts with a number（not include 0 ） .
db.tweets.find({}, {_id: 1, id_member: 1}).forEach(function(myDoc){
    if(!reg.test(myDoc.id_member) || myDoc.id_member < 0){          //if id_member does not satisfy the reg or less than 0, then do the next execute statement.
        db.tweets.update({_id: myDoc._id}, {$set: {id_member: 0}}, true, true);   //set the incorrect id_member "0".
      }
})
print('Step 1 Finished.');


print('');
print(seperate_line);
print('Step 2: clean incorrect text.');
var incorrect_Text = 0;
db.tweets.find({}, {_id: 1, text: 1}).forEach(function(myDoc){
    if(!reg.test(myDoc.text.length)){      //if the length of text is not a number or it is less than 0, then do the next execute statemnet.
        incorrect_Text++;                  //the number of incorrect text plus 1;
        db.tweets.update({_id: myDoc._id}, {$set: {text: '0'}}, true, true);      //set the incorrect text "0";
     }
})

print('There are ' + incorrect_Text + ' incorrect texts.');
print('Step 2 Finished.');



print('');
print(seperate_line);
print('Step 3: clean incorrect time.');

var incorrect_Time = 0;
var timeFormat = /^2014-06-[23][023456789]\s(([0-1][0-9])|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;     //regualr express detering whether the format of timestamp is correct.
db.tweets.find({}, {_id: 1, timestamp: 1}).forEach(function(myDoc){
    if(!timeFormat.test(myDoc.timestamp)){     //if the format of date is incorrect, then do the next execute satement.
        incorrect_Time++;                      //the number of incorrect time plus 1.
        print(myDoc.timestamp);                //print incorrect date.
    }
})

print('Step 3 Finished.');



