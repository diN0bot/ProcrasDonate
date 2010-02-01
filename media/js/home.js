
$(document).ready( function() {
	$.getJSON("/get/mindfulmoments_posts/", function(r) {
		if (r.result == "success") {
			$("#blog_posts h3").after(r.html);
		}
	});
	
	$.getJSON("/get/procrasdonate_tweets/", function(r) {
		if (r.result == "success") {
			$("#procrasdonate_tweets h3").after(r.html);
		}
	});
});
