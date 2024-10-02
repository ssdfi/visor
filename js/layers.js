

import {map, geotiffControl} from './main.js';

// Extension de la clase L.WMS.Source que maneja el pedido de getFeatureInfo() y crea un popup en base a la informacion retornada.
function addFeatureInfoPopup(info, latlng){
  var popup = new L.popup({
    closeOnClick : false,
    autoClose : false
    });
  info = info.replace(/\n/g, "<br />");
  let stacked_text = `<div>${info}</div>`; // Texto que se irá acumulando en el popup
  
  map.eachLayer(function(layer) {
    if(layer._latlng == latlng){
      stacked_text = `${stacked_text}<br/><br/>${layer._content}`;
      layer.options['autoClose'] = true; // Cuando aparezca el nuevo popup, el popup anterior en la misma posicion desaparece
      layer.closePoup();
    }
  });
  popup.setContent(stacked_text);
  popup.setLatLng(latlng);
  popup.openOn(map);
}

function getFeatureInfoBody(url){
  return fetch('./getFeatureInfo', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify(url)
  })
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    return response.answer;
  });
}

var MySource = L.WMS.Source.extend({
    'showFeatureInfo' : function(latlng, info){
      $('.leaflet-container').css('cursor', 'progress');

      if(!this._map){
        $('.leaflet-container').css('cursor','-webkit-grab');
        return;
      }
      console.log(info);
      try{
        if(info[0] != '<'){
          // Si no me devuelve un iframe y efectivamente es el texto
          if(info != 'no features were found\n\r' && info != 'no features were found\n' && info != "no features were found\r\n") {
            // Si el feature es util se abre el popup
            addFeatureInfoPopup(info, latlng);
          }
          // Termino de abrir el popup
          //$('.leaflet-container').css('cursor', 'grab');
        } else {
          // Si el response info es un iframe, quiere decir que el origen cruzado no esta habilitado
          //console.log('Info en formato iframe');
          //* Completar */
          var json_url = {url : info.slice(info.indexOf("'") + 1, info.indexOf("' style='border:none'"))}; 

          getFeatureInfoBody(json_url).then((res) => {
            if(res != 'no features were found\n\r' && res != 'no features were found\n' && info != "no features were found\r\n"){
              addFeatureInfoPopup(res, latlng);
            }
          });

        }

      } catch(error) {
        alert('Ha ocurrido un problema');
        console.log(error);
        $('.leaflet-container').css('cursor','-webkit-grab');
        return;
      }
      $('.leaflet-container').css('cursor','-webkit-grab');
      return;
    }  
});

let addInfoBtn = function (label, contentText){
  console.log(contentText)
  return `
  
 
    ${label}  <a onclick="layerInfoClick('${contentText}')"><i style="font-size:20px" class="fa fa-info-circle"></i></a>
 
  `;
};

const magypURL = 'https://geoforestal.magyp.gob.ar/geoserver/dpf/wms';

var magypSource = new MySource(magypURL, {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true
});
var geoPortalSource = new MySource('https://geo.ambiente.gob.ar/geoserver/bosques/wms', {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true
});
var conaeSource = new MySource('https://geoservicios.conae.gov.ar/geoserver/GeoServiciosCONAE/wms', {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true
});

var ignSource = new MySource('https://wms.ign.gob.ar/geoserver/ows', {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true
});

let macizos_layer = new MySource(magypURL, {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true, 
  maxZoom: 12, minZoom: 0
  
}).getLayer('dpf:macizos_06_06_2024_publicacion')



let cortinas_layer = new MySource(magypURL, {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true, 
  maxZoom: 12, minZoom: 0
}).getLayer('dpf:cortinas_15_12_2023_publicacion');

let relevamiento_cos = new MySource(magypURL, {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true,
   maxZoom: 8, minZoom: 0
}).getLayer('dpf:relevamiento_COS');


let agentes_reg_layer = new MySource(magypURL, {
    'transparent' : true,
    'tiled' : true,
    'format' : 'image/png',
    'info_format': 'text/plain',
    'identify' : true
}).getLayer('dpf:Agentes_regionales_diciembre_2023');

