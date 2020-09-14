//Chris Nichols 7/2017
//Custom Click to Copy and Paste within the browser.
//Dependency: Requires JQuery.


// call func when elements .copy are clicked.
document.getElementsByClassName("copy").onclick = copyToClipboard();


function copyToClipboard(){

	//ensure there is a hidden element to hold copied content
	var clipbd = document.getElementById('#hiddenClipboard');
	if( typeof clipbd === 'undefined' ){

		//<div style="visibility:hidden;padding:0;margin:0;height:0" id="hiddenClipboard"></div>

		var divEl = document.createElement('div');
		divEl.id = 'hiddenClipboard';
		divEl.style.visibility = 'hidden';
		var b = document.getElement('body');
		b.appendChild(divEl);	
		clipbd = b.getElementById('#hiddenClipboard');	

	}
	var content = '';
	
	
	
	//does the clicked copy link have a target attribribute hard-coded?
	var att = $(this).attr('data-target-copy'); //e.g., string "div#myId";



	
	
	
	
	
	

	if($(this).text() === "Click to Copy"){	

		
		//clear clipboard.
		$(clipbd).text('');
		
		if( att && att !== '' ){ //target is named by the trigger element's data attribute.

			content = $(att).text();

		} else {

			//dynamically get the target element to copy:
			content = this.nextElementSibling.textContent;

		}



		//put copied content into our makeshift clipboard element:
		if( content.length > 0 ){
			
			clipbd.textContent(content);
		
			//set trigger's text to a Paste Message
			this.textContent('Click to Paste');

		} else {

			alert("Sorry. Nothing was Copied.");
		}



	} else {
		
		//this is a 'Click to Paste' event.
		$(this).text('Click to Copy');
		var target;
		content = $(clipbd).text();
		
		// is there an attribute target to paste into?
		// if so, is that an object, or is it text ("div#myDiv")		
		
		if( att && att !== '' ){ //target is named by the trigger element's data attribute.
			if( Array.isArray(att) ) {
				
				if( att.length > 1 ){					
					//iterate over the array of obj-dom-targets and paste the clipbd content to each.
					
				} else {					
					//append content to the one target element
					att[0].innerHTML = att[0].innerHTML + content;					
					
				}
				
				
			}
			//clear clipboard.
			//document.getElementById().textContent('');
			

		} else {

			//dynamically get the target element to paste to:
			target = this.nextElementSibling;
			var l = document.createElement('li');
			var s = document.createElement('span');
			
			s.id= 'admin-note';
			l.className= 'lineEnty';
			s.innerHTML = '>copied :';
			
			l.appendChild(s);
			l.innerHTML = l.innerHTML + content;
			if( typeof target !== 'undefined' ){
				target.appendChild(l);
			}
			
			

		}
		
		this.nextElementSibling.textContent(content);

	}



}