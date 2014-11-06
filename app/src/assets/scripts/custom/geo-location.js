function locations() {

	'use strict';

	//basic map and global myData variable for the location.json data.
	var myData,
		myOptions = {
			center: new google.maps.LatLng(51.5087665, -0.1089613),
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	//ajax call for the location data
	$.ajax({
		url: 'responses/locations.html',
		type: 'GET',
		dataType: 'json',
		success: function(data) {
			myData = data.Stores;
		}
	});

	//click event to close mask and run the google maps functions.
	$('.overlay').on('click', function() {
		if (navigator.geolocation) {
			$('.spinner').show();
			$('.overlay .icon-container li:nth-child(2)').css('background', 'none');
			navigator.geolocation.getCurrentPosition(success, error);
		} else {
			error('Geo Location is not supported');
		}
	});

	function success(pos) {
		$('body').addClass('activated');
		$('.mask, .overlay, .loading').fadeOut(300);
		$('.spinner').hide();
		closestLocation(pos);
	}

	function error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	}

	function closestLocation(pos) {
		var myList = [];
		$.each(myData, function(a, b) {
			myData[a].distance = locationMaths(pos.coords.longitude, pos.coords.latitude, b.Position.Longitude, b.Position.Latitude);
			myList.push(myData[a]);
		});

		myList.sort(function(a, b) {
			return a.distance - b.distance;
		});

		$.each(myList, function(i) {
			$(".stores").append('<li id=' + i + '><p class="number">' + (i + 1) + '</p><div><h2>' + myList[i].Name + '</h2><p>' + myList[i].Address + '</p><a class="more-info-list">Store Details<span></span></a><p class="opening-hours">' + myList[i].OpeningHours + '</p><p class="distance">' + distance(myList[i].distance) + '</p></div></li>');
		});

		googleMaps(myList);
		addScrollBars();
	}

	function locationMaths(meineLongitude, meineLatitude, long1, lat1) {
		var erdRadius = 6371,
			Longitude = meineLongitude * (Math.PI / 180),
			Latitude = meineLatitude * (Math.PI / 180),
			long = long1 * (Math.PI / 180),
			lat = lat1 * (Math.PI / 180),
			x0 = Longitude * erdRadius * Math.cos(Latitude),
			y0 = Latitude * erdRadius,
			x1 = long * erdRadius * Math.cos(lat1),
			y1 = lat * erdRadius,
			dx = x0 - x1,
			dy = y0 - y1,
			calc = Math.sqrt((dx * dx) + (dy * dy));
		return calc;
	}

	function distance(calc) {
		if (calc < 1) {
			return Math.round(calc * 1000) + " m";
		} else {
			return Math.round(calc * 10) / 10 + " km";
		}
	}

	function addScrollBars(){
		$(".stores-container").mCustomScrollbar({
			scrollButtons: {
				enable: true
			},
			scrollInertia: 500
		});

		$('.more-info-list').on("click", function() {
			var target = $(this).closest('li');
			$(target).find('.more-info-list span').toggleClass('open');
			$(this).parent().find('.opening-hours').slideToggle(300, function() {
				$('.stores-container').mCustomScrollbar('scrollTo', $('.stores-container').find('.mCSB_container').find(target));
			});
		});
	}

	function googleMaps(myList) {
		var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions),
			markers = [],
			infowindow = new google.maps.InfoWindow(),
			bounds = new google.maps.LatLngBounds();

		$.each(myList, function(i) {
			markers.push(['<div class="info-window" data-target=' + i + '><h3>' + myList[i].Name + '</h3><p class="address">' + myList[i].Address + '</p></div>', myList[i].Position.Latitude, myList[i].Position.Longitude]);

			var pos = new google.maps.LatLng(markers[i][1], markers[i][2]),
				image = new google.maps.MarkerImage("images/icon.png", null, null, null, new google.maps.Size(30, 42));

			bounds.extend(pos);
			var marker = new MarkerWithLabel({
				position: pos,
				map: map,
				icon: image,
				labelContent: '' + (i + 1),
				labelAnchor: new google.maps.Point(3, 33),
				labelClass: "labels",
				labelInBackground: false
			});

			google.maps.event.addListener(marker, 'click', (function(marker, i) {
				return function() {
					infowindow.setContent(markers[i][0]);
					infowindow.open(map, marker);
					listanimtion();
				};
			})(marker, i));

			google.maps.event.addListener(infowindow, "closeclick", function(){

			});
		});

		map.fitBounds(bounds);
	}

	function listanimtion() {
		var InfoWindow = $('.info-window'),
			targetSelector = '#' + InfoWindow.attr('data-target');

		$('.stores-container').mCustomScrollbar('scrollTo', $('.stores-container').find('.mCSB_container').find(targetSelector));
		if (!$(targetSelector).find('.more-info-list span').hasClass('open')) {
			$(targetSelector).find('.more-info-list span').addClass('open');
			$(targetSelector).find('.opening-hours').delay(500).slideToggle(300, function() {
				$('.stores-container').mCustomScrollbar('scrollTo', $('.stores-container').find('.mCSB_container').find(targetSelector));
			});
		}
	}
}
locations();