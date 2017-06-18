var BREWERY_API_KEY = '664571fd14f1923c92e1d65ebcc73561';
var GOOGLE_API_KEY = 'AIzaSyDkXhOx9aHkfBE2HIP9JMUo3LHhMSE-Vlg';
var SPOT_INFO = [];
var COUNTY_NAMES = ['-select county-'];
var SPOT_NAMES = ['-select spot-']; 
var SELECTED_SPOT = {};
var BREWERY_INFO = [];

// gets the spot info from the SpitCast API and stores it into the SPOT_INFO array
// also gets the county names from SPOT_INFO and stores them into the COUNTY_NAMES array
//this list is used to generate the dropdown list in the main menu
$.getJSON("http://api.spitcast.com/api/spot/all", function(data) {
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
	//resets every time a new selection is made
	SELECTED_SPOT = {};
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
	findBreweries();
	console.log(BREWERY_INFO);
	initMap();
});

/*var findBreweries = function() {
	fetch('http://api.brewerydb.com/v2/search/geo/point?lat=' +
		SELECTED_SPOT.latitude + '&lng=' + SELECTED_SPOT.longitude + 
		'&key=' + BREWERY_API_KEY, {
  		mode: 'no-cors'
		}).then(function(response) { 
		// Convert to JSON
		return response.json();
		}).then(function(j) {
		// Yay, `j` is a JavaScript object
		console.log(j); 
		});
};*/

//gets brewery information by location from the brewerydDB website using
//the latitude and longitude of the selected spot
var findBreweries = function() {
	//resets BREWERY_INFO in case user changes their mind
	BREWERY_INFO = [];
	//had to use cors-anywhere proxy to get around CORS restriction
	$.getJSON('https://cors-anywhere.herokuapp.com' + 
		'/http://api.brewerydb.com/v2/search/geo/point?lat=' +
		SELECTED_SPOT.latitude + '&lng=' + SELECTED_SPOT.longitude + 
		'&key=' + BREWERY_API_KEY,
		//stores the data in BREWERY_INFO
		function(data) {
			BREWERY_INFO = data.data.map(function(item) {
				return item;
			});
			console.log(BREWERY_INFO);
		}
	);
};



//creates a map using Google Map API
var initMap = function() {
  var spot_location = {lat: SELECTED_SPOT.latitude, lng: SELECTED_SPOT.longitude};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: spot_location
  });
  var marker = new google.maps.Marker({
    position: spot_location,
    map: map
  });
}


