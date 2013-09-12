/*
 * under the License.
 */
var app = {
    // Application Constructor
    lat1: 42.80971575714766,
    lon1: -1.5883148056029772,
    distanciaMinima: 1.5,
    watchID: false,
    total: 0,
    contador: 0,
    texto: false,
    points: [
      [42.8136921 , -1.5993718],
      [42.8136647 , -1.5993255],
      [42.8136446 , -1.5993376],
      [42.8134258 , -1.599008],
      [42.8134015 , -1.5989568],
      [42.81395   , -1.5984827],
      [42.8146487 , -1.598002],
      [42.8147245 , -1.5979128],
      [42.81458   , -1.5972559],
      [42.8140637 , -1.5965908], //10
      [42.8141961 , -1.5959719], //11
      [42.814046  , -1.5955554], //12
      [42.8136521 , -1.5930762], //13
      [42.8105717 , -1.5864061], //14
      [42.8104146 , -1.5875713], //15
      [42.8106707 , -1.587327],  //16
      [42.8111594 , -1.6015597],
      [42.810393  , -1.579661],
      [42.810981  , -1.5805932],
      [42.8105541 , -1.5799009],
      [42.8105486 , -1.5798925], //20
      [42.8102094 , -1.579459],
      [42.8103919 , -1.5796611],
      [42.8122659 , -1.5766075],
      [42.8121254 , -1.5742956],
      [42.8063019 , -1.5871991],
      [42.8062616 , -1.5872288],
      [42.8062066 , -1.587317],
      [42.8061379 , -1.5874764],
      [42.7975265 , -1.592748],
      [42.7931027 , -1.5951419],
      [42.7995883 , -1.5947092],
      [42.799587  , -1.5947044],
      [42.7997622 , -1.5944347],
      [42.7997769 , -1.5944589],
      [42.8000349 , -1.5947828],
      [42.8001538 , -1.5949384],
      [42.8001493 , -1.594919],
      [42.8003085 , -1.5954329],
      [42.8003256 , -1.5953072],
      [42.8008893 , -1.5960516],
      [42.8089652 , -1.5959454],
      [42.8085854 , -1.596941],
      [42.8084078 , -1.5972434],
      [42.8072776 , -1.5944537],
      [42.8073005 , -1.5944428],
      [42.8071007 , -1.5944262],
      [42.8070098 , -1.5944736],
      [42.8070156 , -1.5945089],
      [42.8078827 , -1.5964979],
      [42.8085408 , -1.5963796],
      [42.8084807 , -1.5958258],
      [42.8091377 , -1.5959297],
      [42.8090977 , -1.5958799],
      [42.8106297 , -1.5974187],
      [42.8105975 , -1.5972274],
      [42.8109912 , -1.5990642],
    ], 

    initialize: function () {
      this.bindEvents();
    },

    bindEvents: function () {
      //document.addEventListener('deviceready', this.onDeviceReady, false);
      app.onDeviceReady();
    },

    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        app.guardarDatos('distanciaTotal', '0');
        app.dondeEstoy();

        $('.lat').click(function(){
          if($(this).is(":checked")) {
            window.localStorage.setItem('texto', 'movida');
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
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
      function onSuccess(position) {
        var texto = window.localStorage.getItem('texto'); 
        (texto) ? texto = texto : texto = app.texto;
        window.localStorage.setItem('texto', texto);
        $('.texto').append('<h2>'+texto + '</h2>');

        app.guardarDatos('posicion', position);
        app.enArea(position, app.distanciaMinima);
      };

      function onError(error) {
          alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
      };
    },

    peticionesLocalizacion: function() {
      var options = { timeout: 9000 };

      app.watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
      function onSuccess(position) {
        app.mostrarInfo('.km', position);
        for (var i = 0 ; i < 17; i++) {
          var posicionAnterior = app.pedirDato('posicion');
          var kmDistancia = app.distancia(posicionAnterior.coords.latitude, posicionAnterior.coords.longitude, app.points[i][0], app.points[i][1]);
          var ultimaPosicion = {coords:{latitude:app.points[i][0], longitude:app.points[i][1]}}
          window.localStorage.setItem('posicion', JSON.stringify(ultimaPosicion));
          app.total = app.total + kmDistancia;
          app.guardarDatos('total', app.total);
          console.log(i);
          console.log('km: ' +app.total);
        };
        app.total = app.total + kmDistancia;
        $('.total h3').remove();
        $('.total').append('<h3>totaol: '+ app.total+ '</h3>');        
        app.enArea(position,  app.distanciaMinima, app.watchID);
        app.enviarServidor(position);
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
      //1.1 == 1.4;

      if(punto>km){
        $('.topcoat-button').removeClass('is-disabled');
        $('.error').hide();
        return true;
      }else{
        $('.error').show();
        $('.topcoat-button').addClass('is-disabled');
        //navigator.geolocation.clearWatch(watchID);
        app.mostrarError('.error', 'No estas en el area');
        return false;
      }
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

    enviarServidor: function(position){
      $.ajax({
          dataType: 'jsonp',
          data: "somedata= lat: "+position.coords.latitude+" log: "+position.coords.longitude,                      
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
