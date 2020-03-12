
var updateTimeLogs = function(){
		var timespans = document.querySelectorAll('span.timelog');
		timespans.forEach(element => {
			var date = element.dataset.time;
			element.innerHTML = moment.unix(date).fromNow(true);
		});
    }

function genChartID(){
	time = moment(new Date()).unix().toString;
	generated = "__createChart_" + time;
	return generated;
}

moment.updateLocale('en', {
	relativeTime : {
		s: 'just now',
		ss: '%ssec',
		m: 'a min',
		mm: '%d min',
		h: 'an hour',
		hh: '%d hr',
		d: 'a day',
		dd: '%d days'
	}
})

document.addEventListener("DOMContentLoaded", function(event) { 

	var started = {
		c001: false,
		c002: false
	};
	timeNow = moment(new Date()).format("ddd ha");
	document.getElementById("dateIndicator").innerHTML = timeNow;
	//$("label#dateIndicator").html(timeNow);

  	var preloadbg = document.createElement("img");
  	preloadbg.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/timeline1.png";
  
	searchField = document.getElementById("searchfield");
	searchField.addEventListener('focusin', (event) => {
		if($(this).val() == "Search contacts..."){
			$(this).val("");
		}
	});
	searchField.addEventListener('focusout', (event) => {
		if($(this).val() == ""){
			$(this).val("Search contacts...");
			
		}
	});
	var sendBox = document.querySelector('#sendmessage input');
	sendBox.addEventListener('focus', (event) => {
		if (sendBox.value == "Send message...")
			sendBox.value = "";
	});
	sendBox.addEventListener('blur', (event) => {
		if (sendBox.value == "")
			sendBox.value = "Send message...";
	});

	/*$("#sendmessage input").focus(function(){
		if($(this).val() == "Send message..."){
			$(this).val("");
		}
	});
	$("#sendmessage input").focusout(function(){
		if($(this).val() == ""){
			$(this).val("Send message...");
			
		}
	});*/
		
	var chats = document.querySelectorAll(".friend");
	chats.forEach(element => {
		element.addEventListener('click', (event) => {
			var chatID = element.dataset.chatid;
			if (!started[chatID]){
				submit_message("Hi", "#" + chatID);
				started[chatID] = true;
			}
			else submit_message("I am back", "#" + chatID);

			var childOffset = element.offsetTop;
			var parentOffset = element.parentElement.parentElement.offsetTop;
			var childTop = childOffset - parentOffset;
			var clone = element.getElementsByTagName('img')[0].cloneNode(true);
			var top = childTop + 12 + "px";
			var cxcy = document.querySelectorAll('.cx, .cy');
			var oldstuff = document.querySelectorAll('.done');

			clone.style.top = top;
			clone.classList.add("floatingImg");
			document.getElementById("chatbox").appendChild(clone);

			oldstuff.forEach(element =>{
				element.parentNode.removeChild(element);
			})

			setTimeout(function(){
				clone.style.top = null;
				clone.classList.add("animate");
				var profile = document.getElementById("profile");
				profile.getElementsByTagName("p")[0].classList.add("animate");
				profile.classList.add("animate");
			}, 100);

			setTimeout(function(){
				document.getElementById(chatID).classList.add("animate");
				cxcy.forEach(element => {
					element.classList.add('s1');
					setTimeout(function(){
						element.classList.add('s2');
					}, 100);
					setTimeout(function(){
						element.classList.add('s3');
					}, 200);
				});			
			}, 150);

			var name = element.getElementsByTagName("p")[0].getElementsByTagName("strong")[0].innerHTML;
			var email = element.getElementsByTagName("p")[0].getElementsByTagName("span")[0].innerHTML;
			var chatview = document.getElementById('chatview');
			var friendsList = document.getElementById('friendslist');
			var chatMessages = document.querySelectorAll('.chat-messages');

			profile.getElementsByTagName("p")[0].innerHTML = name;
			profile.getElementsByTagName("span")[0].innerHTML = email;
			document.getElementById("sendmessage").dataset.tochat = chatID;

			chatMessages.forEach(element => {
				if (element.id != chatID)
					element.style.display = "none";
				else
					element.style.display = "block";
			});

			//document.getElementsByClassName('chat-messages')[0].style.display = "none";
			friendsList.classList.add('hide');
			chatview.classList.remove('hide');
			chatview.classList.add('show');
			document.getElementById(chatID).classList.add('show');

			document.getElementById("close").addEventListener('click', (event) => {
				event.preventDefault;
				//document.getElementsByClassName('chat-messages')[0].classList.remove("animate");
				//document.getElementsByClassName('chat-messages')[0].classList.add("hide");
				clone.classList.remove("animate");
				clone.classList.add("done");
				clone.style.top = top;
				//clone.parentNode.removeChild(clone);
				profile.classList.remove("animate");
				profile.getElementsByTagName("p")[0].classList.remove("animate");
				cxcy.forEach( element => {
					element.classList.remove("s1","s2","s3");
				});		
				
				setTimeout(function(){
					chatview.classList.remove("show")
					chatview.classList.add("hide");
					friendsList.classList.remove("hide")
					friendsList.classList.add("show");			
				}, 50);
			});
		});
	});

	function icon(chatID){
		if (chatID=="#c001") return "static/logo.png"
		else return "static/myAvatar.png"
	}

	function submit_message(message, chatID) {

		console.log(message);
		console.log(chatID);
        $.post( "/send_message", {message: message, to : chatID.substr(1)}, handle_response);

        function handle_response(data) {
        	console.log(data);
        	var len = data.message.length;
        	var params = data.parameters;
        	$.each(data.message, function( key, value){
        		setTimeout(function(){
        			$("#loading").remove();
        			timeNow = moment(new Date()).unix();
        			if (key!=len-1){
	        			var latestchat = $(`
		            <div class="message not-last"><img src=${icon(chatID)} class='icon' /><div class="bubble">
		                		<p>${value}</p>
		               <div class="corner"></div></div></div>
		               <div class="message not-last" id="loading">
		                    <img class='icon' src=${icon(chatID)} />
		                    <div class="bubble">
		                		<b>...</b>
		                	<div class="corner"></div>
		                        <span>typing</span>
		                    </div>
		            </div>`).appendTo(chatID);
	        		}
	        		else {
	        			if (value.startsWith('Chart__PloT__')){
	        				//var timestamp = moment(new Date()).unix().toString()
	        				var plotTime = genChartID();
	        				console.log(plotTime)

	        				divided = value.split("__")
	        				value = divided[4].split(',');

	        				var latestchat = $(`
					            <div class="message"><img src=${icon(chatID)} class='icon'/><div class="bubble">
					                		<p>The following graph shows the price of <strong>${divided[2]}</strong> in the past <i>${divided[3]}</i> :</p>
					                		<div class="chartContainer" id="${timeNow}"></div>
					                		<p class="note">Note: We assume no responsibility to data presented.</p>
					            <div class="corner"></div>
					            <span class="timelog" data-time=${timeNow}></span></div></div>
	        				`).appendTo(chatID);

	        				createChart(value, timeNow);
	        			}
	        			else if (value.startsWith('NeWs_!*_RanDOMEncodERx_!*_')){
	        				divided = value.split("_!*_")
	        				value = divided[3].split('<!>');
	        				if (divided[2] == "")
	        					var latestchat = 'I found the following news:<br/><br/>';
	        				else
	        					var latestchat = 'I found the following news about <strong>' + divided[2] + '</strong>:<br/><br/>';
	        				i = 0;
	        				while (i!=value.length && i != 5){
	        					fields = value[i].split('</>');
	        					latestchat += `<p><a href="${fields[1]}" target="_blank">${fields[0]}</a><br/>${fields[2]}<br/><span class="notesRead">${fields[3]} min read</span><br/><br/></p>`
	        					i++;
	        				}
	        				var toOutput = $(`
					            <div class="message"><img src=${icon(chatID)} class='icon'/><div class="bubble">
					                		${latestchat}
					            <div class="corner"></div>
					            <span class="timelog" data-time=${timeNow}></span></div></div>
	        				`).appendTo(chatID);
	        			}
	        			else {
	        				var latestchat = $(`
					            <div class="message"><img src=${icon(chatID)} class='icon'/><div class="bubble">
					                		<p>${value}</p>
					            <div class="corner"></div>
					            <span class="timelog" data-time=${timeNow}></span></div></div>
	        				`).appendTo(chatID);
	        			}
	        			updateTimeLogs();
	        		}
	        		$(chatID).animate({
        				scrollTop: $(chatID)[0].scrollHeight
        			}, 400);
        		}, 1000*key);
        	});

          
        }
    }

	var send_message = function(e, to, displayinput = true){
		console.log(to);
		e.preventDefault();
		if ($('#loading').length) return;

		timeNow = moment(new Date()).unix();
        input_message = $('#chatInput').val();

        $('#chatInput').val('');
        submit_message(input_message, to);
        if (!input_message) {
          return
        }
        if(displayinput){
        	$(to).append(`
            <div class="message right">
                    <img class='icon' src="static/avatar.png" />
                    <div class="bubble">
                		${input_message}
            			<div class="corner"></div>
                        <span class="timelog" data-time=${timeNow}></span>
                    </div>
            </div>
        `)
        }

        var latestchat = $(`
            <div class="message" id="loading">
                    <img class='icon' src=${icon(to)} />
                    <div class="bubble">
                		<b>...</b>
                	<div class="corner"></div>
                        <span>typing</span>
                    </div>
            </div>
        `).appendTo(to);

        $(to).animate({
        	scrollTop: $(to)[0].scrollHeight
        }, 1000);

        updateTimeLogs();

    }
    document.getElementById("send").addEventListener('click', (event) => {
    	send_message(e, '#' + $('#sendmessage').data("tochat"));
    });
    $('#message_box').on('submit', function(e){
    	send_message(e, '#' + $('#sendmessage').data("tochat"))
    });

    setInterval(updateTimeLogs, 4000);


});