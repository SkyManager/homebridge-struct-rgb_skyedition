//ok
var colorsys = require('colorsys');
//var jspack = require('jspack').jspack;
//var netcat = require('node-netcat');
var Service, Characteristic;
//var exec = require('child_process').exec;
var spawn = require("child_process").spawn;

module.exports = function( homebridge ) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory( "homebridge-struct-rgb", "Struct-RGB", RgbAccessory );
};

function RgbAccessory( log, config ) {
  this.log = log;
  this.config = config;
  this.name = config.name;
  this.power = config.power;
  this.brightness = config.brightness;
  this.brightness_path = config.brightness_path;
  this.saturation = config.saturation;
  this.hue = config.hue;
  this.hue_path = config.hue_path;
  this.ch = config.ch;
  this.ip = config.ip;
  this.path = config.path;
  this.log( "Initialized '" + this.name + " - " + this.ip + ":" + this.ch + "'" );
}

RgbAccessory.prototype.setColor = function() {
  var color = colorsys.hsv_to_rgb( {
    h: this.hue,
    s: this.saturation,
    v: this.brightness
  } );

  if ( !this.power ) {
    color.r = 0;
    color.g = 0;
    color.b = 0;
  }

  this.log( "set color to", color.r, color.g, color.b );

  var color_r = color.r.toString();
  if (color_r.length == 2)
    {color_r = '0' + color_r}
  if (color_r.length == 1)
    {color_r = '00' + color_r}

  var color_g = color.g.toString();
  if (color_g.length == 2)
    {color_g = '0' + color_g}
  if (color_g.length == 1)
    {color_g = '00' + color_g}

  var color_b = color.b.toString();
  if (color_b.length == 2)
    {color_b = '0' + color_b}
  if (color_b.length == 1)
    {color_b = '00' + color_b}

  var data = color_r + color_g + color_b;
  var process = spawn('python',[this.path, this.ip, this.ch, data]);

  this.log(data);
};

RgbAccessory.prototype.getServices = function() {
  var lightbulbService = new Service.Lightbulb( this.name );
  var bulb = this;

  lightbulbService
    .getCharacteristic( Characteristic.On )
    .on( 'get', function( callback ) {
      callback( null, bulb.power );
    } )
    .on( 'set', function( value, callback ) {
      bulb.power = value;
      bulb.log( "power to " + value );
      bulb.setColor();
      callback();
    } );

  lightbulbService
    .addCharacteristic( Characteristic.Brightness )
    .on( 'get', function( callback ) {
      var process_get = spawn('python',[bulb.brightness_path, bulb.ip, bulb.ch]);
        process_get.stdout.on('data', function (data){
        bulb.brightness = data;
        bulb.log("get brightness: " + parseFloat(bulb.brightness));
        callback( null, parseFloat(bulb.brightness));
      });
      process_get.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });
      process_get.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
      //callback( null, bulb.brightness );
    } )
    .on( 'set', function( value, callback ) {
      bulb.brightness = value;
      bulb.log( "brightness to " + value );
      bulb.setColor();
      callback();
    } );

  lightbulbService
    .addCharacteristic( Characteristic.Hue )
    .on( 'get', function( callback ) {
      var process_get = spawn('python',[bulb.hue_path, bulb.ip, bulb.ch]);
      process_get.stdout.on('data', function (data){
        bulb.hue = data;
        bulb.log("get hue: " + parseFloat(bulb.hue));
        callback( null, parseFloat(bulb.hue));
      });
      process_get.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });
      process_get.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
      //callback( null, bulb.hue);//	del
    } )
    .on( 'set', function( value, callback ) {
      bulb.hue = value;
      bulb.log( "hue to " + value );
      bulb.setColor();
      callback();
    } );

  lightbulbService
    .addCharacteristic( Characteristic.Saturation )
    .on( 'get', function( callback ) {
      callback( null, bulb.saturation);
    } )
    .on( 'set', function( value, callback ) {
      bulb.saturation = value;
      bulb.log( "saturation to " + value );
      bulb.setColor();
      callback();
    } );

  return [ lightbulbService ];
};
