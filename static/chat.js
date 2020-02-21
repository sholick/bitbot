
var updateTimeLogs = function(){
    	$( "span.timelog" ).each(function( index ){
    		date = $( this ).data( 'time' );
    		$( this ).html(moment.unix(date).fromNow(true));
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

$(document).ready(function(){

	var started = {
		c001: false,
		c002: false
	};
	//Date indicator
	timeNow = moment(new Date()).format("ddd ha");
	$("label#dateIndicator").html(timeNow);

  var preloadbg = document.createElement("img");
  preloadbg.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/timeline1.png";
  
	$("#searchfield").focus(function(){
		if($(this).val() == "Search contacts..."){
			$(this).val("");
		}
	});
	$("#searchfield").focusout(function(){
		if($(this).val() == ""){
			$(this).val("Search contacts...");
			
		}
	});
	
	$("#sendmessage input").focus(function(){
		if($(this).val() == "Send message..."){
			$(this).val("");
		}
	});
	$("#sendmessage input").focusout(function(){
		if($(this).val() == ""){
			$(this).val("Send message...");
			
		}
	});
		
	
	$(".friend").each(function(){		
		$(this).click(function(){


			var id_to_display = $(this).data('chatid');

			if (! started[id_to_display]){
				submit_message("Hi", '#' + id_to_display);
				started[id_to_display] = true;
			}
			else submit_message("I am back", '#' + id_to_display);

			var childOffset = $(this).offset();
			var parentOffset = $(this).parent().parent().offset();
			var childTop = childOffset.top - parentOffset.top;
			var clone = $(this).find('img').eq(0).clone();
			var top = childTop+12+"px";
			console.log(id_to_display);
			
			$(clone).css({'top': top}).addClass("floatingImg").appendTo("#chatbox");									
			
			setTimeout(function(){$("#profile p").addClass("animate");$("#profile").addClass("animate");}, 100);
			setTimeout(function(){
				$("#" + id_to_display).addClass("animate");
				$('.cx, .cy').addClass('s1');
				setTimeout(function(){$('.cx, .cy').addClass('s2');}, 100);
				setTimeout(function(){$('.cx, .cy').addClass('s3');}, 200);			
			}, 150);														
			
			$('.floatingImg').animate({
				'width': "100px",
				'left':'197px',
				'top':'20px'
			}, 200);
			
			var name = $(this).find("p strong").html();
			var email = $(this).find("p span").html();
																	
			$("#profile p").html(name);
			$("#profile span").html(email);
			$('#sendmessage').data("tochat", id_to_display);			
			
			//$(".message").not(".right").find("img").attr("src", $(clone).attr("src"));
			$('.chat-messages').hide();									
			$('#friendslist').fadeOut();
			$('#chatview').fadeIn();
			$('#' + id_to_display).fadeIn();
		
			
			$('#close').unbind("click").click(function(){				
				$(".chat-messages, #profile, #profile p").removeClass("animate");
				$('.cx, .cy').removeClass("s1 s2 s3");
				$('.floatingImg').animate({
					'width': "40px",
					'top':top,
					'left': '12px'
				}, 200, function(){$('.floatingImg').remove()});				
				
				setTimeout(function(){
					$('#chatview').fadeOut();
					$('#friendslist').fadeIn();				
				}, 50);
			});
			
		});
	});

	function icon(chatID){
		if (chatID=="#c001") return "static/logo.png"
		else return "static/myAvatar.png"
	}

	function submit_message(message, chatID) {


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
        input_message = $('#chatInput').val()

        // clear the text input 
        $('#chatInput').val('')
        submit_message(input_message, to)
        // return if the user does not enter any text
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
        

        // loading 
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

    $('#send').on('click', function(e){
    	send_message(e, '#' + $('#sendmessage').data("tochat"));
    });
    $('#message_box').on('submit', function(e){
    	send_message(e, '#' + $('#sendmessage').data("tochat"))
    });

    setInterval(updateTimeLogs, 4000);

    //createChart([1,2,3], "createChart");

});