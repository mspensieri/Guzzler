function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 8,
    disableDefaultUI:true
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);

  var searchControlContainer = document.createElement('div');
  searchControl(searchControlContainer, map);

  searchControlContainer.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchControlContainer);

  var searchResultsContainer = document.createElement('div');
  searchResults(searchResultsContainer, map);

  searchResultsContainer.index = 1;
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(searchResultsContainer);
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
        var mileage = prompt('L/100km');

        var directionService = new google.maps.DirectionsService();

        var directionRequest = {
            origin:origin,
            destination:destination,
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionService.route(directionRequest, function(res, status){
          if (status == google.maps.DirectionsStatus.OK) {
            var distanceInMetres = res.routes[0].legs[0].distance.value;


            document.getElementById('mileage').innerHTML = mileage;
            document.getElementById('distance').innerHTML = distanceInMetres;
            document.getElementById('litres').innerHTML = getLitres(mileage, distanceInMetres);
            document.getElementById('results').style.display = "block";
          }
        });
}

function searchControl(controlDiv, map) {
  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map
  controlDiv.style.padding = '5px';

  var startPoint = document.createElement('input');
  startPoint.type = "text";
  startPoint.placeholder = "Start Point";
  startPoint.display = "block";
  startPoint.id = "start";
  controlDiv.appendChild(startPoint);

  var endPoint = document.createElement('input');
  endPoint.type = "text";
  endPoint.placeholder = "End Point";
  endPoint.display = "block";
  endPoint.id = "end";
  controlDiv.appendChild(endPoint);

  var go = document.createElement('input');
  go.type = "Submit";
  go.value = "Go";
  controlDiv.appendChild(go);

  google.maps.event.addDomListener(go, 'click', search);
}

function searchResults(containerDiv, map)
{
  containerDiv.style.padding = '5px';

  containerDiv.innerHTML = "L/100km : <span id='mileage'></span> Distance (metres) : <span id='distance'></span> Litres : <span id='litres'></span>";
  containerDiv.style['background-color'] = "white";
  containerDiv.style.color = "black";
  containerDiv.style['font-size'] = "20pt";
  containerDiv.id = "results";
}