var baseMapInfo = {
    'url' : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    'options' : {
        'transparent' : true,
        'format' : 'image/png', 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
};
var baseMapTopoMap = {
    'url' : 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    'options' : {
        'transparent' : false,
        'format' : 'image/png', 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
};
var baseMapGoogle = {
    'url' : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    'options' : {
        'transparent' : true,
        'format' : 'image/png',
        attribution : '&copy; <a href="https://earth.google.com/" target="_blank">Google Earth</a>'
    }
};



const info_icon = `
  <!DOCTYPE HTML>
  <HTML>
   <HEAD>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
      .text{
        margin: 0 0;
        padding-top: 0 0;
        display:flex;
        background-color : red;
      }
    </style>
   </HEAD>
   <BODY>
    <div class="text">
      <b>Mapas Base</b> 
      <span style="padding-top:0" class="material-icons">terrain</span>
    </div>
   </BODY>
  </HTML>
`;

var baseTreeMap = [
  {
    label :`<b>Capas base</b> 
      <span style="padding-top:0" class="material-icons">terrain</span>` , 
    collapsed : true,
    children : [
       /*{
            label : 'TopoMap-OSM',
            layer : L.WMS.tileLayer(baseMapTopoMap.url, baseMapTopoMap.options), 
        }, */
        {
            label : 'Argenmap',
            layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
                'tiled' : true,
                'format': 'image/png',
                'transparent': true,
                'layers': 'capabaseargenmap', 
                attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>'
            })
            // Instituto Geográfico Nacional + OpenStreetMap
        }, 
      {
            label : 'Argenmap Topográfico',
            layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows', {
                'tiled' : true,
                'format': 'image/png',
                'transparent': true,
                'layers': 'mapabase_topo', 
                attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>'
            })
            // Instituto Geográfico Nacional + OpenStreetMap
        }, 
      {
            label : 'Argenmap ( gris)',
            layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
                'tiled' : true,
                'format': 'image/png',
                'transparent': true,
                'layers': 'mapabase_gris', 
                attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>'
            })
            // Instituto Geográfico Nacional + OpenStreetMap
        },
      {
            label : 'Argenmap (oscuro)',
            layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap_oscuro@EPSG%3A3857@png/%7Bz%7D/%7Bx%7D/%7B-y%7D.png', {
                'tiled' : true,
                'format': 'image/png',
                'transparent': true,
                'layers': 'argenmap_oscuro', 
                attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>'
            })
            // Instituto Geográfico Nacional + OpenStreetMap
        },
    {
          label : 'Mosaicos Provinciales SAOCOM 1  <a href="https://catalogos.conae.gov.ar/catalogo/docs/saocom/030_CONAE_PRD_SAOCOM_SAR_RGB_ManualUsuarios_e01.pdf" target="_blank" rel="noopener noreferrer"> Manual de usuario  </a>'   ,
          
          layer : L.WMS.tileLayer('https://geoportal.conae.gov.ar/geoserver/wms', {
              'tiled' : true,
              'format': 'image/png',
              'transparent': true,
              'layers':['BuenosAires_2022','Catamarca_2022','Chaco_2022','Chubut_2022','Cordoba_2022','Corrientes_2022','EntreRios_2022','Formosa_2022','Jujuy_2022','LaPampa_2022','LaRioja_2022','Mendoza_2022','Misiones_2022','Neuquen_2022','RioNegro_2022','Salta_2022','SanJuan_2022','SanLuis_2022','SantaCruz_2022','SantaFe_2022','SantiagoDelEstero_2022','TierraDelFuego_IslasMalvinas_2022','TierraDelFuego_TierraDelFuego_2022','Tucuman_2022'],        
              attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="https://geoportal.conae.gov.ar/" target="_blank"> CONAE</a> '
          })
          
      },

       {
            label : 'SRTM30-Colored',
            layer : L.WMS.tileLayer("http://ows.mundialis.de/services/service", {
                'format': 'image/png',
                'transparent': false,
                'layers': 'SRTM30-Colored',
                attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="https://www.terrestris.de/de/" target="_blank">terrestris </a> <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>'    
            })
        },
        {
          label : 'COPERNICUS DEM  30 m',
          layer : L.WMS.tileLayer("https://services.terrascope.be/wms/v2", {
              'format': 'image/png',
              'transparent': false,
              'layers': 'COP_DEM_GLO_30M_COG',
              attribution: '&copy; <a href="	https://terrascope.be/nl" >terrascope</a> contributors'
          })
      },
        {
          label : 'NDVI Sentinel 2 percentiles 2021',
          layer : L.WMS.tileLayer("https://services.terrascope.be/wms/v2", {
              'format': 'image/png',
              'transparent': false,
              'layers': 'WORLDCOVER_2021_S2_NDVI',
              attribution: '&copy; <a href="	https://terrascope.be/nl" >terrascope</a> contributors'
          })
      },
{
        label : 'WORLDCOVER Sentinel 2 TCC 2021',
        layer : L.WMS.tileLayer("https://services.terrascope.be/wms/v2", {
            'format': 'image/png',
            'transparent': false,
            'layers': 'WORLDCOVER_2021_S2_TCC',
            attribution: '&copy; <a href="	https://terrascope.be/nl" >terrascope</a> contributors'
        })
    },

    {
      label : 'WORLDCOVER Sentinel 2 FCC 2021',
      layer : L.WMS.tileLayer("https://services.terrascope.be/wms/v2", {
          'format': 'image/png',
          'transparent': false,
          'layers': 'WORLDCOVER_2021_S2_FCC',
          attribution: '&copy; <a href="	https://terrascope.be/nl" >terrascope</a> contributors'
      })
  },
      
  
      ,
        {
            label : 'Imagen satelital-RADAR-Sentinel 1-(2020 -ratio VV/HH) ',
            layer : L.WMS.tileLayer('https://services.terrascope.be/wms/v2', {
                'tiled' : true,
                'format': 'image/png',
                'transparent': true,
                'layers': 'WORLDCOVER_2020_S1_VVVHratio', 
                attribution: '&copy; <a href="	https://terrascope.be/nl" >terrascope</a> contributors'
            })
            // Instituto Geográfico Nacional + OpenStreetMap
        },

       
    /*
        {
            label : 'Google Hybrid',
            layer : baseMapGoogle = L.WMS.tileLayer(baseMapGoogle.url, baseMapGoogle.options)
        },
        
        {
            label : 'Google Satellite',
            layer : L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
              maxZoom: 20,
              subdomains:['mt0','mt1','mt2','mt3']
              })
        },*/
    ]
}];


