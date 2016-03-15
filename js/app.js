'use strict';

var leanAngle;
var speed = 0;
var lean = 0;
var radian = 0;
var needToLean = false;

$('#spd').slider({
    tooltip:"hide",
    value:50
});
$('#rad').slider({
    tooltip:"hide",
    value:100
});

var g = new JustGage({
    id: "gauge",
    value: 50,
    min: 0,
    max: 200,
    title: "",
    label: "",
    shadowSize: 0.5,
    hideValue:true,
    customSectors: [{
        //color : "#FFFFFF",
        color : "rgba(240,95,64,.9)",
        lo : 0,
        hi : 200
    }],
    levelColorsGradient: true,
    titleFontColor:"#FFFFFF",
    titleFontFamily: "Sniglet",
    valueFontColor:"#ffffff",
    valueFontFamily:"Sniglet"
});



var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
    $scope.total =function(){
        $('#spd').slider('setValue', parseInt($scope.speedMPH));
        $('#rad').slider('setValue', parseInt($scope.radianFeet));
        if(parseInt($scope.speedMPH)<=200 && parseInt($scope.speedMPH)>=0){
            g.refresh(parseInt($scope.speedMPH));
        }

        speed = convertToMPS(parseFloat($scope.speedMPH));
        radian = convertToMeter(parseFloat($scope.radianFeet));

        leanAngle = (Math.atan((Math.pow(speed ,2)/(9.8*radian)))* 180 / Math.PI).toFixed(2);
        return leanAngle ;
    };
    $scope.func=function(feet, speed){
        $scope.radianFeet = feet;
        $scope.speedMPH = speed;
    };
    $scope.radianSvg =function() {
        return parseInt($scope.radianFeet/10);
    };


});

$('area').each(function()
{
    $(this).qtip(
        {
            content: {text: "<div class='qtip-titlebar'>"+this.alt+"</div><div class='qtip-content ui-widget-content' aria-atomic='true'><img class='qitp-Image' src=img/" + this.id + ".png></div>"},
            style: {
                classes: 'qtip-bootstrap',
                width: 400,
                height: 400
            },
            position: {
                my: 'right bottom',
                at: 'bottom left',
                target: $(this)
            },

        });
});

