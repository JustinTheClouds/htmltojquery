(function( $ ) {
    
    var settings = {
        logErrors: true
    };
    
    var _elements = [];
	var _pluginTypes = [];
    
    var methods = {
        init : function() { 
    		
			// Find all html to jquery plugin elements contained within this
			$(this).find('[data-plugins]').andSelf().filter('[data-plugins]').each(function() {
        		
        		var element = {};
        		element.target = $(this);
        		element.plugins = {};
        		
        		// Split the plugins into an array
        		var plugins = $(this).data('plugins').split(" ");

        		for(var e in plugins) {
        			
        			element.plugins[plugins[e]] = {};
        			
        			// Capitalize first car of plugin name
        			var caps = plugins[e].charAt(0).toUpperCase() + plugins[e].slice(1);
        			
        			// Grab any ajax options
        			element.ajaxOpts = methods._dataToObject('ajax', element);
        			
        			// Check for default settings for this plugin type
					if(typeof _pluginTypes[plugins[e]] != 'undefined' && _pluginTypes[plugins[e]] !== false) {
						// Grab default from the cache
						$.extend(true, element.plugins[plugins[e]], _pluginTypes[plugins[e]]);
					} else {
						// Try to grab the defaults
						_pluginTypes[plugins[e]] = methods._callHelper('setDefaults' + caps + 'Plugin', element.plugins[plugins[e]], element);
						// Run the default function
						$.extend(true, element.plugins[plugins[e]], _pluginTypes[plugins[e]]);
					}
					
					// Grab the settings for each plugin found
        			$.extend(true, element.plugins[plugins[e]], methods._dataToObject(plugins[e], element));
					
					// Call pre init function if it exists
					$.extend(true, element.plugins[plugins[e]], methods._callHelper('preInit' + caps + 'Plugin', element.plugins[plugins[e]], element));
					
					// Initialize the plugins with their settings
					methods._initPlugin(plugins[e], element);
					
        		}
        		
        		// Add the element into the _elements var
        		_elements.push(element);
				        		
        	});
        	
        },
        get : function(type) {
        	//return $(this).find('*').andSelf().filter('h2').filter('[data-plugins][data-plugins*="'+ type +'"]');
        },
        addPlugin : function(plugins, opts) {
        	//console.log($(this));
        	//$(this).data('data-plugins', plugins).data(opts).htmlToJquery();
        },
        _initPlugin : function(plugin, element) {

			if(typeof $.fn[plugin] === 'function') {
				element.target[plugin]( element.plugins[plugin] );
        	}
        
        },
        _callHelper : function(functionName, settings, element) {

			if (typeof functionName === 'string'){
		    	if(typeof window[functionName] === 'function') {
		    		return window[functionName](settings, element);
		    	} else if(typeof $.fn[functionName] === 'function') {
		    		return $.fn[functionName](settings, element);
				}
		    }
        	return false;
        },
        _dataToObject : function(plugin, element) {

			// Get the attrs for this element
			var attributes = {}; 
			var opts = {};
			$.each(element.target[0].attributes, function(index, attr) {
				// Make sure we only grab this plugins data
				if(attr.name.indexOf(plugin) != -1) {
					
					// get the propert name
					var propName = attr.name.replace('data-' + plugin + '-', '');
					
					// Are the settings being sent in as an object
					if(propName == 'options') {
					
						opts =  $.parseJSON(attr.value);
						
					} else {
					
						// Is camel case needed?
						if(propName.indexOf('_') != -1) {
							var parts = propName.split('_');
							propName = parts[0] + parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
						}
						
						// Check if this value is a function
				    	if(typeof window[attr.value] === 'function') {
				    		attributes[propName] = function() {
								Array.prototype.push.call( arguments, element );
								window[attr.value].apply(this, arguments);
							}
				    	} else if(typeof $.fn[attr.value] === 'function') {
				    		attributes[propName] = function() { 
								Array.prototype.push.call( arguments, element );
								$.fn[attr.value].apply(this, arguments) ;
							};
				    	} else {
				        	attributes[propName] = attr.value == "false" ? false : attr.value;
				    	}
				    	
					}
				}
	        }); 
			attributes = methods._deepen(attributes);
			$.extend(true, opts, attributes);
			//console.log(opts);
			return opts;

        },
        // http://stackoverflow.com/questions/7793811/convert-javascript-dot-notation-object-to-nested-object
        // Thanks to broofa
        _deepen : function (o) {
			var oo = {}, t, parts, part;
			for (var k in o) {
		    	t = oo;
		    	parts = k.split('-');
		    	var key = parts.pop();
		    	while (parts.length) {
		    		part = parts.shift();
		    		t = t[part] = t[part] || {};
		    	}
		  		t[key] = o[k]
			}
			return oo;
		},
        _sendError : function(msg, e) {
            if(typeof console.log == 'function' && settings.logErrors) {
                console.log(msg, e.message);   
            }
        }
    };

    $.fn.htmlToJquery = function() {
        
        if(typeof arguments[0] == 'string') {
            var method = arguments[0];
        } else if(typeof arguments[0] == 'object') {
            var options = arguments[0];
        } else if(typeof arguments[1] == 'object') {
            var options = arguments[1];
        }

        // Create some defaults, extending them with any options that were provided
        $.extend(true, settings, options);
        
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.social' );
        }    

    };
    
})( jQuery );