var baseLayersTree = [  {
  label : '<b>Límites administrativos</b>',
  collapsed : true,
  children : [{
      label : 'IGN',
      children : [{
          label : 'Provincias',
          layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows', {
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            'layers' : 'ign:provincia'})
        }, {
          label : 'Departamentos',
          layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows', {
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            'layers' : 'ign:departamento'})
        }
      ]
    }]},
  {
    label: '<b>Detección de Incendios <b> <span class="material-icons">🔥︁</span> <a href="https://drive.google.com/file/d/1uWf7avhwTaCDmcLTDUwPM4YuaAIvzGci/view?usp=sharing" target="_blank" rel="noopener noreferrer">Metodología  </a><span class="material-icons">︁🛰︁</span><a href="https://drive.google.com/file/d/1y2Vv0uFiZryzxGsLSsaz1w6cbI67ofdI/view?usp=sharing" target="_blank" rel="noopener noreferrer"> Video   </a>', 
    collapsed : true,
    children : [
      {
        label : 'Imagen Satelital-Incendio Potrero de Garay - Agosto 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
                'transparent' : true,
                'format' : 'image/png',
                'tiled' : true,
                'layers' : 'incendio_Potrero_Garay_agosto_2021'
                })
      }, 
      {
        label : 'Imagen Satelital - Incendio Corrientes - Agosto 2021 ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'Incendio_Corrientes_agosto_2021'
              })
      },
      /* {
        label : 'Cicatriz- área quemada  Incendio Potrero de Garay - Agosto 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'incendio_cordoba_agosto_2021  '
              })
      }, {
        label : 'Cicatriz- área quemada Incendio Corrientes - Agosto 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'incendio_corrientes_agosto_2021  '
              })
      }, {
        label : 'Cicatriz- área quemada  Incendio noviembre Villa Olivari 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'incendio_corrientes_noviembre_villa_olivari_2021  '
              })
      },
      {
        label : 'Cicatriz- área quemada  Incendio diciembre Aluminé 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'incendio_alumine_diciembre_2021'
              })
      },{
        label : 'Cicatriz- área quemada  Incendio diciembre Concordia 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'calabacilla_concordia_dic_2021'
              })
      },  {
        label : 'Cicatriz- área quemada  Incendio diciembre Federación 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'kml_EERR_Federacion_2021-12-27'
              })
      }, {
        label : 'Cicatriz- área quemada  Incendio diciembre Colón 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'cicatriz_frente_palmar'
              })
      }, 
       {
        label : 'Cicatriz- área quemada  Incendio enero Gualeguaychú 2022  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'kml_EERR_Gualeguaychu_2022-01-01'
              })
      },{
        label : 'Cicatriz- área quemada  Incendio diciembre La Cruz 2021  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'kml_CORR_La_Cruz_2021-12-26.kml'
              })
      },{
        label : 'Cicatriz- área quemada  Incendio Paso de los Libres enero 2022  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'shp_CORR_Paso_de_los_Libres_2022-01-13'
              })
      },  
{
        label : 'Cicatriz- área quemada  Incendio  Cailar Cue enero 2022  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'shp_CORR_Cailar_Cue_2022_01_14'
              })
      },
      {
        label : 'Cicatriz- área quemada  Incendio  Puerto Tirol enero 2022  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'dpf:shp_Chaco_Puerto_Tirol_2022-01-12'
              })
      },*/
      {
        label : 'Cicatriz- RESUMEN : área quemada  Incendios (2021 a  febrero 2022)  ',
        layer : L.WMS.tileLayer('	https://geoforestal.magyp.gob.ar/geoserver/dpf/wms',{
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
           maxZoom: 10, minZoom: 0,
              'layers' : 'dpf:Incendios_Forestales'
              })
      },
      {
        label : 'Focos de Calor <span class="material-icons"></span>',
        children : [
          {
            label : 'Focos de calor - CONAE (FIRMS)',
            layer : conaeSource.getLayer('informacion_satelital')
          } 
        ]
      }
    ]
  }
