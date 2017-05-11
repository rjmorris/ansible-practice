var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

router.get('/about', function(req, res){
  res.render('about', {
    title: 'About'
  });
});

router.get('/contact_us', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

module.exports = router;

