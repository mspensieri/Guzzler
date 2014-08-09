var directionsDisplay;
var map;

$(document).ready(function() {
    mixpanel.track("Page Load");
    initMap();
    initSearchFields();
    initCalculationResultsContainer();
    initGasPriceSlider();

    $('#directions-toggle').on('click', function(ev, el) {
        var element = $("#directions-toggle-label");
        var directionsElement = $("#directions");

        if (element.html() === "&lt;") {
            directionsElement.addClass("collapsed");
            $("#map-container").removeClass("shrink");
            element.html("&gt;");
        } else {
            directionsElement.removeClass("collapsed");
            $("#map-container").addClass("shrink");
            element.html("&lt;");
        }
    });
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
    addInput();
    addInput();
    $('#new-loc').on('click', addInput);
}

function addInput() {
    var container = $('#input-container');
    var numberOfChildren = container.children().length;

    var input = $("<input>");
    input.attr('id', "loc" + numberOfChildren);
    input.addClass('location-input');
    input.attr('placeholder', 'Enter a location');
    input.keyup(function(e) {
        if (e.keyCode == 13) {
            search();
        }
    });
    input.on('blur', search);


    setAutocomplete(input[0]);


    $('#new-loc').before(input);
}

function initDirections() {
    if (directionsDisplay) {
        return;
    }

    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    directionsDisplay.setPanel($("#directions")[0]);

    $('#directions-toggle').removeClass('hidden');
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
    var mileage = 7;

    var destinations = [];

    $(".location-input").each(function(index, element) {
        destinations.push($(element).val());
    });

    var count = destinations.length;

    if (count < 2) {
        return;
    }

    var directionService = new google.maps.DirectionsService();

    var slice = destinations.slice(1, count - 1);
    var waypoints = [];
    for (var index in slice) {
        waypoints.push({
            location: slice[index]
        });
    }

    var directionRequest = {
        origin: destinations[0],
        destination: destinations[count - 1],
        travelMode: google.maps.TravelMode.DRIVING
    };

    if (waypoints.length > 0) {
        directionRequest.waypoints = waypoints;
    }

    directionService.route(directionRequest, function(res, status) {
        if (status != google.maps.DirectionsStatus.OK) {
            return;
        }

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