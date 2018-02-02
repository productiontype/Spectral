(function() {
	'use strict';

	var data;

  	var app = angular.module('App', ['ngSanitize']);

 	app.config(['$compileProvider', function ($compileProvider) {
  		$compileProvider.debugInfoEnabled(false);
  		$compileProvider.commentDirectivesEnabled(false);
		$compileProvider.cssClassDirectivesEnabled(false);
	}]);

	app.controller('headController', function(){
		//console.log("headController");
	  	this.title = 'SPECTRAL';
	  	this.description = '';
	  	this.author = 'ahmedghazi.com';
	});

	app.controller('baseControllerr', function($scope, $document, data, $timeout) {
		document.addEventListener('_allFontsLoaded', function(e){
			$('body').removeClass('loading')
		});
	});

	app.controller('baseController', function($scope, $document, data, $timeout) {
		//console.log(data)
		data.getPromise().then(function(data) {
			//console.log(data)
		    $scope.data = data;
		    $scope.infos = data.infos;
		    $scope.navActive = false;
		});

		$scope.$on('navActiveChange', function() {
			$scope.navActive = false;
			$scope.$apply();
		});

		angular.element(function () {

			/*var $body = $("body");
			var $tinted = $(".tinted");
			console.log($tinted)
			var h = 0,
			s = 50,
			l = 50;
			$body.mousemove(function(e) {
			  	h = (e.pageX / 360) * 100;
			  	$body.css('color', 'hsl('+h+', '+s+'%, '+l+'%)');
			  	$(".tinted").css('background-color', 'hsl('+h+', '+s+'%, '+l+'%)');
		
		console.log(h)
			  //window._rgb = HSLToRGB(h,100,50);
			  //window._rgb = $body.css('color');
			  //console.log(h,100,50)
			  //console.log(window._rgb)
			});*/
			/*$(window).scroll(function(){

				clearTimeout($.data(this, '__scrollTimer'));
				$.data(this, '__scrollTimer', setTimeout(function() {
				    //pubsub.emit('animationIn')
				    if($(window).scrollTop() == 0){
				    	console.log('emit')
				    	$('header').removeClass("affix")
				    	pubsub.emit('animationIn')
				    }else{
				    	$('header').addClass("affix")
				    	pubsub.emit('animationOut')
				    }
				}, 500));
				
			});*/

			
			
			$(document.body).on('click', '#menu a', function(e) {
				e.preventDefault();
				var href = $(this).attr('href');
				var ptop = $('#wrapper').scrollTop() + ($(href).offset().top - $('#wrapper').offset().top) + 1;
				
				$('section').removeClass('active');
				$(href).addClass('active');
				$('.burger').click();
				
				$('html,body').animate({ 
				    scrollTop: ptop,
				}, 400, 'easeInOutQuad', function(){
				    
				});
			});

			

			
		
		});

		
	});



	// CONTROLLERS ============================================
	app.controller('homeController', function ($scope, $location, data, LS) {
		
	    $scope.pageClass = 'home';
	    data.getPromise().then(function(data) {
	    	console.log(data)
	        $scope.essay = data.essay;
	    });

	    //var data = JSON.parse(LS.getData('data'));
	    //$scope.chd = data.chd;
	    $scope.go = function ( path ) {
	    	$location.path( path );
	    };
	});

	// CONTROLLERS ============================================
	app.controller('animationController', function ($scope, $location, data, LS) {
		
	    $scope.pageClass = 'animation';
	    angular.element(function () {
	    	var word = 'SPECTRAL';
	    	//var fontSize = (window.innerHeight*2.4)+'px';
	    	//var fontSize = window.innerHeight+'px';

	    	document.addEventListener('_allFontsLoaded', function(e){
	    		//var fontSize = '1300';
	    		var fontSize;
	    		//if($("html").hasClass("touch"))
	    		fontSize = $('html').hasClass('touch') ? '600' : '800';
	    		var count = 0;

	    		var _particleAlphabetXb = new particleAlphabet();
	    		_particleAlphabetXb.init('.xb',word, 'italic 800 '+fontSize+'pt Spectral', '#6e308f', fontSize, on_ready);
	    		
	    		var _particleAlphabetB = new particleAlphabet();
	    		_particleAlphabetB.init('.b',word, 'italic 700 '+fontSize+'pt Spectral', '#005ca8', fontSize, on_ready);
	    		
	    		// var _particleAlphabetM = new particleAlphabet();
	    		// _particleAlphabetM.init('.m',word, 'italic 600 '+fontSize+'pt Spectral', '#1fb16d', fontSize, on_ready);
	    		
	    		var _particleAlphabetR = new particleAlphabet();
	    		_particleAlphabetR.init('.r',word, 'Italic 500 '+fontSize+'pt Spectral', '#ffdc2d', fontSize, on_ready);
	    		
	    		var _particleAlphabetXL = new particleAlphabet();
	    		_particleAlphabetXL.init('.xl',word, 'Italic 100 '+fontSize+'pt Spectral', '#eb212e', fontSize, on_ready);
	    			
	    		
	    		function on_ready(){
	    			//console.log(count)
	    			if(count == 3){
	    				_particleAlphabetXb.launch()
	    				_particleAlphabetB.launch()
	    				//_particleAlphabetM.launch()
	    				_particleAlphabetR.launch()
	    				_particleAlphabetXL.launch()

	    				count = 0;
	    				$('body').removeClass('loading')
	    			}
	    			count++;
	    		}
	    	}, false);
	    	


	    });

	    $scope.forward = function(){
	    	pubsub.emit('animationForward')
	    }

	});

	// CONTROLLERS ============================================
	app.controller('essayController', function ($scope, $location, data, LS) {
		
	    $scope.pageClass = 'essay';
	    data.getPromise().then(function(data) {
	    	//console.log(data.essay.texte)
	        $scope.essay = data.essay;

    		/*var $shz = angular.element('.scroll-hz');
    		angular.element("html").on('mousewheel DOMMouseScroll', $shz, function(event, delta) {
    			console.log(event)
    		    //this.scrollLeft -= (delta * 1);
          		//event.preventDefault();
    		});
			*/
	    });

	});

	// CONTROLLERS ============================================
	app.controller('familyStylesController', function ($scope, $location, data, LS) {
		
	    $scope.pageClass = 'family-styles';
	    data.getPromise().then(function(data) {
	    	//console.log(data)
	        $scope.family = data.family;
	    });

	    //var data = JSON.parse(LS.getData('data'));
	    //$scope.chd = data.chd;
	    $scope.go = function ( path ) {
	    	$location.path( path );
	    };
	});

	// CONTROLLERS ============================================
	app.controller('dummyController', function ($scope, $location, data, LS) {
		
	    $scope.pageClass = 'dummy';
	    data.getPromise().then(function(data) {
	        $scope.dummy = data.dummy.texte;	        
	        $scope.dummy_short = data.dummy.texte_short;	        
	        $scope.familyShuffled = data.familyShuffled;

	        
	    });
	});

	app.directive('dummyText', function ($timeout) {
	    return {
	        restrict: 'EA',
	        templateUrl: 'views/dummy-text.html',
	        replace: true,
	    	transclude: true,
	        scope: {
	        	item:'=',
	        	dummy:'='
	        },
	        controller: function ($scope, $element) {

	        },
	        link: function ($scope, element, attrs) {
	        	var arr = [14, 18, 22, 26];
	        	var rand = Math.floor(Math.random()*arr.length);
	        	
	        	var d = $scope.dummy.split( /[\.!\?]+/ );
	        	var paragraph = '';
	        	for(var i=0; i<4; i++){
	        		var _rand = Math.floor(Math.random()*d.length);
	        		var sentence = d[_rand];
	        		d.splice(_rand, 1);
	        		paragraph += sentence;
	        	}

	        	$scope.p = paragraph

		        $scope.getRandomFontSize = function(){
	  				return arr[rand];
				}

	        }
	    }
	});

	// CONTROLLERS ============================================
	app.controller('dataController', function ($scope, data, LS) {
	    $scope.pageClass = 'data';

	    //git_authors_list
	    angular.element(function () {
	    	
	    });
	});

	// CONTROLLERS ============================================
	app.controller('characterSetController', function ($scope, data, LS) {
	    $scope.pageClass = 'character-set';
	});
	

	// CONTROLLERS ============================================
	app.controller('glyphsController', function ($scope, data, LS) {
	    $scope.pageClass = 'glyphs';

	    angular.element(function () {
	    	var arr = []
	    	/*$(".glyph").each(function(idx, el){
	    		arr.push(el.title)
	    	});*/
	    	
	    });
	});

	// CONTROLLERS ============================================
	app.controller('languagesController', function ($scope, data, LS) {
	    $scope.pageClass = 'languages';
	});

	// CONTROLLERS ============================================
	app.controller('glyphDetailsController', function ($scope, data, LS) {
	    $scope.pageClass = 'glyph-details';
	    angular.element(function () {
	    	//console.log('here')
	    	
			//var mousePosition;
			var offset = [0,0];
			var mouse = {
			    x: 0,
			    y: 0,
			    down: false
			}

			var div;
			//var isDown = false;

			$('html').on('mousedown', '.abs', mouseDown)
			//$(window).on('touchstart', '.abs', mouseDown)
			if('ontouchstart' in window){
				var abss = document.querySelectorAll('div.abs')
				for (var i = 0; i < abss.length; i++) {
					//console.log(abss[i])
					abss[i].addEventListener('touchstart', mouseDown, false)
					abss[i].addEventListener('touchend', mouseUp, false)

					var randX = Math.round( Math.random() * $(window).width() );
					var randY = Math.round( Math.random() * $(window).height() );

					abss[i].style.left = randX;
					abss[i].style.top = randY;
				}
			}
			//.addEventListener('touchmove', divMove, false)

			$('html').on('mouseup', mouseUp)
			//$(window).on('touchend', mouseUp)

    		function mouseUp(){
    			mouse.down = false;
    			
    			$('.abs').off('mousedown', mouseDown)
    			//$('.abs').off('touchstart', mouseDown)
			}

    		function mouseDown(e){
    			var div = e.target;
    			mouse.down = true;

    			if(e.touches){
    			    mouse.x = e.touches[0].pageX;
    			    mouse.y = e.touches[0].pageY;
    			}else{
    			    mouse.x = e.pageX;
            		mouse.y = e.pageY;
    			}

			    offset = [
			        div.offsetLeft - mouse.x,
			        div.offsetTop - mouse.y
			    ];
			    
    			$(div).on('mousemove', divMove)
    			div.addEventListener('touchmove', divMove, false)
    		}

    		function divMove(e){
    			e.preventDefault();
    			
    			var div = e.target;

				if(e.touches){
				    mouse.x = e.touches[0].pageX;
				    mouse.y = e.touches[0].pageY;
				}else{
				    mouse.x = e.pageX;
	        		mouse.y = e.pageY;
				}
    			
    			if (mouse.down) {
			        div.style.left = (mouse.x + offset[0]) + 'px';
			        div.style.top  = (mouse.y + offset[1]) + 'px';
			    }
    		}
	    	
	    });
	});
	

	// CONTROLLERS ============================================
	app.controller('waterfallController', function ($scope, data, LS) {
	    $scope.pageClass = 'waterfall';
	    $scope.italic = false;
	    $scope.fontWeight = 400;

	    $scope.updateFont = function ( weight, italic ) {
	    	//console.log(weight,italic)
	    	$scope.italic = italic;
	    	$scope.fontWeight = weight;

	    	document.dispatchEvent(new CustomEvent('_switchWeight', {
	    		'detail': {
	    			'italic': italic,
	    			'weight': weight
	    		}
	    	}));
	    };

	    angular.element(function () {
	    	$('html').on('mouseenter', '.waterfall-menu li', function(){
	    		
	    		
	    		
	    		$(this).children('div').click();
	    	})
	    });
	});

	// CONTROLLERS ============================================
	app.controller('imagesController', function ($scope, $location, data, LS) {
	    $scope.pageClass = 'images';
	    data.getPromise().then(function(data) {
	        $scope.images = data.images;	

	        angular.element(function () {
	        	var carousel = $('.carousel').lightSlider({
	        	    //adaptiveHeight:true,
	        	    controls: false,
	        	    pager: false,
	        	    item: 1,
	        	    slideMargin: 0,
	        	    loop: true,
	        	    auto: false,
	        	    pauseOnHover: true,
	        	    easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
	        	    speed: 400,
	        	    pause: 4000,
	        	    onAfterSlide: function (el) {
	        	        //pubsub.emit("onAfterSlide", null);
	        	    }
	        	});
	        });        	        
	    });
	});

	// CONTROLLERS ============================================
	app.controller('creditsController', function ($scope, data, LS) {
	    $scope.pageClass = 'credits';
	    data.getPromise().then(function(data) {
	    	$scope.credits = data.credits;
	    	
	    });
	});

})();