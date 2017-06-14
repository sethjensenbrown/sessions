var BREWERY_API_KEY = 'dbf47ab77756b4c1ea6042966226dcfe';
var SPOT_INFO = [];
var COUNTY_NAMES = ['-select county-'];
var SPOT_NAMES = ['-select spot-']; 
var SELECTED_SPOT = {};

//gets the county names from the SpitCast API and stores it into the COUNTY_NAMES array
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

//returns a string of options for a dropdown menu from the given list
var renderList = function(list) {
	var listHTML = []; 
	var joinedList = '';
	listHTML = list.map(function(item) {
		return '<option value="' + item +'">' + item + '</option>';
	});
	joinedList = listHTML.join('');
	return joinedList;
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

var initMap = function() {
  var uluru = {lat: SELECTED_SPOT.latitude, lng: SELECTED_SPOT.longitude};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
}

//event listener for submit button
//gets geoData for given lad and long
//uses geoData to find nearby breweries with BreweryDB
$('.js-go').on('click', function(event) {
	event.preventDefault();
	$('#map').removeClass('hidden');
	console.log(SELECTED_SPOT.latitude);
	console.log(SELECTED_SPOT.longitude);
	initMap();
});



