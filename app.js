var BREWERY_API_KEY = 'dbf47ab77756b4c1ea6042966226dcfe';
var COUNTY_NAMES = ['-select county-'];
var SPOT_NAMES = ['-select spot-']; 

//gets the county names from the SpitCast API and stores it into the COUNTY_NAMES array
//this list is used to generate the dropdown list in the main menu	
$.getJSON("http://api.spitcast.com/api/spot/all", function(data) {
	var i = 0;
	data.forEach(function(item) {
		if (COUNTY_NAMES[i] !== item.county_name) {
			COUNTY_NAMES.push(item.county_name);
			i++;
		};
	});
	$('.js-county').html(renderList(COUNTY_NAMES));
});

$('.js-county').change(function() {
	var county = $('.js-county option:selected').text();
	getSpotNames(county);
});

var getSpotNames = function(countyName) {
	$.getJSON("http://api.spitcast.com/api/spot/all", function(data) {
		SPOT_NAMES = ['-select spot-'];
		console.log(countyName);
		data.forEach(function(item) {
			if (item.county_name == countyName) {
				SPOT_NAMES.push(item.spot_name);
			};
		});
		$('.js-spot').html(renderList(SPOT_NAMES));
		$('.js-spot').removeClass('hidden');
	});
};

var renderList = function(list) {
	var listHTML = []; 
	var joinedList = '';
	listHTML = list.map(function(item) {
		return '<option value="' + item +'">' + item + '</option>';
	});
	joinedList = listHTML.join('');
	return joinedList;
};