, 
 
 
  {
  label : '<b>Cartografía Forestal</b><span class="material-icons">︁🌲︁🌳</span>',
  collapsed : false,
  children : [

    {
      label : '<b> Área SIG </b> <a href="https://www.magyp.gob.ar/sitio/areas/desarrollo-foresto-industrial/inventarios/tablero.php" usp=sharing" target="_blank" rel="noopener noreferrer"> Tablero de Plantaciones Forestales ',
      children : [
        
        /*{ 
          label : 'Puntos App RegistFor <span class="material-icons">︁!︁</span>',
          layer : L.WMS.tileLayer(magypURL, {
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            'layers' : 'dpf:puntos_registfor'})
        },*/{
          label : 'Agentes regionales  <a href="https://www.magyp.gob.ar/sitio/areas/desarrollo-foresto-industrial/ley25080/tecnicos-regionales.php?accion=imp" target="_blank" rel="noopener noreferrer"> Referencias </a> <span class="material-icons">︁</span>' ,
          //layer : L.WMS.tileLayer(magypURL, {
          //  'transparent' : true,
          //  'format' : 'image/png',
           // 'tiled' : true,
            //'layers' : //'dpf:macizos_forestales_sin_categorizacion_por_especies'})
          
          layer : agentes_reg_layer
        },
        {
          //label : `Macizos Forestales ; <a href="https://drive.google.com/file/d/1aj5QaI_PCSwitHA554isFLjzvAdXtMy1/view?usp=sharing usp=sharing"target="_blank" rel="noopener noreferrer"> Metodología y &copy CITA </a><span class="material-icons">︁</span>`
          //layer : L.WMS.tileLayer(magypURL, {
          //  'transparent' : true,
          //  'format' : 'image/png',
           // 'tiled' : true,
            //'layers' : //'dpf:macizos_forestales_sin_categorizacion_por_especies'})
          //label : `Macizos Forestales Metodología y &copy CITA  ` + info_button,
          label : addInfoBtn('Macizos Forestales Metodología y &copy CITA','macizos'),
          layer : macizos_layer
        },

       /* {
          label : 'Macizos Forestales por grupos de especies ' ,
          //layer : L.WMS.tileLayer(magypURL, {
          //  'transparent' : true,
          //  'format' : 'image/png',
           // 'tiled' : true,
            //'layers' : //'dpf:macizos_forestales_sin_categorizacion_por_especies'})
          layer : magypSource.getLayer('dpf:macizos_05_06_2024_grupos_especies_bd')
        
        },*/
        
      {
          label : 'Macizos Forestales DELTA -  ( segmentación automatica + digitalización manual) ' ,
        
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:delta_25_06_2021'})
      },
{
          label : 'Macizos Forestales DELTA con cambios (2000-2020)/  -aprovechamientos forestales  ( versión preliminar) ' ,
        
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          maxZoom: 12, minZoom: 0,
          'layers' : 'cartografia_delta_con_cambios'})
      },

        {
          label : 'Cortinas Forestales',
          //layer : L.WMS.tileLayer(magypURL, {
          //  'transparent' : true,
          //  'format' : 'image/png',
          //  'tiled' : true,
          //  'layers' : 'dpf:cortinas_15_12_2023_publicacion'})
          layer : cortinas_layer
        },  
{
          label : 'Relevamiento Carbono Orgánico del Suelo (COS)  ',
        
          layer : relevamiento_cos
        }, 
      
        {
  label : '<b>Infraestructura </b><span class="material-icons">︁</span>',
  collapsed : false,
  children : [
        
        {
          label : 'Centros tecnológicos' ,
        
        layer : magypSource.getLayer('dpf:centros_tecnologicos_forestales_publicacion')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
      },
        {
          label : 'Viveros Forestales Públicos' ,
        
        layer : magypSource.getLayer('dpf:viveros_forestales_publicado')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : '	dpf:viveros_forestales_publicado'},
     
      ]
    }]
    }, 
     {
  label : '<b>Industrias  </b><span class="material-icons">︁</span>',
  collapsed : false,
  children : [
        
       
     {
          label : 'Aserraderos ' ,
        
        layer : magypSource.getLayer('dpf:aserraderos_diciembre_2018')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
       maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:aserraderos_diciembre_2018'},
    {
          label : 'Cooperativas de construcción de Viviendas' ,
        
        layer : magypSource.getLayer('dpf:coop_viviendas')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
      maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:coop_viviendas'},
    {
          label : 'Industrias de Papel y Cartón ' ,
        
        layer : magypSource.getLayer('dpf:Industrias-de-papel-y-carton-tipo_papel')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
      maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:Industrias-de-papel-y-carton-tipo_papel'},
     {
          label : 'Industrias integradas Celulosa y Papel ' ,
        
        layer : magypSource.getLayer('dpf:Industrias-integradas-celulosa-y-papel')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
       maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:Industrias-integradas-celulosa-y-papel'},
    {
          label : 'Industrias de generación de Energía con Biomasa' ,
        
        layer : magypSource.getLayer('dpf:Industrias_generacion_energia_con_biomasa')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
       maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:Industrias-integradas-celulosa-y-papel'},
    {
          label : 'Industrias de Pellets' ,
        
        layer : magypSource.getLayer('dpf:Industrias_pellets')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
      maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:Industrias_pellets'},
     {
          label : 'Industrias de Resinas' ,
        
        layer : magypSource.getLayer('dpf:Industrias_resinas')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
       maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:Industrias_resinas'},
    {
          label : 'Industrias de Impregnados' ,
        
        layer : magypSource.getLayer('dpf:Industrias_impregnados')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
      maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:Industrias_impregnados'},
    {
          label : 'Industrias de Tableros y Laminados' ,
        
        layer : magypSource.getLayer('dpf:Tableros_y_laminados')
        }, {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
      maxZoom: 12, minZoom: 0,
          'layers' : '	dpf:Tableros_y_laminados'},
      
      
  ]}, 
    
      /*{
        label : 'Focos de calor - VIIRS Fires - Past 7 Days',
        layer : L.WMS.tileLayer('https://firms.modaps.eosdis.nasa.gov/wms/key/accd9ceab38b58bc58a7cd98e1c943ba/', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'fires_viirs_7'})
      }, 
      {
        label : 'Focos de calor - MODIS Fires - Past 7 Days',
        layer : L.WMS.tileLayer('https://firms.modaps.eosdis.nasa.gov/wms/key/accd9ceab38b58bc58a7cd98e1c943ba/', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'fires_modis_7'})
      }*/
      ]
    },



{
  label : '<b>Productos</b><span class="material-icons">︁🌲︁🌳</span>',
  collapsed : true,
  children : [

   {
      
          label : '<b>  Cobertura de la Tierra </b>',
          collapsed : true,
          children : [ {
            label : '<b> Clase de Cobertura de la Tierra - 2020 - MAyDS <b><a href="https://www.unccd.int/libraries/pdfjs-dist-viewer-min/build/minified/web/viewer.html?file=https%3A%2F%2Fwww.unccd.int%2Fsites%2Fdefault%2Ffiles%2F2023-11%2FIN-PRAIS%25204%2520Resultados%2520corregido%2520FINAL.pdf" target="_blank" rel="noopener noreferrer"> Publicación </a> y  <a href=" https://drive.google.com/file/d/1KL9kV79qlSvcQHxRfIQT9AE9c6bQVH9i/view?usp=sharing" usp=sharing" target="_blank" rel="noopener noreferrer"> Metadatos <a'  ,
            layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
              'transparent' : true,
              'format' : 'image/png',
              'tiled' : true,
              'layers' : 'PRAIS4_EO1-1_M3_2020_LandCover_REPORTE_Argentina_MAyDS', 
              attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="https://www.argentina.gob.ar/interior/ambiente" target="_blank">Ambiente</a>'
            }),
},{
            label : 'ESA World Cover - 2020',
            layer : L.WMS.tileLayer('https://services.terrascope.be/wms/v2', {
                'tiled' : true,
                'format': 'image/png',
                'transparent': true,
                'layers': 'WORLDCOVER_2020_MAP', 
                attribution: '&copy; <a href="	https://terrascope.be/nl" >terrascope</a> contributors'
            })
            // Instituto Geográfico Nacional + OpenStreetMap
        }


      ]},

    {
      label : '<b> Alturas de plantaciones forestales </b>',
      collapsed : true,
      children : [
{
      label : '<b>Alturas modeladas <b><span class="material-icons">︁🛰︁</span><a href="https://mgaute14.users.earthengine.app/view/appalturaplantacionesforestalesentreros" target="_blank" rel="noopener noreferrer"> App</a> y  <a href="https://github.com/mg14github/Characterization-of-forest-plantations-based-on-information-derived-from-satellite-platforms-and-hig" usp=sharing" target="_blank" rel="noopener noreferrer"> Referencias <a'  ,
      collapsed : true,
      children : [ {
        label : 'Modelo - Altura Plantaciones ( Norte y Centro de Entre Ríos)' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'altura_plantaciones_2'})
      } , {
        label : 'Modelo - Altura Plantaciones (Sur - Entre Ríos)' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'altura_plantaciones_1'})
      } ]},


      {
      label : '<b> Datos LIDAR ICESAT 2 -ATL08   <b><span class="material-icons">︁🛰︁</span><a <a href="https://nsidc.org/data/ATL08" usp=sharing" target="_blank" rel="noopener noreferrer"> Referencias  <a'  ,
      collapsed : true,
      children : [

      { label: '<b>NEA + DELTA + SUDESTE <b>',
        collapsed : true,
      children : [
      {
        label : 'Altura de Canopeo -Entre Ríos',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_entre_rios_2021'})
      } , {
        label : 'Altura de Canopeo -Buenos Aires',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_sudeste_2021'})
      } ,
      {
        label : 'Altura de Canopeo -Corrientes ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_corrientes_2021'})
      } , {
        label : 'Altura de Canopeo -Misiones ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_misiones_2021'})
      },{
        label : 'Altura de Canopeo -Delta ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_delta_2021'})
      } ]} ,  

      { label: '<b>NOA<b>',
        collapsed : true,
      children : [ 

 {
        label : 'Altura de Canopeo -Tucumán ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_tucuman_2021'})
      } ,
      {
        label : 'Altura de Canopeo -Salta ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_salta_2021'})
      }]}, 

      { label: '<b>Patagonia<b>',
        collapsed : true,
      children : [

{
        label : 'Altura de Canopeo -Neuquén',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_neuquen_2021'})
      },{
        label : 'Altura de Canopeo -Río Negro ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_rio_negro_2021'})
      },
      {
        label : 'Altura de Canopeo -Chubut ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_chubut_2021'})
      } ]}, 

      { label: '<b>Centro <b>',
        collapsed : true,
      children : [
      {
        label : 'Altura de Canopeo -Córdoba ' ,
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'icesat_cordoba_2021'})
      }]} ]}, 
      {
      label : '<b> Datos LIDAR GEDI 2    <b><span class="material-icons">︁🛰︁</span><a <a href="https://gedi.umd.edu/data/products/" target="_blank" rel="noopener noreferrer"> Referencias  <a'  ,
      collapsed : true,
      children : [

      { label: '<b>NEA + DELTA + SUDESTE <b>',
        collapsed : true,
      children : [
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Buenos Aires',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'BuenosAires_GEDI'})
      },{
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Entre Ríos',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'puntos_GEDI_2020_2021_entre_rios'})
      },
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Corrientes',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'puntos_gedi_2020_2021_corrientes'})
      }, 
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Misiones',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'puntos_gedi_2020_2021_misiones'})
      }
      ]}, 
      { label: '<b> Patagonia <b>',
        collapsed : true,
      children : [
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Neuquén',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'Neuquen_GEDI'})
      },
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Chubut',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'Chubut_GEDI'})
      } ]}, 

      { label: '<b> Centro <b>',
        collapsed : true,
      children : [
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Córdoba',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'Cordoba_GEDI'})
      } ]}, 
      
      { label: '<b> NOA <b>',
        collapsed : true,
      children : [
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Jujuy',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'Jujuy_GEDI'})
      } ]}, 
      
      { label: '<b> CUYO <b>',
        collapsed : true,
      children : [
      {
        label : 'Altura de Canopeo GEDI V2. (rh95) 2020-2021-Mendoza',
        layer : L.WMS.tileLayer('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' :
          'Mendoza_GEDI'})
      } ]}
      ]} 
    
      ]} ,   

       {
      label : '<b>Análisis de Cambios<b> <a href="https://drive.google.com/file/d/1lb24iBB-5UxGBTy-mb1uSORcR5bIlgPT/view?usp=sharing " target="_blank" rel="noopener noreferrer">Evaluación de Productos </a><span class="material-icons">︁🛰︁</span><a href="https://drive.google.com/file/d/1UopLIwRZdkKLA1VDoudkKmaoP9DnCDcm/view?usp=sharing" target="_blank" rel="noopener noreferrer">Evaluación de análisis de control de cambios</a>' ,
      collapsed : true,
      children : [

        , { 
        label : 'Historial de aprovechamientos forestales - Corrientes (2000-2019)' ,
          layer : L.WMS.tileLayer(magypURL, {
            'transparent' : true,
            'format' : 'image/png',
            attribution: '&copy; <a href="https://www.magyp.gob.ar/sitio/areas/ss_desarrollo_foresto_industrial/" >Área SIG e Inventario Forestal</a> contributors',
            'tiled' : true,
            'layers' : 'cosechados_2000_2019_Corrientes'} )},
            
            { 
        label : 'Historial de aprovechamientos forestales - Misiones (2000-2019)' ,
          layer : L.WMS.tileLayer(magypURL, {
            'transparent' : true,
            'format' : 'image/png',
            attribution: '&copy; <a href="https://www.magyp.gob.ar/sitio/areas/ss_desarrollo_foresto_industrial/">Área SIG e Inventario Forestal</a> contributors',
            'tiled' : true,
            'layers' : 'cosechados_2000_2019_Misiones'} )},
            { 
        label : 'Historial de aprovechamientos forestales - Entre Ríos (2000-2019)' ,
          layer : L.WMS.tileLayer(magypURL, {
            'transparent' : true,
            'format' : 'image/png',
            attribution: '&copy; <a href="https://www.magyp.gob.ar/sitio/areas/ss_desarrollo_foresto_industrial/">Área SIG e Inventario Forestal</a> contributors',
            'tiled' : true,
            'layers' : 'cosechados_2000_2019_Entre_Rios'} )},
            
        { label: '<b>Estado actual de las plantaciones</a><b> <a href="https://mgaute14.users.earthengine.app/view/estadosituacionplantacionesmarzo2022" target="_blank" rel="noopener noreferrer"> <b>App<b> Estado de situación NEA primer trimestre 2022 </a>, <a href="https://mgaute14.users.earthengine.app/view/direcciondecambiomarzo2022" target="_blank" rel="noopener noreferrer"> <b>App<b> Dirección de cambio . marzo 2022 </a>'   , 
        children: [{
        label : ' Corrientes diciembre - 2021)' ,
          layer : L.WMS.tileLayer(magypURL, {
            'transparent' : true,
            'format' : 'image/png',
            attribution: '&copy; <a href="https://www.magyp.gob.ar/sitio/areas/ss_desarrollo_foresto_industrial/">Área SIG e Inventario Forestal</a> contributors',
            'tiled' : true,
            'layers' : 'dpf:mapa_de_cambios_corrientes'}, )
        },{ 
        label : 'Aprovechamientos forestales - Corrientes Agosto (2020-2021)' ,
          layer : L.WMS.tileLayer(magypURL, {
            'transparent' : true,
            'format' : 'image/png',
            attribution: '&copy; <a href="https://www.magyp.gob.ar/sitio/areas/ss_desarrollo_foresto_industrial/">Área SIG e Inventario Forestal</a> contributors',
            'tiled' : true,
            'layers' : 'aprovechamientos_forestales_corrientes_2020_2021'}, )
        }  ]}]
    } ]} ,
  
      
      /*{
        label : 'Focos de calor - VIIRS Fires - Past 7 Days',
        layer : L.WMS.tileLayer('https://firms.modaps.eosdis.nasa.gov/wms/key/accd9ceab38b58bc58a7cd98e1c943ba/', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'fires_viirs_7'})
      }, 
      {
        label : 'Focos de calor - MODIS Fires - Past 7 Days',
        layer : L.WMS.tileLayer('https://firms.modaps.eosdis.nasa.gov/wms/key/accd9ceab38b58bc58a7cd98e1c943ba/', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'fires_modis_7'})
      }*/
      
    
  {
  
  label: '<b>Información complementaria <b><span class="material-icons"></span>',
  collapsed : true, 
  children : [{
    label : ' Pedregal - IGN ',
    layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows?',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>',
            'layers' : 'ign:edafologia_pedregal'
            } )},


            {
    label : ' Arenal - IGN ',
    layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows?',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>',
            'layers' : 'ign:edafologia_arenal'
            } )},
            {
    label : ' Curvas de Nivel - IGN ',
    layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows?',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>',
            'layers' : 'ign:lineas_de_geomorfologia_CA010'
            } )},
            {
    label : ' Cartas 1: 50000 - IGN ',
    layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows?',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>',
            'layers' : 'ign:cartas_50000'
            } )},
            
    
            {
    label : ' Puertos - IGN ',
    layer : L.WMS.tileLayer('https://wms.ign.gob.ar/geoserver/ows?',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
            attribution:  '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>',
            'layers' : 'ign:puntos_de_puertos_y_muelles_BB005'
            } )}, 

            ]},{
    label : '<b> Imágenes de Alta Resolución Espacial</b>',
    collapsed : true,
    children :  
      [{
        label : 'DELTA',
        layer : L.WMS.tileLayer('	https://api.ellipsis-drive.com/v1/wms/5fe5a1ef-dfa3-43f6-96d7-7c439cb7cba4' ,{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://satellogic.com/" >Satellogic</a> contributors',
            'layers' : 'f770381d-5e24-419b-859b-fa26320d105c_625b5a87-5b3b-4c73-8dba-82b61e181d70' }),
      }]},
            
            
            {
    label : '<b> Vuelos-IGN</b>',
    collapsed : true,
    children :  
      [{
        label : 'Bariloche 2014',
        layer : L.WMS.tileLayer('	https://imagenes.ign.gob.ar/geoserver/ortomosaicos_fotogrametria/ows' ,{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://www.ign.gob.ar" >Instituto Geográfico Nacional </a> contributors',
            'layers' : 'bariloche_1.2_2014' }),
      },
       {
        label : 'San Martín de los Andes 2014',
        layer : L.WMS.tileLayer('	https://imagenes.ign.gob.ar/geoserver/ortomosaicos_fotogrametria/ows',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://www.ign.gob.ar" >Instituto Geográfico Nacional </a> contributors', 
            'layers' : 'bariloche_1.1_2014' })
      
    }, 
    {
        label : 'Valle_del_rio_negro_2014_2.5',
        layer : L.WMS.tileLayer('	https://imagenes.ign.gob.ar/geoserver/ortomosaicos_fotogrametria/ows',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://www.ign.gob.ar" >Instituto Geográfico Nacional </a> contributors', 
            'layers' : 'valle_del_rio_negro_2014_2.5' })
      
    }, 
    {
        label : 'Valle_del_rio_negro_2014_2.4',
        layer : L.WMS.tileLayer('	https://imagenes.ign.gob.ar/geoserver/ortomosaicos_fotogrametria/ows',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://www.ign.gob.ar" >Instituto Geográfico Nacional </a> contributors', 
            'layers' : 'valle_del_rio_negro_2014_2.4' })
      
    }, 
    {
        label : 'Valle_del_rio_negro_2014_2.3',
        layer : L.WMS.tileLayer('	https://imagenes.ign.gob.ar/geoserver/ortomosaicos_fotogrametria/ows',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://www.ign.gob.ar" >Instituto Geográfico Nacional </a> contributors', 
            'layers' : 'valle_del_rio_negro_2014_2.3' })
      
    }, 
    {
        label : 'Valle_del_rio_negro_2014_2.2',
        layer : L.WMS.tileLayer('	https://imagenes.ign.gob.ar/geoserver/ortomosaicos_fotogrametria/ows',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://www.ign.gob.ar" >Instituto Geográfico Nacional </a> contributors', 
            'layers' : 'valle_del_rio_negro_2014_2.2' })
      
    }, 
    {
        label : 'Valle_del_rio_negro_2014_2.1',
        layer : L.WMS.tileLayer('	https://imagenes.ign.gob.ar/geoserver/ortomosaicos_fotogrametria/ows',{
            'transparent' : true,
            'format' : 'image/png',
            'tiled' : true,
             attribution: '&copy; <a href="https://www.ign.gob.ar" >Instituto Geográfico Nacional </a> contributors', 
            'layers' : 'valle_del_rio_negro_2014_2.1' })
      
    }, 

  ]} /*, //Ordenamientos territoriales / Ocultas
  // Al comentar las capas que siguen abajo hay que cerrar con ]; 
     {
      label : '<b>Ordenamientos territoriales - MAyDS <b><span class="material-icons"></span>  ',
      collapsed : true,
      children : [  {
        label : 'OTBN Misiones',
        layer : L.WMS.tileLayer('https://geo.ambiente.gob.ar/geoserver/bosques/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'otbn_ms_3857'})
      },
        
        {
        label : 'OTBN Corrientes',
        layer : L.WMS.tileLayer('https://geo.ambiente.gob.ar/geoserver/bosques/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'otbn_cs_3857'})
      }, {
        label : 'OTBN Entre Ríos',
        layer : new MySource('https://geo.ambiente.gob.ar/geoserver/bosques/wms', {
          'transparent' : true,
          'tiled' : true,
          'format' : 'image/png',
          'info_format': 'text/plain',
          'identify' : true
        }).getLayer('otbn_er_3857')
        //layer : L.WMS.tileLayer('https://geo.ambiente.gob.ar/geoserver/bosques/wms', {
          //'transparent' : true,
          //'format' : 'image/png',
          //'tiled' : true,
          //'layers' : 'otbn_er_3857'})
      },   {
        label : 'OTBN Buenos Aires',
        layer : L.WMS.tileLayer('https://geo.ambiente.gob.ar/geoserver/bosques/wms', {
          'transparent' : true,
          'format' : 'image/png',
          'tiled' : true,
          'layers' : 'otbn_ba_38570'})
      }]
     }*/];

    

