$(function(){

  window.Hotel = Backbone.Model.extend({

    // set first img as main_image
    initialize: function() {
      var main_image = this.get('images');
      if (main_image != null) {
        this.set('main_image', main_image[0])
      };

      if (0 == this.id.lastIndexOf('da_')) {
        this.set('mapping_class', 'has-mapping')
      } else {
        this.set('mapping_class', 'no-mapping')
      }
    },

    // url for fetch hotel from hotel_details
    set_url: function(key,  hotel_id) {
      this.url = '/api/hotel_details/' + key + '/' + hotel_id + '/';
    },

    make_order: function (data, url) {
      var url = url || '/api/ean_make_reservation/';
      //var url = '/api/ean_make_reservation/';
      return $.ajax({
        type: 'POST',
        url: url,
        dataType: 'JSON',
        data: JSON.stringify(data),
      });
    },

    parse: function(response) {
      if (_.isUndefined(this.card_json)) {
        this.card_json = JSON.stringify(response, null, 2);
      } else {
        this.set('detail_json', JSON.stringify(response, null, 4));
      }
      return response;
    },

    idAttribute: 'hotel_id'
  });


  window.Hotels = Backbone.Collection.extend({
    model: Hotel,

    _fetch_additoinal: function (url) {
      return $.ajax({
        type: 'GET',
        url: url,
        dataType: 'JSON'
      })
      .fail(function (resp, status) {
        console.log(resp, status);
        $('#alert').show().html(ich.alertBlock({class:'error', message:resp.responseText}));
      });
    },

    // url for fetch hotel collection from dest_hotels
    set_url: function(dest_id, checkin, checkout, rooms) {
      var params = [dest_id, checkin, checkout],
        duration = (new Date(checkout) - new Date(checkin))/1000/3600/24; //days
      this.url = '/api/dest_hotels/' + params.join('/') + '/' + rooms + '/';
      this.dest_id = dest_id;
      this.checkin = checkin;
      this.checkout = checkout;
      this.duration = duration;
    },

    fetch_mrates: function () {
      var url = '/api/dest_mrates/' + this.dest_id + '/';

      this._fetch_additoinal(url)
      .done(function (resp, status) {
        $('#alert').hide();
        App.hotels.mrates = resp.result;
      });
    },

    fetch_neighborhoods: function () {
      var url = '/api/dest_neighborhoods/' + this.dest_id + '/';
      this._fetch_additoinal(url)
        .done(function (resp, status) {
          $('#alert').hide();
          App.hotels.neighborhoods = resp.result;
        });
    },

    fetch_dest_info: function () {
      var url = '/api/dest_info/' + this.dest_id + '/';
      this._fetch_additoinal(url)
        .done(function (resp, status) {
          $('#alert').hide();
          App.hotels.dest_info = resp;
        });
    },

    parse: function(response) {
      this.key = response.key;
      this.raw_json = JSON.stringify(response, null, 4);
      return response.hotels;
    }
  });

});
