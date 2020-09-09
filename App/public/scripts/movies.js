$(document).ready( () => {
	$("#nominations-list>input").each( async function(){
		let movId = $(this).val();
		await appendNomination($("#nominations-list"), movId);
		$(this).remove();
	});
});

async function appendNomination(list, imdbID) {
	try {
		let response = await axios.get("https://www.omdbapi.com/?i=" + imdbID + "&apikey=746de64b");
		console.log(response);
		if(response.data["Response"] == "True"){
			let nomHtml = 
				'<li class="list-group-item d-flex justify-content-between align-items-center">' + 
					response.data["Title"] + " (" + response.data["Year"] + ")" +
					'<button class="delete btn btn-outline-danger">' + 
						'<i class="far fa-trash-alt"></i>' + 
					'</button>' +
					'<input type="hidden" value="' + imdbID + '">' + 
				'</li>';
			list.append(nomHtml);
		}
	} catch(err) {
		console.log(err);
	}
}


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


async function nominate(id){
	try{
		let response = await axios.post("/nominate", {
				userId: $("#user-id").val(),
				movieId: id
			})
		// console.log(response);
		if(response.status == 200){
			let type = "", message = "";
			type = "alert-success";
			message = 'Movie successfuly added to nomination list! You have ' + response.data.nomsLeft + ' nominations left.';
			createAlert(type, message);
			appendNomination($("#nominations-list"), id);
		}
	} catch(error) {
		console.log(error);
	}
}

function createAlert(type, message){
	let alertHtml = '<div class="alert ' + type + ' alert-dismissible fade show" role="alert">' +
		  message +
		  '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
			'<span aria-hidden="true">&times;</span>' +
		  '</button>' +
		'</div>';
	$(".container").first().prepend(alertHtml);
}

$("#search-btn").on("click", () => {
	searchAndDisplay($("#search").val());
});


$(document).on("click", ".nominate", function() {
	if($("#nominations-list>li").length < 5) {
		let imdbID = $(this).next().val();
		nominate(imdbID);	
	} else {
		let type = "alert-danger";
		let message = "You have already nominated 5 Movies. Please remove a nominee to nominate another movie.";
		createAlert(type, message);
	}
})

$(document).on("click", ".delete", function() {
	let spinnerHTML = 
		'<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>' +
		'<span class="sr-only">Loading...</span>'
	$(this).html(spinnerHTML);
	// deleteNomination();
	axios.post("/nominate?_method=DELETE", { 
		userId: $("#user-id").val(), 
		movieId: $(this).parent().find("input").val()
	})
	.then( response => {
		if(response.status == 200){
			console.log(response.data);
			$(this).parent().remove();
		} else {
			createAlert("alert-danger", response.data);
		}
	} )
	.catch(err => console.log(err))
});

$("#search").on("keypress", e => {
	if(e.which == 13) {
		searchAndDisplay($("#search").val());
	}
})


