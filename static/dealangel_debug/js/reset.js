  (function( undefined ) {
    var Backbone = this.Backbone;

    /**
     * Override Backbone's sync function, to do show message if a GET returned ERROR.
     */
    Backbone.oldSync = Backbone.sync;
    Backbone.sync = function( method, model, options ) {
      if ( method === 'read' ) {
        var dfd = new $.Deferred();

        // Set up 'success' handling
        dfd.done( options.success );
        options.success = function( resp, status, xhr ) {
          return dfd.resolveWith( options.context || options, [ resp, status, xhr ] );
        };

        // Set up 'error' handling
        options.error = function( resp, status, xhr ) {
          $('#alert').show().html(ich.alertBlock({class:'error', message:resp.responseText}));
        };
        dfd.fail( options.error );
        options.error = dfd.reject;

        // Make the request, make it accessibly by assigning it to the 'request' property on the deferred
        dfd.request = Backbone.oldSync( method, model, options );
        return dfd;
      }

      return Backbone.oldSync( method, model, options );
    }
  })();


function loadImages(images) {
  images.each(function(i) {
    if (document.body.scrollTop + 1000 > $(this).offset().top) {
      $(this).attr('src', $(this).data('original')).removeClass('lazy');
    }
  });
}

$("#loading").ajaxStop(function(){
  $(this).css('visibility', 'hidden');
});

$("#loading").ajaxStart(function(){
  $(this).css('visibility', 'visible');
});


$(document).ready(function () {

  $("a.fancybox").fancybox();

  $('.date').mask('9999-99-99');
  $('#card_number').mask('9999-9999-9999-9999');

  var startDate = new Date(2070,1,1);
  var endDate = new Date(2015,1,25);

  $('#show_cal_from').datepicker({
    format: 'yyyy-mm-dd',
    weekStart: 1,
  })
    .on('changeDate', function(ev){
      if (ev.date.valueOf() > endDate.valueOf()){
        $('#alert').show().html(ich.alertBlock({class:'error', message:'Начальная дата не может быть больше конечной.'}));
      } else {
        $('#alert').hide();
        startDate = new Date(ev.date);
        $('#checkin_date').val($('#show_cal_from').data('date'));
      }
      $('#show_cal_from').datepicker('hide');
    });

  $('#show_cal_to').datepicker({
    format: 'yyyy-mm-dd',
    weekStart: 1,
  })
  .on('changeDate', function(ev){
    if (ev.date.valueOf() < startDate.valueOf()){
      $('#alert').show().html(ich.alertBlock({class:'error', message:'Конечная дата не может быть меньше начальной.'}));
    } else {
      $('#alert').hide();
      endDate = new Date(ev.date);
      $('#checkout_date').val($('#show_cal_to').data('date'));
    }
    $('#show_cal_to').datepicker('hide');
  });

  //clear button click handler
  $('#clear_button').click(function(event) {
    event.preventDefault();
    var btn = $(this);
    btn.button('loading');

    setTimeout(function() {
      btn.button('reset');
    }, 3000);
  });

  $('#dest_id').typeahead({
    source: function(query, process) {
      return $.get('/api/dest_search/', { q: query }, function (data) {
        var data_list = data.result.map(get_file_name);
        process(data_list);
      });
    }
  });

  function get_file_name(item) {
    return item.name;
  };


});
