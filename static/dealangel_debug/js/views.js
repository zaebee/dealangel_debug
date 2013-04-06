$(function(){

  window.BookingView = Backbone.View.extend({
    className: 'tab-pane',
    tagName: 'div',

    events: {
      'click #confirm_order': 'confirmOrder',
      'click .show_booking_data_request': 'showDataRequest',
      'click .show_booking_data_response': 'showDataResponse',
      'click .hide_booking_data': 'hideData',
      'mouseleave [id^=json-request]': 'hideData',
      'renderRoomChilds input[id$=num_children]': 'renderRoomChilds',
    },

    initialize: function () {
      _.bindAll(this, 'render', 'confirmOrder', 'showDataRequest', 'hideData', 'showDataResponse');
      this.template = Handlebars.compile($('#orderFormTemplate').html());
      this.room_template = Handlebars.compile($('#roomTemplate').html());
      this.store = new localStore;
      this.store.del('booking_request');
      this.store.del('booking_response');
    },

    render: function () {
      $(this.el).attr('id', 'hoteldetail-booking-' + this.model.id);
      this.model.set('checkin', this.model.collection.checkin);
      this.model.set('checkout', this.model.collection.checkout);

      $(this.el).html(this.template({
          hotel: this.model.toJSON(),
          room: this.room,
          room_ids: this.room_ids,
        })
      );
      return this;
    },

    confirmOrder: function (event) {
      if (event) {
        event.preventDefault();
      };
      var els = $('#booking-form').serializeArray(),
          data = {};

        data.rooms = [];
      _.each(els, function(el, idx){data[el.name] = el.value});

      _.each($("[class^='well room_']"), function(room) {
        var data_room = {};
        data_room['child_ages'] = [];
        _.each($(room).find('input').serializeArray(),
          function(input) {
            //get array of child ages. [2, 3, 5]
            if (input.name.search('child_ages') != -1) {
              data_room.child_ages.push(parseInt(input.value, 10) || 0);
            }

            if (input.value == "0") {
              data_room[input.name.substr(7)] = 0;
            } else {
              data_room[input.name.substr(7)] = parseInt(input.value, 10) || input.value;
            }
          });
        data.rooms.push(data_room);
      });

      data.credit_card_number = data.credit_card_number.split('-').join('');

      var request_json = JSON.stringify(data, null, 4);
      this.store.set('booking_request', request_json);

      function result(resp, status) {
        var response_json = JSON.stringify(resp, null, 4),
            store = new localStore;
        store.set('booking_response', response_json);
        if (resp.Error) {
          console.log(resp, status);
          $('#alert').show().html(ich.alertBlock({class:'error', message:resp.Error.handling + ' ' + resp.Error.category + ' ' + resp.Error.presentationMessage}));
        } else {
          $('#alert').show().html(ich.alertBlock({class:'success', message:'Success!'}));
        }
      };

      this.model.make_order(data)
        .done(result)
        .fail(function (resp, status) {
          console.log(resp, status);
          $('#alert').show().html(ich.alertBlock({class:'error', message:resp.responseText}));
        });
    },

    showDataRequest: function(event) {
      event.preventDefault();
      $("[id^=json-request]").html('<button type="button" class="close hide_booking_data" aria-hidden="true">&times;</button>');
      $("[id^=json-request]").append(this.store.get('booking_request'));
    },

    showDataResponse: function(event) {
      event.preventDefault();
      $("[id^=json-request]").html('<button type="button" class="close hide_booking_data" aria-hidden="true">&times;</button>');
      $("[id^=json-request]").append(this.store.get('booking_response'));
    },

    hideData: function(event) {
      event.preventDefault();
      $("[id^=json-request]").html('<a class="btn show_booking_data_request">show data request</a><a class="btn show_booking_data_response">show data response</a>');
    },

    renderRoomChilds: function (event) {
      var el = event.target,
          val = $(el).val(),
          idx = _.range(1, parseInt(val, 10) + 1),
          html = '<span class="help-inline">Child ages</span><br>',
          child_ages = $(event.target).closest('div').parent().next(),
          room_id = $(el).attr('id').substr(0,6);
      _.each(idx, function(el) {
        html += '<input type="text" size=2 class="input span1" id="' + room_id + '_child_ages_' + el + '" name="' + room_id + '_child_ages_' + el + '" value=2>' 
      });
      $(child_ages).html(html);
    }

  });


  window.TabBarView = Backbone.View.extend({
    el: $('#tabbar'),

    events: {
      'click .close_tab': 'closeTab',
    },

    initialize: function() {
      _.bindAll(this, 'show', 'addTabHotel', 'closeTab', 'setTitle', 'activateTab');
      this.templates = {
        tabbar: Handlebars.compile($('#tabBarTemplate').html()),
        tab: Handlebars.compile($('#tabHeaderTemplate').html()),
        tab_filter: Handlebars.compile($('#filterPanelTemplate').html()),
      }
    },

    // title for hotel list
    setTitle: function(title) {
      $(this.el).find('a:first').html(title);
    },

    show: function(title) {
      $(this.el).html(this.templates.tabbar({title:title}));
      return this;
    },

    show_filters: function(data) {
      $("#hotels").prepend(this.templates.tab_filter(data));
      //$("#filter-panel").affix({offset:270});
    },

    addTabHotel: function(hotel) {
      this.$el.append(this.templates.tab(hotel.toJSON()));
      $('#tab_content').append(hotel.hotel_detail_view.render().el);
      return this;
    },

    addTabBook: function(book) {
      book.room.totalRate = (book.room.chargeableRate * book.room_ids.length).toFixed(2);
      var data = {
        name: book.model.attributes.name + ' booking ' + book.room.roomDesc + ' $' + book.room.totalRate + '',
        booking: true,
        hotel_id: book.model.id,
      };
      this.$el.append(this.templates.tab(data));
      $('#tab_content').append(book.render().el);
      $("[id^=json-request]").affix({offset:270});
      return this;
    },

    activateTab: function(hotel) {
      hotel.fetch({
        beforeSend: function (xhr, settings) {
          xhr.setRequestHeader('da_settings', App.store.get('settings'));
        }
      });
      param = '[href=#hoteldetail-' + hotel.id + ']';
      this.addTabHotel(hotel).$el.find('a' + param).tab('show');
    },

    closeTab: function(event) {
      event.preventDefault();
      var tab_id = this.$(event.target).parent().attr('href');
      $(tab_id).remove();
      this.$(event.target).parents('li').remove();
      $(this.el).find('a:first').tab('show');
    },
  });


  window.HotelDetailView = Backbone.View.extend({
    className: 'tab-pane span11',
    tagName: "div",

    events: {
      'click .show_hotel_detail_json': 'showHotelDetailJson',
      'click .hide_hotel_detail_json': 'hideHotelDetailJson',
      'click .render_order_form': 'renderOrderForm',
    },

    initialize: function() {
      _.bindAll(this, 'render', 'showHotelDetailJson', 'hideHotelDetailJson', 'renderOrderForm');
      this.template = Handlebars.compile($('#tabContentTemplate').html()),
      this.model.on('change', this.render, this);
      this.model.hotel_detail_view = this;
    },

    render: function() {
      //set id for tab correct showing
      $(this.el).attr('id', 'hoteldetail-' + this.model.id).html(this.template(this.model.toJSON()));

      $(this.el).find('img').on('error', function() {
        $(this).parents('.hotel_img').addClass('noimage');
      });
      return this;
    },

    showHotelDetailJson: function(event) {
      event.preventDefault();
      $("#json-code-" + this.model.id).html('<button type="button" class="close hide_hotel_detail_json" aria-hidden="true">&times;</button>');
      $("#json-code-" + this.model.id).append(this.model.attributes.detail_json);
    },

    hideHotelDetailJson: function(event) {
      event.preventDefault();
      $("#json-code-" + this.model.id).html('<a class="btn show_hotel_detail_json">show json source</a>');
    },

    renderOrderForm: function (event) {
      event.preventDefault();
      var room = $(event.target).data(),
        room_quantity = $('#' + room.roomId).val(),
        order_form = new BookingView({model: this.model}),
        room_ids = _.range(1, parseInt(room_quantity, 10) + 1);
      order_form.room = room;
      order_form.room_ids = room_ids;
      this.model.collection.tabbar.addTabBook(order_form);
    }

  });


  window.HotelCardView = Backbone.View.extend({
    className: 'hotel-card',
    tagname: "li",

    events: {
      'click .show_hotel_detail': 'showHotelDetail',
      'click .show_hotel_json': 'showHotelJson',
    },

    initialize: function() {
      _.bindAll(this, 'render', 'showHotelDetail', 'showHotelJson');
      this.template = Handlebars.compile($('#hotelCardTemplate').html());
      this.model.hotel_card_view = this;
      this.model.set('duration', this.model.collection.duration);
      //this.model.on('change', this.render, this);
    },

    render: function(){
      $(this.el).html(this.template(this.model.toJSON()));

      this.$('a.show_hotel_json').popover({
        content: '<pre>' + this.model.card_json + '</pre>',
      });
      return this;
    },

    showHotelDetail: function(event) {
      if (event) {
        event.preventDefault();
      }
      var hotel_detail = new HotelDetailView({model:this.model});
      this.model.fetch({
        beforeSend: function (xhr, settings) {
          xhr.setRequestHeader('da_settings', App.store.get('settings'));
        },
        success: function(model, resp) {
          model.collection.tabbar.addTabHotel(model);
        },
      })
        .done(function(resp, status) {
          console.log(resp, status);
          $('#alert').hide();
        })
        .fail(function(resp, status) {
          console.log(resp, status);
          $('#alert').show().html(ich.alertBlock({class:'error', message:resp.responseText}));
        });
    },

    showHotelJson: function(event) {
      var btn = this.$('a.show_hotel_json');
      event.preventDefault();
    }

  });


  window.AppView = Backbone.View.extend({
    el: $('body'),

    events: {
      'click #search_button': 'getHotels',
      'click #save-settings': 'setSettings',
      'change #mapping-filter': 'filterHotels',
      'change .source-filter': 'filterHotels',
      'click .num_plus': 'incraseNum',
      'click .num_minus': 'decraseNum',
      'addRooms input#num_rooms': 'addRooms',
      'removeRooms input#num_rooms': 'removeRooms',
      'addChilds input[id^="num_children_"]': 'addChilds',
    },

    initialize: function() {
      _.bindAll(this, 'render', 'addOne', 'getHotels', 'filterHotels', 'setSettings', 'incraseNum', 'decraseNum', 'roomsParams', 'removeRooms');

      //initial local storage or cookie
      this.store = new localStore();
      this.settings = JSON.parse(this.store.get('settings'));
      document.cookie = "settings=" + encodeURI(this.store.get('settings')) + "; path=/";

      //set settings data as textarea value
      $("a#show-settings").popover({
        content: function () {
          var value = JSON.stringify(App.settings);
          return ich.settingsBlock({val:value});
        }
      });

      this.hotels = new Hotels();
      this.hotels.on('reset remove', this.render, this);
      this.hotels.on('add', this.addOne, this);

      this.tabbar = new TabBarView;
      this.bind('tab:setTitle', this.tabbar.setTitle);
      this.hotels.tabbar = this.tabbar;

      $(window).on('scroll', function() {
        loadImages($('img.lazy'));
      });
    },

    render: function() {
      this.$("#hotels").html(''); //clear first tab if new request
      this.hotels.each(this.addOne);
      this.$("#json-code").html(this.hotels.raw_json);

      this.hotels.title = this.hotels.dest_id + ' hotels (' + this.hotels.length + ')'; // set tab header
      this.tabbar.show(this.hotels.title);
      this.tabbar.show_filters({min_rates: ['hc','ean','tur']});
      return this;
    },

    addOne: function(hotel) {
      hotel.set_url(this.hotels.key, hotel.id);
      var hotel_card_view = new HotelCardView({model: hotel}),
        hotel_detail_view = new HotelDetailView({model: hotel});
      this.$("#hotels").append(hotel_card_view.render().el);
    },

    getHotels: function(event) {
      if (event) {
        event.preventDefault();
      };
      var dest_id = this.$('#dest_id').val(),
        checkin_date = this.$('#checkin_date').val(),
        checkout_date = this.$('#checkout_date').val(),
        duration = (new Date(checkout_date) - new Date(checkin_date))/1000/3600/24, //days
        rooms = this.roomsParams();
      this.hotels.set_url(dest_id, checkin_date, checkout_date, rooms);

      return this.hotels.fetch({
        beforeSend: function (xhr, settings) {
          xhr.setRequestHeader('da_settings', App.store.get('settings'));
        }
      })
        .done(function(resp, status) {
          $('#alert').hide();
          $('#main').find('img').on('error', function() {
            $(this).parents('.hotel_img').addClass('noimage');
          });
        })
        .fail(function(resp, status) {
          console.log(resp, status);
          $('#alert').show().html(ich.alertBlock({class:'error', message:resp.responseText}));
        });
    },

    filterHotels: function(event) {
      var mapping_filter = this.$('#mapping-filter'),
        source_filter = this.$('.source-filter:checked'),
        title,
        hotels,
        source_classes = _.reduce(source_filter, function(memo, el) {return memo + '.' + $(el).val()}, '');

      _.defer(function() {
        if (_.isEmpty(mapping_filter.val())) {
          hotels = $('[class$=mapping]');
        } else {
          hotels = $('.' + mapping_filter.val());
        }

        if (!_.isEmpty(source_classes)) {
          hotels = hotels.filter(source_classes);
        }

        $('[class$=mapping]').parent().hide();
        hotels.parent().show();
        title = App.hotels.dest_id + ' hotels (' + hotels.length + ')';
        App.trigger('tab:setTitle', title);
      });
    },

    setSettings: function () {
      var settings_data = $('#json-settings').val();
      try {
        var json_data = JSON.parse(settings_data);
      } catch(e) {
        $('#alert').show().html(ich.alertBlock({class:'error', message:e}));
        return;
      }
      this.settings = json_data;
      this.store.set('settings', settings_data);
      document.cookie = "settings=" + encodeURI(settings_data) + "; path=/";

      $('#alert').hide();
      $('a#show-settings').popover('hide');

    },

    incraseNum: function (event) {
      //increment input val if  click #num_plus
      event.preventDefault();
      var input = this.$(event.target).parent().prev();
      var value = parseInt($(input).val(), 10);
      $(input).val(++value).trigger('addRooms').trigger('addChilds').trigger('renderRoomChilds');
      event.preventDefault();
    },

    decraseNum: function (event) {
      //decrement input val if  click #num_minus
      var input = this.$(event.target).parent().next(),
        value = parseInt($(input).val(), 10);
      if (_.isEqual(value, 0)) {
        return;
      }
      $(input).val(--value).trigger('removeRooms').trigger('addChilds').trigger('renderRoomChilds');
      event.preventDefault();
    },

    roomsParams: function () {
      var rooms = $('[class^="row room_"]');
      var r = _.map(rooms, function(e,i) {return _.reduce($(e).find('input'), function(memo, value, key, list) {return memo + $(value).val() + '-'}, '' )});
      r = _.reduce(r, function(memo, val, key) {
        val = val.slice(0, val.length -1 ).split('-');
        val.splice(1,1);
        val = val.map(function(e) {return e || '0'})
        val = val.join('-');
        return memo + val + ':'
      },
        '');

      return r.slice(0, r.length - 1);
    },

    addRooms: function (event) {
      var target = this.$(event.target),
        template = Handlebars.compile($('#roomTemplate').html()),
        val = $(target).val(),
        html = template({id:val});
      var last_room = $('[class^="row room_"]').last();
      $(last_room).after(html);

    },

    removeRooms: function (event) {
      var target = this.$(event.target),
        val = $(target).val();
      if (val == 0) {
        $(target).val(1);
        return;
      };
      $('[class^="row room_"]').last().remove();
    },

    addChilds: function (event) {
      var target = this.$(event.target),
        template = Handlebars.compile($('#childAgesTemplate').html()),
        val = $(target).val(),
        room_id = $(target).data('room-id');
        ids = _.range(1, parseInt(val,10)+1);
      var ht = template({ids:ids, room_id:room_id});
      $('#child_ages_' + room_id).html(ht);
    }

  });

  window.App = new AppView;
});
