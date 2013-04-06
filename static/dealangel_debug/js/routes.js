$(function(){
  var Workspace = Backbone.Router.extend({

    routes: {
      ":dest_id/:checkin/:checkout": "hotel_list",   // #Los_Angeles/2012-10-15/2012-10-20 if pushState: false. Else /Los_Angeles/2012-10-10/2012-10-20
      ":dest_id/:checkin/:checkout/:hotel_id": "hotel_detail",
    },

    hotel_list: function(dest_id, checkin, checkout) {
      $('#dest_id').val(dest_id);
      $('#checkin_date').val(checkin);
      $('#checkout_date').val(checkout);
      App.getHotels();

    },

    hotel_detail: function (dest_id, checkin, checkout, hotel_id) {
      $('#dest_id').val(dest_id);
      $('#checkin_date').val(checkin);
      $('#checkout_date').val(checkout);
      App.getHotels()
        .done(function() {
          var hotel = App.hotels.get(hotel_id);
          if (hotel == undefined) {
            return;
          }
          App.tabbar.activateTab(hotel);
        });
    }

  });

  window.router = new Workspace;
  Backbone.history.start({pushState: true, root: '/api_debug/'});

});
