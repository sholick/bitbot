$(document).ready(function(){
	
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
			var childOffset = $(this).offset();
			var parentOffset = $(this).parent().parent().offset();
			var childTop = childOffset.top - parentOffset.top;
			var clone = $(this).find('img').eq(0).clone();
			var top = childTop+12+"px";
			
			$(clone).css({'top': top}).addClass("floatingImg").appendTo("#chatbox");									
			
			setTimeout(function(){$("#profile p").addClass("animate");$("#profile").addClass("animate");}, 100);
			setTimeout(function(){
				$("#chat-messages").addClass("animate");
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
			
			$(".message").not(".right").find("img").attr("src", $(clone).attr("src"));									
			$('#friendslist').fadeOut();
			$('#chatview').fadeIn();
		
			
			$('#close').unbind("click").click(function(){				
				$("#chat-messages, #profile, #profile p").removeClass("animate");
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

	function submit_message(message) {
        $.post( "/send_message", {message: message}, handle_response);
        function handle_response(data) {

          $("#loading").remove();

          var latestchat = $(`
            <div class="message">
                    <img src="static/logo.png" />
                    <div class="bubble">
                		<p>${data.message}</p>
                	<div class="corner"></div>
                        <span>1 min</span>
                    </div>
            </div>
        `).appendTo('#chat-messages');

          $('#chat-messages').animate({
        	scrollTop: $('#chat-messages')[0].scrollHeight
        }, 500);
          
        }
    }

	var send_message = function(e){
        e.preventDefault();
        const input_message = $('#chatInput').val()

        // clear the text input 
        $('#chatInput').val('')
        submit_message(input_message)
        // return if the user does not enter any text
        if (!input_message) {
          return
        }

        $('#chat-messages').append(`
            <div class="message right">
                    <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/2_copy.jpg" />
                    <div class="bubble">
                		${input_message}
            			<div class="corner"></div>
                        <span>1 min</span>
                    </div>
            </div>
        `)

        // loading 
        var latestchat = $(`
            <div class="message" id="loading">
                    <img src="static/logo.png" />
                    <div class="bubble">
                		<b>...</b>
                	<div class="corner"></div>
                        <span>1 min</span>
                    </div>
            </div>
        `).appendTo('#chat-messages');



        //scroll to bottom
        var box = $('.message').last();
        if(box){
        	//$('#chat-messages').scrollTop(box.position().top);
        }
        $('#chat-messages').animate({
        	scrollTop: $('#chat-messages')[0].scrollHeight
        }, 1000);

        // send the message
        //submit_message(input_message)
    }

    $('#send').on('click', function(e){
    	send_message(e)
    });
    $('#message_box').on('submit', function(e){
    	send_message(e)
    });



});
