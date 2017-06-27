var BREWERY_API_KEY = '664571fd14f1923c92e1d65ebcc73561';
var GOOGLE_API_KEY = 'AIzaSyDkXhOx9aHkfBE2HIP9JMUo3LHhMSE-Vlg';
var SPOT_INFO = [];
var COUNTY_NAMES = ['-select county-'];
var SPOT_NAMES = ['-select spot-']; 
var SELECTED_SPOT = {latitude: 0, longitude:0};
var BREWERY_INFO = [];
var RADIUS = 5;

// gets the spot info from the SpitCast API and stores it into the SPOT_INFO array
// also gets the county names from SPOT_INFO and stores them into the COUNTY_NAMES array
//this list is used to generate the dropdown list in the main menu
//had to use cors-anywhere proxy to get around CORS restriction
$.getJSON('https://cors-anywhere.herokuapp.com/http://api.spitcast.com/api/spot/all', function(data) {
	//copies spot data from SpitCast API into SPOT_INFO array
	data.forEach(function(item) {
		SPOT_INFO.push(item);
	});
	//counter for the CountyNames
	var i = 0;
	//if statement prevents duplicate county names being put into the array
	SPOT_INFO.forEach(function(item) {
		if (COUNTY_NAMES[i] !== item.county_name) {
			COUNTY_NAMES.push(item.county_name);
			i++;
		};
	});
	//once list is generated, the options are added to the dropdown menu
	$('.js-county').html(renderList(COUNTY_NAMES));
});

//returns a string of html for the options of a dropdown menu
//based on the given array
var renderList = function(list) {
	var listHTML = []; 
	var joinedList = '';
	listHTML = list.map(function(item) {
		return '<option value="' + item +'">' + item + '</option>';
	});
	joinedList = listHTML.join('');
	return joinedList;
};

//event listener for the county dropdown menu
$('.js-county').change(function() {
	var county = $('.js-county option:selected').text();
	//once a county is selected, a list of spots in that county is created
	getSpotNames(county);
});

//gets the spot names for a specified county
//once the list is created it is turned into html for a dropdown menu
var getSpotNames = function(countyName) {
	//resets SPOT_NAMES array, -select spot- is the default
	SPOT_NAMES = ['-select spot-'];
	//finds all spots with the given county name
	SPOT_INFO.forEach(function(item) {
		if (item.county_name == countyName) {
			SPOT_NAMES.push(item.spot_name);
		};
	});
	//adds options to the dropdown menu
	$('.js-spot').html(renderList(SPOT_NAMES));
	//spot dropdown menu is hidden until a county is selected
	$('.js-spot').removeClass('hidden');	
};


//event listener for spot selection
//stores the info from the selected spot in SELECTED_SPOT object
$('.js-spot').change(function() {
	//resets spot and radius every time a new selection is made
	SELECTED_SPOT = {};
	RADIUS = 5;
	//makes submit button visible once spot is selected
	$('.js-go').removeClass('hidden');
	var spotName = $('.js-spot option:selected').text();
	SELECTED_SPOT = SPOT_INFO.find(function(item) {
		return item.spot_name === spotName;
	});
});

//event listener for submit button
//uses geoData to find nearby breweries with BreweryDB
$('.js-go').on('click', function(event) {
	event.preventDefault();
	$('#map').removeClass('hidden');
	$('.js-surf').removeClass('hidden');
	$('.js-beer').removeClass('hidden');
	findForecast();
	findBreweries();
});

//gets surf forecast from Spitcast API
var findForecast = function() {
	$.ajax({
		//had to use cors-anywhere proxy to get around CORS restriction
		url: 'https://cors-anywhere.herokuapp.com/' + 
		'http://api.spitcast.com/api/spot/forecast/' + SELECTED_SPOT.spot_id +'/',
		success: function(data) {
			//stores desired info in forecast array
			var forecast = data.map(function(item) {
				return {
					hour: item.hour,
					shape: item.shape_full,
					size: item.size
				};
			});
			//uses forecast info to create desired HTML elements
			var forecastHTML = forecast.map(function(item) {
				return '<div class="forecast">' +
				'<p>' + item.hour + ': ' + item.size + 'ft ' + item.shape + '</p>'
				+ '</div>';
			});
			//puts HTML into DOM
			$('#forecast_container').html(forecastHTML.join(''));
		},
		//if no forcast info found, adds message to page
		error: $('#forecast_container').html("<p>Sorry, we don't have any forcast info for this spot today!</p>")

	});
}

