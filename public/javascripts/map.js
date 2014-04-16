var directionsDisplay;

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();

  var mapOptions = {
    center: new google.maps.LatLng(45.5, -73.5667),
    zoom: 10,
    disableDefaultUI:true
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  directionsDisplay.setMap(map);

  setAutocomplete(document.getElementById('start'), map);
  setAutocomplete(document.getElementById('end'), map);
  google.maps.event.addDomListener(document.getElementById('go'), 'click', search);

  var searchResultsContainer = document.createElement('div');
  searchResultsContainer.innerHTML = "Litres : <span id='litres' class='value'>N/A</span> Cost (@ $1.35 / L) : <span id='cost' class='value'>N/A</span>";
  searchResultsContainer.id = "results";

  searchResultsContainer.index = 1;
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(searchResultsContainer);

  var directionsResultsContainer = document.createElement('div');
  directionsResultsContainer.index = 1;
  directionsResultsContainer.id = "directions";

  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(directionsResultsContainer);

  directionsDisplay.setPanel(directionsResultsContainer);
}

google.maps.event.addDomListener(window, 'load', initialize);

function getLitres(mileage, metres)
{
  return (mileage * (metres/1000)/100);
}

function search()
{
  var origin = document.getElementById('start').value;
  var destination = document.getElementById('end').value;
  var mileage = document.getElementById('mileage').value;

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
      var cost = '$' + (1.35 * litres).toFixed(2);

      document.getElementById('litres').innerHTML = litres;
      document.getElementById('cost').innerHTML = cost;
    }
  });
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