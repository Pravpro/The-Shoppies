function validatePassword(){
	if($("#password").val() != $("#confirm-password").val()) {
		$("#confirm-password").get(0).setCustomValidity("Passwords Don't Match");
	} else {
		$("#confirm-password").get(0).setCustomValidity('');
	}
}

$("#password").on("keyup", validatePassword);
$("#confirm-password").on("keyup", validatePassword);