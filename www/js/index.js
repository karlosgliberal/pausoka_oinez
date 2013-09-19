/*
 * under the License.
 */
var app = {
    // Application Constructor
    lat1: 42.80971575714766,
    lon1: -1.5883148056029772,
    distanciaMinima: 11,
    watchID: null,
    estoyID: null,
    countWatch: null,
    total: 0,
    geolocationID: 0,
    count: 0,
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
          $('.boton').removeClass('blink');
          $('.contador span.numero').remove();
          $('.contador span.km').remove();
          $('.contador').append('<span class="gps blink">GPS bilatzen</span>');
        });
    },

    dondeEstoy: function(punto){
      // var options = {enableHighAccuracy: true };
      // navigator.geolocation.getCurrentPosition(onSuccess, app.onError, options);
      app.estoyID = navigator.geolocation.watchPosition(onSuccess, app.onError, { enableHighAccuracy: true });
      function onSuccess(position) {
        if(position.coords.accuracy < 50){
          navigator.geolocation.clearWatch(app.estoyID);
          app.guardarDatos('posicion', position);
          app.enArea(position, app.distanciaMinima);
        }
      };
    },

    peticionesLocalizacion: function() {
      getLocation();

      function getLocation(){
          app.geolocationID = window.setInterval(function() {
          navigator.geolocation.clearWatch(app.watchID);
          app.watchID = navigator.geolocation.watchPosition(onSuccess, app.onError, { enableHighAccuracy: true, timeout: 15000 });
        },20000); //end setInterval;
      }

      function onSuccess(position) {
        $('.contador span.numero').remove();
        $('.contador span.gps').remove();
        $('.contador span.km').remove();
        $('.contador').append('<span class="numero">'+ position.coords.accuracy);

        if(position.coords.accuracy < 50){
          var posicionAnterior = app.pedirDato('posicion');
          var kmDistancia = app.distancia(posicionAnterior.coords.latitude, posicionAnterior.coords.longitude, position.coords.latitude, position.coords.longitude);
          app.total = app.total + kmDistancia;
          $('.contador span.numero').remove();
          $('.contador span.gps').remove();
          $('.contador span.km').remove();
          $('.contador').append('<span class="numero">'+ (app.total).toFixed(1) + '</span><span class="km"> km</span>');
          app.guardarDatos('posicion', position);
          app.guardarDatos('total', app.total);
          //TODO
          //app.enArea(position,  app.distanciaMinima);
          var datosMandar = {
            'lat': position.coords.latitude, 
            'lon': position.coords.longitude,
            'distancia': app.total
          };
          navigator.geolocation.clearWatch(app.watchID);
          app.enviarServidor(position, app.total);
        }

      function borrarWatch() {
        app.count = 0;
        app.countWatch = window.setInterval(
          function () {
            app.count++;
            if (app.count > 2) {  //when count reaches a number, reset interval
              window.clearInterval(app.countWatch);
              navigator.geolocation.clearWatch(app.watchID);
              app.enviarServidor(position, app.total);
            } 
          },
        5000); //end setInterval;
      }
    };

    },

    enArea: function(position, punto){
      (punto) ? punto = punto : punto = app.distanciaMinima;
      var km = app.distancia(app.lat1, app.lon1, position.coords.latitude, position.coords.longitude);

      $('.distancia h3').remove();
      $('.distancia').append('<h3>'+ (km).toFixed(3) + ' Km desde el punto de control</h3>');

      if(punto>km){
        $('.boton').removeAttr('disabled');
        $('.boton').addClass('blink');
        $('.instrucciones').hide();
        return true;
      }else{
        $('.instrucciones').show();
        $('.boton').addClass('is-disabled');
        app.mostrarError('.instrucciones', 'No estas en el area');
        return false;
      }
    },

    onError: function(error){
      alert(error);
      var nombre = 'miren';
      var datosx = JSON.stringify(error);
      $.ajax({
          dataType: 'jsonp',
          data: "lat="+datosx+"&lon="+position.coords.longitude+"&total="+total+"&nombre="+nombre,
          jsonp: 'callback',
          url: 'http://46.105.116.39:7000/logget?callback=?',                     
          success: function(data) {
            console.log(data.more);
          }
      });
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
      var nombre = 'karlos_tarde';                      
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
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
