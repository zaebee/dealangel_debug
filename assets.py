from django_assets import Bundle, register

#Javascript
register('all_js',
        Bundle(
            'dealangel_debug/js/libs/ICanHaz.min.js',
            'dealangel_debug/js/libs/handlebars-1.0.rc.1.js',
            'dealangel_debug/js/libs/bootstrap.min.js',
            'dealangel_debug/js/libs/datepicker.js',
            'dealangel_debug/js/libs/jquery.maskedinput-1.2.2.min.js',
            'dealangel_debug/js/libs/localstore.min.js',
            'dealangel_debug/js/libs/jquery-ajax-validation.js',
            'dealangel_debug/js/libs/redactor.js',
            'dealangel_debug/js/libs/jquery.lazyload.js',
            'dealangel_debug/js/libs/backbone-min.js',
            'dealangel_debug/js/libs/jquery.fancybox.pack.js',
            'dealangel_debug/js/handlebars-helpers.js',
            'dealangel_debug/js/reset.js',
            'dealangel_debug/js/models.js',
            'dealangel_debug/js/views.js',
            'dealangel_debug/js/routes.js',
              ),
        filters='jsmin',
        output='cache/packed.js')


#CSS
register('all_css',
        Bundle('dealangel_debug/css/bootstrap.css',
               'dealangel_debug/css/style.css',
               'dealangel_debug/css/redactor.css',
               'dealangel_debug/css/datepicker.css',
               'dealangel_debug/css/jquery.fancybox.css',
               'dealangel_debug/css/app.css',
              ),
        filters='cssmin',
        output='cache/packed.css')
