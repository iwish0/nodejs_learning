var express=require('express');
var exphbs=require('express-handlebars'); // Templating engine
var logger=require('morgan'); // get the log of the request and put it on the console
var bodyparser=require('body-parser'); // récupère variable de formulaire, données au format json....et stocke cela dans un objet body accessible dont la requête a accès

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
	console.log('Bonjour');
})
app.post('/sign',function(req,res){
	res.render('sign',{param:req.body,title:"Affichage variable de formulaire"});
	console.log(req.body);

})

app.listen(3000, function(){
	console.log('The server starts')
});