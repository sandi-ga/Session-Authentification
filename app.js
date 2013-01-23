
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  //, user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , db = require('mongojs').connect('login', ['users']);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'My secret'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.set("view options", {layout: false});
  app.engine('html', require('ejs').renderFile);
});

// Login

app.get('/', function(req, res){
  // Check session
  if (!req.session.username) {
	// If false
	res.render('index.html', {title: 'Login', err: req.query['err']})
  }else{
	// If true
	res.redirect('/member');
  }
});

// Authenticate user

app.post('/login', function(req, res) {
  var select = {
      username: req.body.username
    , password: req.body.password
  };

  db.users.findOne(select, function(err, users) {
    if (!err && users) {
      // Register session
      req.session.username = req.body.username;
      res.redirect('/member');
    } else {
      // Login failed
      res.redirect('/');
    }
    
  });
});

// Member page

app.get('/member', function(req, res) {
  // Check session
  if (!req.session.username) {
	// If false
	res.redirect('/');
  } else {
	// If true
	res.render('member.html', {title: 'Member', username: req.session.username});
  }
});

// Logout

app.get('/logout', function(req, res) {
  //destroy session
  if (req.session.username) {
	req.session.destroy();
  }
  
  // Redirect to root
  res.redirect('/');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