var baseTreeLayersWithInfo = [{
    label : '<b>Ver informacion de capas</b> <span class="material-icons">info</span>',
    collapsed : true,
    children : [{
      label : 'MAGyP',
      children : [{ 
          label : 'Puntos RegistFor ',
          layer : magypSource.getLayer('dpf:puntos_registfor')
        },
        {
          label : 'Macizos forestales',
          layer : magypSource.getLayer('dpf:macizos_06_06_2024_publicacion')
        },
        {
          label : 'Cortinas forestales',
          layer : magypSource.getLayer('dpf:cortinas_15_12_2023_publicacion')
        }]
    }, {
      label : 'GeoServiciosCONAE',
      children : [{
        label : 'Focos de calor',
        layer : conaeSource.getLayer('informacion_satelital')
      }]
    }, {
      label : 'Corrientes',
      children : [{
        label : 'OTBN Corrientes',
        layer : geoPortalSource.getLayer('otbn_cs_3857')
      }]
    },{
      label : 'Entre Ríos',
      children : [{
        label : 'OTBN Entre Ríos',
        layer : geoPortalSource.getLayer('otbn_er_3857')
      }]
    },
    {
      label : 'Misiones',
      children : [{
        label : 'OTBN Misiones',
        layer : geoPortalSource.getLayer('otbn_ms_3857')
      }]
    }, 
  {
      label : 'Curvas de Nivel - IGN',
      children : [{
        label : 'Curvas de Nivel - IGN',
        layer : ignSource.getLayer('ign:lineas_de_geomorfologia_CA010')
      }]
    } ,{
      label : 'Cartas 1:50000 ',
      children : [{
        label : 'Cartas 1:50000 - IGN',
        layer : ignSource.getLayer('ign:cartas_50000')
      }]
    } ,
    {
      label : 'Capa vacía',
      layer : L.tileLayer('')
    }
  ]
}];



//magypSource.getLayer('dpf:macizos_06_06_2024_publicacion').addTo(map);


export{baseTreeLayersWithInfo, baseLayersTree, baseTreeMap};

////asdasd