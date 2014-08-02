var directionsDisplay;
var map;

$(document).ready(function() {
    initMap();
    initSearchFields();
    initCalculationResultsContainer();
    initGasPriceSlider();
  mixpanel.track("Page Load");
});

function initMap() {
    var mapOptions = {
        center: new google.maps.LatLng(45.5, -73.5667),
        zoom: 10,
        disableDefaultUI: true
    };

    map = new google.maps.Map($('#map-canvas')[0], mapOptions);
}

function initSearchFields() {
    var origin = $('#start');
    // origin.val('Montreal, QC, Canada');

    var destination = $('#end');
    // destination.val('Ottawa, ON, Canada');

    setAutocomplete(origin[0], map);
    setAutocomplete(destination[0], map);

    $('#go').on('click', search);
}

function initDirections() {
    if (directionsDisplay) {
        return;
    }

    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    var directionsResultsContainer = $("<div>");
    directionsResultsContainer.attr('index', 1);
    directionsResultsContainer.attr('id', "directions");

    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(directionsResultsContainer[0]);
    directionsDisplay.setPanel(directionsResultsContainer[0]);
}

function initCalculationResultsContainer() {
    var searchResultsContainer = $("<div>");
    searchResultsContainer.html("Litres : <span id='litres' class='value'>N/A</span> Cost (@ $<span id='cost_per_litre'>1.35</span> / L) : <span id='cost' class='value'>N/A</span>");
    searchResultsContainer.attr('id', "results");
    searchResultsContainer.attr('index', 1);

    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(searchResultsContainer[0]);
}

function initGasPriceSlider() {
    var slider = $("<div>");
    slider.attr('id', "gasprice");

    slider.slider({
        orientation: "vertical",
        min: 0,
        max: 200,
        value: 135,
        slide: sliderChanged
    });

    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(slider[0]);
}

function sliderChanged(event, slider) {
    $('#cost_per_litre').text((slider.value / 100).toFixed(2));
    updateCost();
}

function getLitres(mileage, metres) {
    return (mileage * (metres / 1000) / 100);
}

function search() {
    var origin = $('#start').val();
    var destination = $('#end').val();
    var mileage = $('#mileage').val();

    var directionService = new google.maps.DirectionsService();

    var directionRequest = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    };
    if ($('#roundtrip').prop('checked')) {
        directionRequest.destination = origin;
        directionRequest.waypoints = [{
            'location': destination
        }];
    }

    directionService.route(directionRequest, function(res, status) {
        if (status != google.maps.DirectionsStatus.OK) {
            return;
        }

        moveInputsToHeader();
        initDirections();
        directionsDisplay.setDirections(res);

        var legs = res.routes[0].legs;
        var litres = 0;
        for (var i = 0; i < legs.length; i++) {
            litres = litres + getLitres(mileage, legs[i].distance.value);
        }

        $('#litres').html(litres.toFixed(2));

        updateCost();
    });
}

function moveInputsToHeader() {
    var intro = $("#intro");
    var header = $("#header");

    var element = $("#input-wrapper").detach();
    element.removeClass("intro");
    $('#header').append(element);

    header.fadeIn(600);
    intro.remove();
}

function updateCost() {
    var gasPrice = $('#gasprice').slider('value') / 100;
    var litres = $('#litres').html();

    if (litres !== "N/A") {
        var costString = '$' + (gasPrice * litres).toFixed(2);

        $('#cost').text(costString);
    }
}

function setAutocomplete(input) {
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        infowindow.close();
    });
}