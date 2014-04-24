var directionsDisplay;

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();

  var mapOptions = {
    center: new google.maps.LatLng(45.5, -73.5667),
    zoom: 10,
    disableDefaultUI:true
  };

  var map = new google.maps.Map($('#map-canvas')[0], mapOptions);

  directionsDisplay.setMap(map);

  var origin = $('#start');
  origin.val('Montreal, QC, Canada');

  var destination = $('#end');
  destination.val('Ottawa, ON, Canada');

  setAutocomplete(origin[0], map);
  setAutocomplete(destination[0], map);

  $('#go').on('click', search);

  var searchResultsContainer = $("<div>");
  searchResultsContainer.html("Litres : <span id='litres' class='value'>N/A</span> Cost (@ $<span id='cost_per_litre'>1.35</span> / L) : <span id='cost' class='value'>N/A</span>");
  searchResultsContainer.attr('id', "results");

  searchResultsContainer.attr('index', 1);
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(searchResultsContainer[0]);

  var directionsResultsContainer = $("<div>");
  directionsResultsContainer.attr('index', 1);
  directionsResultsContainer.attr('id', "directions");

  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(directionsResultsContainer[0]);

  directionsDisplay.setPanel(directionsResultsContainer[0]);

  var slider = $("<div>");
  slider.attr('id', "gasprice");

  slider.css('height', "50%");
  slider.css('margin', "20px");

    slider.slider({
      orientation: "vertical",
      min: 0,
      max: 200,
      value: 135,
      change: sliderChanged
  });

  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(slider[0]);
}

function sliderChanged(event, ui)
{
  $('#cost_per_litre').text(ui.value / 100);  
  updateCost();
}

$(document).ready(initialize);

function getLitres(mileage, metres)
{
  return (mileage * (metres/1000)/100);
}

function search()
{
  var origin = $('#start').val();
  var destination = $('#end').val();
  var mileage = $('#mileage').val();

  var directionService = new google.maps.DirectionsService();

  var directionRequest = {
    origin:origin,
    destination:destination,
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionService.route(directionRequest, function(res, status){
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(res);

      var litres = getLitres(mileage, res.routes[0].legs[0].distance.value).toFixed(2);

      $('#litres').html(litres);

      updateCost();
    }
  });
}

function updateCost()
{
  var gasPrice = $('#gasprice').slider('value') / 100;
  var litres = $('#litres').html();

  if(litres !== "N/A"){
    var costString = '$' + (gasPrice * litres).toFixed(2);

    $('#cost').text(costString);
  }
}

function setAutocomplete(input, map)
{
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
  });
}