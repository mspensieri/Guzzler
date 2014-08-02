var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Guzzler', mixpanel_token : process.env.MIXPANEL_API_TOKEN });
});

module.exports = router;