//gets brewery information by location from the brewerydDB website using
//the latitude and longitude of the selected spot
var findBreweries = function() {
	//resets BREWERY_INFO in case user changes their mind
	BREWERY_INFO = [];
	//had to use cors-anywhere proxy to get around CORS restriction
	$.ajax({
		url: 'https://cors-anywhere.herokuapp.com' + 
		'/http://api.brewerydb.com/v2/search/geo/point?lat=' +
		SELECTED_SPOT.latitude + '&lng=' + SELECTED_SPOT.longitude + 
		'&radius=' + RADIUS +
		'&key=' + BREWERY_API_KEY, 
		success: function(data) {
			//stores the data in BREWERY_INFO
			//try-catch in case no breweries found in this radius
			try{
				BREWERY_INFO = data.data.map(function(item) {
					return item;
				});
				//calls function that creates map
				$('#map_canvas').removeClass('hidden');
				initMap();
			}
			catch(e) {
				$('#map_canvas').html("<p>Sorry, we didn't find any beer near here.</p>" +
					"<p>Don't be salty, fancy beer is hard to find!</p>" +
					"<a id='try-again' class='light-blue' href='#'>Click here to try again with a bigger search radius.</a>");
				$('#map_canvas').removeClass('hidden');
				$('#results_container').html("<p>Sorry, we didn't find any beer near here.</p>");
			}
		},
	});
};

//retries AJAX request with bigger search radius
$('#map_canvas').on('click', '#try-again', function(event) {
	RADIUS += 5;
	console.log('radius is now: ' + RADIUS);
	findBreweries();
});

//creates a map using Google Map API
function initMap() {
	var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };
                    
    //displays a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);

    //creates a marker for the surf spot using wave icon
    var surfIcon = {
    		url: 'https://static.wixstatic.com/media/2564b3_81d36f8158f742fb9b929f66d7ec2914~mv2.png_256',
			scaledSize: new google.maps.Size(30, 30)	
		};
    var spotPosition = new google.maps.LatLng(SELECTED_SPOT.latitude, SELECTED_SPOT.longitude);
        bounds.extend(spotPosition);
  	var beachMarker = new google.maps.Marker({
    	position: spotPosition,
    	map: map,
    	icon: surfIcon
  	});
  	var spotInfoWindow = new google.maps.InfoWindow({
  		content: '<h3 class="black-text">' + SELECTED_SPOT.spot_name + '<h3>'
  	});
  	beachMarker.addListener('click', function() {
    	spotInfoWindow.open(map, beachMarker);
    });
        
    //creates an array to hold params for map markers
    var markers = BREWERY_INFO.map(function(item) {
    	return [item.brewery.name, item.latitude, item.longitude];
    })
                        
    //creates html for info windows for map markers
    var infoWindowContent = BREWERY_INFO.map(function(item) {
    	return ['<div class="info_content">' +
        '<h3 class="black-text">' + (item.brewery.name || '') + '</h3>' +
        '<p class="black-text">' + (item.streetAddress || '') + '</p>' +
        '<p class="black-text">' + (item.locality || '') + ', ' + (item.region || '') + ' ' + (item.postalCode || '') + '</p>' +
        '<p class="black-text">' + (item.phone || '') + '</p>' +
        '<p class="black-text">' + (item.hoursOfOperation || '') + '</p>' +
        '<p><a id="try-again" class="light-blue" href="' + (item.website || 'http://www.brewerydb.com/brewery/' + item.brewery.id) + 
        '">' + (item.website || 'http://www.brewerydb.com/brewery/' + item.brewery.id) + '</a></p>' +
    	'</div>']
    });
        
    //displays multiple markers on the map
    var infoWindow = new google.maps.InfoWindow(), marker, i;
    
    //loops through the array of markers & places each one on the map  
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0],
            icon: {
    			url: 'http://www.free-icons-download.net/images/beer-icons-46158.png',
				scaledSize: new google.maps.Size(30, 30)	
			}
        });
        
        //allows each marker to have an info window    
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.open(map, marker);
            }
        })(marker, i));

        //automatically centers the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    //adds brewery info as a list below the map
    $('#results_container').html(infoWindowContent.join('<hr>'));
    $('#results_container p,h3').removeClass('black-text');
};
