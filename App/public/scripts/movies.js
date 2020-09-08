function searchAndDisplay(query) {
	axios.get("https://www.omdbapi.com/?s=" + query + "&type=movie&apikey=746de64b")
	.then(response => {
		console.log(JSON.stringify(response.data));
		let resultsHtml = "";
		if(response.data["Response"] == "True"){
			resultsHtml += '<h4>Search Results for "' + $("#search").val() + '"</h4>';
			response.data["Search"].forEach( movie => {
				resultsHtml += '<div class="card mb-3">' +
						'<div class="row no-gutters">' +
							'<div class="col-md-4">' +
								'<img src="' + movie['Poster'] + '" class="card-img" alt="' + movie['Title'] + ' Poster">' +
							'</div>' +
							'<div class="col-md-8">' +
								'<div class="card-body">' +
									'<h5 class="card-title">' + movie['Title'] + '</h5>' +
									'<p class="card-text">' + movie['Year'] + '</p>' +
									'<button class="btn btn-outline-success nominate">Nominate</button>' +
									'<input type="hidden" value="' + movie["imdbID"] + '">' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>';
			});
		} else {
			console.log("Search was invalid!");
			resultsHtml += '<div class="alert alert-info" role="alert">' + 
				'Search did not return any results. Please try again.' + 
				'</div>';
		}
		$("#search-results").html(resultsHtml);
	})
	.catch( error => console.log(err));
}


// async function nominate(id){
	
// }

$("#search-btn").on("click", () => {
	searchAndDisplay($("#search").val());
});


$(document).on("click", ".nominate", function() {
	let imdbID = $(this).next().val();
	console.log(imdbID);
	axios.post("/nominate", {
		userId: $("#user-id").val(),
		movieId: imdbID
	})
	.then(response => {
		if(response.status == 200){
			let alertHtml = '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
				  'Movie successfuly added to nomination list! You have ' + response.data.nomsLeft + ' nominations left.' +
				  '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
					'<span aria-hidden="true">&times;</span>' +
				  '</button>' +
				'</div>';
			$(".container").first().prepend(alertHtml);
		}
	})
	.catch(error => console.log(error));
})

$("#search").on("keypress", e => {
	if(e.which == 13) {
		searchAndDisplay($("#search").val());
	}
})


