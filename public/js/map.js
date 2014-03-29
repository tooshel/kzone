var map;
var kzoneName, kzone, coords, label, searchCityMarker;
var city='';

console.log(document.URL)
var map = L.map('map', {zoomControl:false}).setView([18.967839, -20.836409], 2);

// loadChartData("./js/tempe.js");

L.tileLayer.provider('MapBox.vannizhang.hfdbbdi3').addTo(map);

$("#title").html("<p><h4>The Koppen climate classification</h4> is one of the most widely used climate classification systems. The system is based on the concept that native vegetation is the best expression of climate. Thus, climate zone boundaries have been selected with vegetation distribution in mind. It combines average annual and monthly temperatures and precipitation, and the seasonality of precipitation. <br><br> This map application is created to help you to explore different classifications and featured cities within zone boundaries.</p>");

function refreshSubgroup(e){
	$.get('http://localhost:8002/refreshSubgroup?maingroup=' + String(e))
     .success(function(d) {
     	updateSubgroup(d);
     })
     .error(function(d, textStatus, errorThrown) {
     	console.log('error!')
     })	
}

function updateSubgroup(data){
	var json_data = data;
	try {
    	$("#subgroup option").remove();
	}
	catch(err){
		//null
	}
    $("#subgroup").append("<option selected disabled>sub climate category</option>")
    for (var i=0; i<json_data.features.length; i++) {
 		$("#subgroup").append("<option value='"+json_data.features[i].properties.name+"'>"+json_data.features[i].properties.name+"</option>");
 	};
}

function showCity(data){
	var city_data=data;
	try {
    	map.removeLayer(cities);
	}
	catch(err){
		//null
	}
	cities = L.geoJson(data,{
		onEachFeature: CustomizePopUps
		//style: style
	}).addTo(map);
}

function showKzone(data){
	try {
		removeAllLayers();
	}
	catch(err){
		//null
	}

	kzone = L.geoJson(data,{
		style: style
	}).addTo(map);
	findCity(kzoneName);
    findClimateData(kzoneName);
}


function findCity(e){
	$.get('http://localhost:8002/findCity?kzone=' + String(e) +'&searchCity='+city)
     .success(function(d) {
     	showCity(d)
     })
     .error(function(d, textStatus, errorThrown) {
     	console.log(String(e)+' is not found.')
     })
}

function findKzoneShape(e){
	$.get('http://localhost:8002/findKzoneShape?kzone=' + String(e))
     .success(function(d) {
     	showKzone(d);
        $("#title").html("<h4>"+d.features[0].properties.name+":</h4>"+"<p>"+d.features[0].properties.description+"</p><hr>");
     })
     .error(function(d, textStatus, errorThrown) {
     	console.log(String(e)+' is not found.')
     })
}

function findKzone(e){
	$.get('http://localhost:8002/findKzoneValue?city=' + String(e))
     .success(function(d) {
     	kzoneName=d.features[0].properties.name;
     	console.log(kzoneName);
     	city=String(e);
        findKzoneShape(kzoneName);
        coords = L.latLng(d.features[0].geometry.coordinates[1], d.features[0].geometry.coordinates[0]);
        lable = '<b>'+d.features[0].properties.city_name+'</b>' + '<p>' + d.features[0].properties.name +'</p>';
        searchCityMarker = L.marker(coords).addTo(map).bindPopup(lable).openPopup();

     })
     .error(function(d, textStatus, errorThrown) {
     	console.log(String(e)+' is not found.')
     })
}

function findClimateData(e){
    $.get('http://localhost:8002/getClimateData?kzone=' + String(e))
     .success(function(d) {
        try{
              d3.select("#Temperature_chart_svg").remove();
              d3.select("#Precipitation_chart_svg").remove();
        }

        catch(error){

        }
        $("#T_chart_title").html("<h5>Temperatures Chart (in celsius)</h5>");
        drwaChart(d, "Temperature_chart_svg", "#T_chart", "t_label", "t_value", "t_desc");

        $("#P_chart_title").html("<h5>Precipitation Chart (in mm)</h5>");       
        drwaChart(d, "Precipitation_chart_svg", "#P_chart", "p_label", "p_value", "p_desc");
     })

     .error(function(d, textStatus, errorThrown) {
        console.log(String(e)+' is not found.')
     })
}

function CustomizePopUps(feature, layer) {
    if (feature.properties.city_name && feature.properties.cntry_name) {
        layer.bindPopup("<b>" + feature.properties.city_name + "</b><br><br>" + 
                        "<b>Country: </b>" + feature.properties.cntry_name + "<br />")
    }
}

function style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'none',
        dashArray: '1',
        fillOpacity: 0.8,
        fillColor: feature.properties.color
    };
}

function removeAllLayers(){
	map.removeLayer(kzone);
    map.removeLayer(cities);
}

$('#maingroup').change(function(event){
    refreshSubgroup(event.currentTarget.value);
});

$('#subgroup').change(function(event){
    try {
    map.removeLayer(searchCityMarker);
    }
    catch(err){
        //null
    }
    kzoneName=event.currentTarget.value;
  	findKzoneShape(kzoneName);
});

$('#placeInput').bind("enterKey",function(event){
  	// findKzone(event.currentTarget.value);
});

$('#placeInput').keypress(function(event){
    if(event.keyCode == 13)
    {
    	event.preventDefault()
        $(this).trigger("enterKey");
    }
});

$("#placeInput" ).autocomplete({
      source: function( request, response ) {
        console.log(request)
        $.ajax({
            url:"http://localhost:8002/autocompleteLookup",
            dataType: "jsonp",
            data: {
               searchText: request.term
            },
            success: function( data ) {
               response( $.map(data.features, function(feature) {
                    return {
                         label: feature.properties.label
                    }
                }));
            }
        });
    },
    minLength: 3,
    select: function( event, ui ) { 
        try {
            map.removeLayer(searchCityMarker);
        }
        catch(err){
            //null
        }
        findKzone(ui.item.label);
    }
});