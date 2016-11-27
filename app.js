var express=require('express');
var exphbs=require('express-handlebars'); // Templating engine
var logger=require('morgan'); // get the log of the request and put it on the console
var bodyparser=require('body-parser'); // récupère variable de formulaire, données au format json....et stocke cela dans un objet s'appelant body dont la requête a accès
var cookieSession=require('cookie-session'); 
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
 app.use(cookieSession({
	name:'session123', // name of the session (of the cookie in fact) . I can put what i want as name
	keys:['key1','key2'] //
}));
app.set('trust proxy', 1)  //Trust proxy first


app.get('/',function(req,res){
	var isSessionEmpty=req.session.isPopulated; /** I check for fun if the sesssion is empty or not. 
	If the session is not empty, it means that the identification was ok 
	(app.post('/identification-action') **/
	console.log(isSessionEmpty);
	res.render('home',{session:req.session}); /** req.session create the session or get it if the session already exists
	 send the session to the view **/
});
app.post('/logout',function(req,res){
	req.session=null; // I destroy the session

	res.redirect(301,'/');

});
app.post('/identification-action',function(req,res){
	param=req.body;
	MongoClient.connect(url,function(err,db){
		if(err){
			console.log(err);
		}else{ //&& count() renvoie un objet donc il faut lui passer une fonction de rappel pour acceder à sa variable count
			db.collection('users').find({pseudo:param.pseudo,password:param.password}).count(function(err,count){
				console.log('count vaut '+count);
				if(count==1){
					console.log('Identification Ok');
					db.collection('users').find({pseudo:param.pseudo,password:param.password}).toArray(function(err,result){
						// result renvoie un tableau d'objet => var result=[{pseudo: blabla, email: blable},{....},{....}];
						req.session.id=result[0].pseudo;
						req.session.email=result[0].email;
						res.redirect(301,'/');
					});
				}else{
					console.log('Identification Ko');
				}
			});
		}
	});
});
app.get('/insert-form',function(req,res){
	res.render('form-register',{session:req.session}); // 
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
	res.render('update-form',{session:req.session});
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
	res.render('delete-form',{session:req.session});
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
				// result renvoie un tableau d'objet => var result=[{},{},{}];
				if(err){
					console.log(err);
				}else
				res.render('list-member',{result:result,session:req.session});
				db.close();
			})
	}
	})
});

app.listen(3000, function(){
	console.log('The server nodejs starts')
});