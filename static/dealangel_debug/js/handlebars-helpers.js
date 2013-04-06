/* Handlebars Helpers - Dan Harper (http://github.com/danharper) */

/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

/**
 * If Equals
 * if_eq this compare=that
 */
Handlebars.registerHelper('if_eq', function(context, options) {
	if (context == options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Equals
 * unless_eq this compare=that
 */
Handlebars.registerHelper('unless_eq', function(context, options) {
	if (context == options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});


/**
 * If Greater Than
 * if_gt this compare=that
 */
Handlebars.registerHelper('if_gt', function(context, options) {
	if (context > options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Greater Than
 * unless_gt this compare=that
 */
Handlebars.registerHelper('unless_gt', function(context, options) {
	if (context > options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});


/**
 * If Less Than
 * if_lt this compare=that
 */
Handlebars.registerHelper('if_lt', function(context, options) {
	if (context < options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Less Than
 * unless_lt this compare=that
 */
Handlebars.registerHelper('unless_lt', function(context, options) {
	if (context < options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});


/**
 * If Greater Than or Equal To
 * if_gteq this compare=that
 */
Handlebars.registerHelper('if_gteq', function(context, options) {
	if (context >= options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Greater Than or Equal To
 * unless_gteq this compare=that
 */
Handlebars.registerHelper('unless_gteq', function(context, options) {
	if (context >= options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});


/**
 * If Less Than or Equal To
 * if_lteq this compare=that
 */
Handlebars.registerHelper('if_lteq', function(context, options) {
	if (context <= options.hash.compare)
		return options.fn(this);
	return options.inverse(this);
});

/**
 * Unless Less Than or Equal To
 * unless_lteq this compare=that
 */
Handlebars.registerHelper('unless_lteq', function(context, options) {
	if (context <= options.hash.compare)
		return options.inverse(this);
	return options.fn(this);
});

/**
 * Convert new line (\n\r) to <br>
 * from http://phpjs.org/functions/nl2br:480
 */
Handlebars.registerHelper('nl2br', function(text) {
	var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
	return new Handlebars.SafeString(nl2br);
});


Handlebars.registerHelper('eachkeys', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var ret = "";

    var empty = true;
    for (key in context) { empty = false; break; }

    if (!empty) {
        for (key in context) {
              ret = ret + fn({ 'key': key, 'value': context[key]});
          }
      } else {
          ret = inverse(this);
        }
    return ret;
});


Handlebars.registerHelper("hcPrice", function(context, price, tax, options) {
    return new Handlebars.SafeString((context[price] + context[tax]).toFixed(2));
});


Handlebars.registerHelper("eanPrice", function(context, key, code, options) {
    return new Handlebars.SafeString('<span>' + context[key] + '&nbsp;' + context[code] + '</span>');
});


Handlebars.registerHelper("turPrice", function(context, price, tax, options) {
    return new Handlebars.SafeString((context[price] - context[tax]).toFixed(2));
});


Handlebars.registerHelper("minRate", function(context, duration, key, options) {
    return new Handlebars.SafeString(context[key] * duration);
});


Handlebars.registerHelper("totalPrice", function(context, price, tax, options) {
    return new Handlebars.SafeString((context[price] + context[tax]).toFixed(2));
});

Handlebars.registerHelper("ean", function(context, key, options) {
    return new Handlebars.SafeString(context.value.HotelRoomAvailabilityResponse[key]);
});
