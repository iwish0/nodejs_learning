var MongoClient = require( 'mongodb' ).MongoClient;
var url = 'mongodb://localhost:27017/memberspace';
var assert=require('assert'); // Pour mongodb =>Permet de réaliser des tests en fixant en critère le résultat attendu pour une requêtes

var _db;

module.exports = {
	connectToServer: function() {
	    MongoClient.connect(url, function( err, db ) {
	    	if(err){
	    		console.log(err);
	    	}else{
	    		console.log('Connexion avec le sgbd nosql MongoDB établie');
	    		_db = db;
	    	}
	    });
	  },
	getDb: function(){
	    return _db;
	}
};