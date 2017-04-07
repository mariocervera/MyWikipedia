
/**
 * Global variable that stores the selected language
 */
var language;

/**
 * This function gets the input data from the form and sends an AJAX request to fetch content from Wikipedia
 */
function fetch() {
	
	// Get article name
	
	var articleName = document.getElementById("articleNameText").value;
	if(!articleName || articleName == "") {
		alert("The article name cannot be empty");
	}
	else {
		//Get language
	
		language = document.getElementById("languageSelect").value;
		
		// Format article name (replace blanks by underscores)
		
		var articleNameFormated = '';
		var words = articleName.trim().split(/[\s]+/);
		
		for(var i = 0; i < words.length; i++) {
			articleNameFormated += (words[i] + "_");
		}
		
		articleNameFormated = articleNameFormated.substring(0, articleNameFormated.length-1);
		
		// Send AJAX request to REST API
		// 
		// Query string parameters in the URL: 
		//    - action: parse (to obtain HTML text in the response)
		//    - page (the wikipedia page to parse)
		//    - section: 0 (retrieves only the overview)
		//    - format: json (to receive the response as JSON text)
		//    - origin: * (to avoid problems with cross-domain requests)
		
		var url = "https://" + language + ".wikipedia.org/w/api.php?action=parse&page=" + articleNameFormated + "&section=0&format=json&origin=*";
		
		var req = new XMLHttpRequest();
		req.onreadystatechange = stateChangeListener;
		
		req.open("GET", url, true);
		req.send();
		
		// Close menu (if mobile phone)
		
		if(window.innerWidth < 768) {
			closeMenu();
		}
	}
}

/**
 * This function gets the response from the server and shows the retrieved content
 */
function stateChangeListener() {
	
	if(this.readyState == 4 && this.status == 200){
	
		// Parse the json response
	
		var json = JSON.parse(this.responseText);
		
		// Show the response in the iframe
		
		var mainFrame = document.getElementById("frame1");
		mainFrame.contentWindow.document.open();
		
		if(json.error) {
			mainFrame.contentWindow.document.write('<html><body><p style="color:red">The requested page could not be found.</p></body></html>');
		}
		else {
			mainFrame.contentWindow.document.write("<html><body>" + getHTMLcontent(json) + "</body></html>");
		}
		
		mainFrame.contentWindow.document.close();
	}
}

/**
 * Opens the left-side menu (available for mobile phone)
 */
function openMenu() {
	
	// Hide hamburger button
	
	var hamburgerButton = document.getElementById("hamburgerButton");
	hamburgerButton.style.display="none";
	
	// Show menu
	
	var menuform = document.getElementById("searchForm");
	menuform.style.display="block";
	
	// Show close button
	
	var closeButton = document.getElementById("closeButton");
	closeButton.style.display="block";
	
}

/**
 * Closes the menu (available for mobile phone)
 */
function closeMenu() {
	
	// Show hamburger button
	
	var hamburgerButton = document.getElementById("hamburgerButton");
	hamburgerButton.style.display="block";
	
	// Hide menu
	
	var searchForm = document.getElementById("searchForm");
	searchForm.style.display = "none";
}

/**
 * This function clears the inline styles when the window is resized
 */
function clearInlineStyles() {

	if(window.innerWidth > 768) {
		var hamburgerButton = document.getElementById("hamburgerButton");
		hamburgerButton.style.removeProperty("display");
		
		var closeButton = document.getElementById("closeButton");
		closeButton.style.removeProperty("display");
		
		var menuform = document.getElementById("searchForm");
		menuform.style.removeProperty("display");
	}
}

/**
 * Given the json retrieved from the server, this function generates the HTML that will be displayed
 */
function getHTMLcontent(json) {
	
	// Add a title and a horizontal rule
	
	var html = '<h1>' + json.parse.title + '</h1>';
	html += '<hr/>';
	
	// Get the HTML text from the json
	
	var fullHTML = json.parse.text["*"];
	
	// Remove the info box tables. Can this be done using the REST API?
	// I want to obtain the summary (section 0) without any tables, images, etc.
	// I didn't find out how ...
	
	var found = true;
	
	do {
		var index1 = fullHTML.indexOf('<table class="infobox');
		if(index1 >= 0) {
			var firstPart = fullHTML.substring(0, index1);
			var rest = fullHTML.substring(index1);
			var index2 = rest.indexOf('</table>');
			if(index2 >= 0) {
				var secondPart = rest.substring(index2+8);
				fullHTML = firstPart + secondPart;
			}
		}
		else {
			found = false;
		}
	}
	while(found);
	
	// Convert relative paths into absolute paths (to fix links). Can this be done using the REST API?
	
	var replacement = 'target="_blank" href="https://' + language + '.wikipedia.org/wiki/';
	fullHTML = fullHTML.replace(/href=\"\/wiki\//g, replacement);
	
	html += fullHTML;
 	
	return html;
}
