/*
 * under the License.
 */
var app = {
    // Application Constructor
    lat1: 42.80971575714766,
    lon1: -1.5883148056029772,
    distanciaMinima: 11,
    watchID: false,
    total: 0,
    contador: 0,
    texto: false,

    initialize: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        app.guardarDatos('distanciaTotal', '0');
        app.dondeEstoy();

        $('.lat').click(function(){
          if($(this).is(":checked")) {
            var posicion = app.pedirDato('posicion'); 
            app.distanciaMinima = 11;
            app.enArea(posicion, app.distanciaMinima);
          }
        });

        $('.error').click(function(){
          if($(this).is(":checked")) {
            var posicion = app.pedirDato('posicion'); 
            app.distanciaMinima = 0.3;
          }
        });

        $('#track').click(function(){
          app.peticionesLocalizacion();
        });
    },

    dondeEstoy: function(punto){
      var options = {enableHighAccuracy: true };
      navigator.geolocation.getCurrentPosition(onSuccess, app.onError, options);
      function onSuccess(position) {
        app.guardarDatos('posicion', position);
        app.enArea(position, app.distanciaMinima);
      };
    },

    peticionesLocalizacion: function() {
      var geolocationID;
      getLocation();

      function getLocation(){
        var count = 0;
          geolocationID = window.setInterval(function() {
          navigator.geolocation.getCurrentPosition(onSuccess, app.onError, { enableHighAccuracy: true, timeout: 10000 });
        },15000); //end setInterval;
      }

      function onSuccess(position) {
        app.mostrarInfo('.km', position);
        var posicionAnterior = app.pedirDato('posicion');
        var kmDistancia = app.distancia(posicionAnterior.coords.latitude, posicionAnterior.coords.longitude, position.coords.latitude, position.coords.longitude);
        if(kmDistancia > 0.200){
          app.total = app.total + 0.020;
        }else{
          app.total = app.total + kmDistancia;
          app.guardarDatos('posicion', position);
        }
        app.guardarDatos('total', app.total);
        $('.total h3').remove();
        $('.total').append('<h3>totaol: '+ app.total+ '</h3>');        
        app.enArea(position,  app.distanciaMinima, app.watchID);
        var datosMandar = {
          'lat': position.coords.latitude, 
          'lon': position.coords.longitude,
          'distancia': app.total
        };
        app.enviarServidor(position, app.total);
        //app.enviarServidor(app.total);
      };

      function onError(error) {
          alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
      };
    },

    enArea: function(position, punto, watchID){
      (punto) ? punto = punto : punto = app.distanciaMinima;
      (watchID) ? watchID = watchID : watchID = app.watchID;
      var km = app.distancia(app.lat1, app.lon1, position.coords.latitude, position.coords.longitude);

      $('.distancia h3').remove();
      $('.distancia').append('<h3>'+ (km).toFixed(3) + ' Km desde el punto de control</h3>');

      if(punto>km){
        $('.topcoat-button').removeClass('is-disabled');
        $('.error').hide();
        return true;
      }else{
        $('.error').show();
        $('.topcoat-button').addClass('is-disabled');
        if(watchID){
          navigator.geolocation.clearWatch(watchID);
        }
        app.mostrarError('.error', 'No estas en el area');
        return false;
      }
    },

    onError: function(error){
      alert(error);
    },

    guardarDatos: function(clave, datos) {
      window.localStorage.setItem(clave, JSON.stringify(datos));
    },

    pedirDato: function(clave) {
      var resultado = window.localStorage.getItem(clave);
      return JSON.parse(resultado);
    },

    mostrarInfo: function(id, datos) {
      $(id).append('Latitude: ' + datos.coords.latitude + '<br /> Longitude: '+datos.coords.longitude +'<br /><hr />');
    },

    mostrarError: function(id, text){
      $(id).append(text);
    },

    distancia: function(lat1, lon1, lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km

      function deg2rad(deg) {
        return deg * (Math.PI/180)
      }
      return d;
    }, 

    enviarServidor: function(position, total){
      //data: "lat="+position.coords.latitude+"&lon="+position.coords.latitude+"&total="+total,  
      //data: "somedata= lat: "+position.coords.latitude+" log: "+position.coords.longitude,                      
      var nombre = $('#nombre').val();
      $.ajax({
          dataType: 'jsonp',
          data: "lat="+position.coords.latitude+"&lon="+position.coords.longitude+"&total="+total+"&nombre="+nombre,
          jsonp: 'callback',
          url: 'http://46.105.116.39:7000/logget?callback=?',                     
          success: function(data) {
            console.log(data.more);
          }
      });
    }, 

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
