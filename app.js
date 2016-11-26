var express=require('express');
var exphbs=require('express-handlebars'); // Templating engine
var logger=require('morgan'); // get the log of the request and put it on the console
var bodyparser=require('body-parser'); // récupère variable de formulaire, données au format json....et stocke cela dans un objet body accessible dont la requête a accès

var MongoClient=require('mongodb').MongoClient;
var assert=require('assert'); // Pour mongodb =>Permet de réaliser des tests en fixant en critère le résultat attendu pour une requêtes
var url = 'mongodb://localhost:27017/memberspace';

var app=express();

app.engine('.hbs', exphbs({defaultLayout: 'main',extname: '.hbs'})); //extname .hbs => permet de prendre les fichiers ayant l extension .hbs comme moteur de template au lieu de l'extension .handlebars par défaut
app.set('view engine', '.hbs');

app.use(express.static('public'))
.use(logger('combined'))
.use(bodyparser.urlencoded({ extended:false })); /** get form var and put them in a object body. This object will contain key-value pairs, so the req can get them
rappel pour comprendre le fonctionnement: En méthode post les variables de formulaire sont cachés dans le body de la requête
 **/

app.get('/',function(req,res){
	res.render('home');
});
app.get('/insert-form',function(req,res){
	res.render('form-register');
});
app.post('/insert-action',function(req,res){
	var param=req.body;
	MongoClient.connect(url,function(err,db){
		if(err){
			console.log(err);
		}else{
			db.collection('users').insertOne(
				{"pseudo":param.pseudo,"email":param.email,"password":param.password},
				function(err,result){
					assert.equal(null,err);
					assert.equal(1,result.insertedCount);
			
				db.close(function(){
				console.log('The server MongoDB is stoped');
				})
			})
		}
	})	
	res.redirect(301,'/find');
});
app.get('/update-form',function(req,res){
	res.render('update-form');
});
app.post('/update-action',function(req,res){
	var param=req.body;
	MongoClient.connect(url,function(err,db){
		if(err){
			console.log(err);
		}else{
			db.collection('users').updateOne({pseudo:param.previouspseudo},
				{$set:{pseudo:param.pseudo,email:param.email,age:param.age}},{upsert:true});
			res.redirect(301,'/find');
		}
	});
});
app.get('/delete-form',function(req,res){
	res.render('delete-form');
})
app.post('/delete-action',function(req,res){
	var param=req.body;
	MongoClient.connect(url,function(err,db){
		if(err){
			console.log(err);
		}else{
			db.collection('users').deleteOne({pseudo:param.pseudo});
			res.redirect('/find');
		}

	});
});
app.get('/find',function(req,res){
	MongoClient.connect(url,function(err,db){
		if(err){
			console.log(err);
		}else{
			db.collection('users').find().toArray(function(err,result){
				if(err){
					console.log(err);
				}else
				res.render('list-member',{result:result});
				db.close();
			})
	}
	})
});

app.listen(3000, function(){
	console.log('The server nodejs starts')
});