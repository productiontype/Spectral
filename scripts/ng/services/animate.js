angular.module('App').factory('animate', function() {
  	return {
  		animeSingleWithDelay: function(item, animeClass, delay){
  			if($(item).hasClass(animeClass))return
  			$(item).removeClass(animeClass);
  			setTimeout(function(){
  				$(item).addClass(animeClass);
  			}, delay);
  		},
  		animeGroupWithDelay: function(items, animeClass, delay) {
  			if($(items).hasClass(animeClass))return
  	    	$(items).removeClass(animeClass);

			var d = 0
  	    	$(items).each(function(idx,el){
  	    		d = delay * idx;

  	    		setTimeout(function(){
  	    			$(el).addClass(animeClass);
  	    		}, d);
  	    	});

  		},
  		animeBarWithDelay: function(items, delay){
  			if($(items).hasClass('animated'))return
  			var d = 0
  			$(items).each(function(idx,el){
  				d = delay * idx;
  				setTimeout(function(){
  					var value = $(el).data('value');
  					$(el).children('.barval')
  						.css({width:0})
  						.animate({
  							width: value+'%'
  						});
  					$(el).addClass('animated');
  				}, d);
  			});
  		},
  		animeGroupNumberWithDelay: function(items, delay){
  			if($(items).hasClass('animated'))return
  			var d = 0
  			$(items).each(function(idx,el){
  				d = delay * idx;
  				setTimeout(function(){
  					var val = 0;
  					var to = $(el).data('value');

  					$(el).text('0').css({opacity:1});
  					var timer = setInterval(function(){
  						val += 1;
              //console.log(val, to)
  						$(el).siblings('sup').css({opacity:1});
  						$(el).text(val).addClass('animated');
  						if(val > to-1)clearInterval(timer);
  					}, delay);
  				}, d);
  			});
  		},
        animeGroupHeightDelay: function(items, delay){
			if($(items).hasClass('animated'))return
			var d = 0
			$(items).each(function(idx,el){
				d = delay * idx;
				setTimeout(function(){
					var value = $(el).data('value');
					var color = $(el).data('color');
					
					$(el)
						.css({height:0, 'background':color})
						.animate({
							height: value+'%'
					});
					$(el).addClass('animated');
				}, d);
			});		
		},
        animeGroupPastille: function(items, delay){
            if($(items).hasClass('animated'))return
            var d = 0
            $(items).each(function(idx,el){
                d = delay * idx;
                setTimeout(function(){
                    var value = $(el).data('value');
                    //var x = $(el).data('x');
                    //var color = $(el).data('color');
                    
                    $(el)
                        //.css({left:x+"%"})
                        .animate({
                            'width': value+'%',
                            'padding-bottom': value+'%',
                        });
                    $(el).addClass('animated');
                }, d);
            });     
        },
		animeBackground: function($div, c){
			var x = c.x == -0 ? 0 : c.x;
			var dx = parseInt($div.css('background-position-x'));
			
			if(dx - x > 10 || dx - x < -10){
				x = x/4;
				$div.stop().animate(
					{'background-position-x':x+'px'},
					function(){

					}, false, 400
				);
			}else{
				x = x/4;
				$div.css({'background-position-x':x+'px'});
			}
		},
		animeClock: function($div){
			var heure = $div.data('heure');
			var d = new Date();
			d.setHours(parseInt(heure));
			var minutes = 0;
			var hours = d.getHours();

			var hands = [
			    {
			      hand: 'hours',
			      angle: (hours * 30) + (minutes / 2)
			    },
			    {
			      hand: 'minutes',
			      angle: (heure * 360)
			    }
			];

			$('#heures').animateRotate(0, hands[0].angle, 1000, 'easeInOutElastic');
			$('#minutes').animateRotate(0, hands[1].angle, 1000, 'easeInOutElastic');
		}
  	}
  	
});