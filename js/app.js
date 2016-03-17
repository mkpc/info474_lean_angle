'use strict';

var leanAngle;
var speed = 0;
var lean = 0;
var radian = 0;
var needToLean = false;
var friction;

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
        calculateSpeedGraph($scope.speedMPH, $scope.radianFeet);
        calculateRadianGraph($scope.speedMPH, $scope.radianFeet);
        calculateTangentGraph();

        speed = convertToMPS(parseFloat($scope.speedMPH));
        radian = convertToMeter(parseFloat($scope.radianFeet));
        $scope.frictionNumber = ((Math.pow(speed, 2)) / (9.81 * radian)).toFixed(2);
        leanAngle = (Math.atan((Math.pow(speed ,2)/(9.8*radian)))* 180 / Math.PI).toFixed(2);
        return leanAngle ;
    };
    $scope.func=function(feet, speed){
        $scope.radianFeet = feet;
        $scope.speedMPH = speed;
        $scope.frictionNumber = ((Math.pow(convertToMPS(speed)), 2) / (9.81 * convertToMeter(feet))).toFixed(2);
    };
    $scope.radianSvg =function() {
        return parseInt($scope.radianFeet/10);
    };
    
    $scope.modalTitle = function(){
        var title = leanAngle > 64 ?"Oh no! It will creash..." : "Yay, it can make the turn!!";
        return title;
    }
    $scope.message = function(){
        var message = "According to MotoGP, the top motorcycle competition in the world, the record of the maximum lean angle that we can lean is about 64 degree. Your lean angle is ";
        message += leanAngle + (leanAngle > 64 ?" exceeded the maximum lean angle, so you will be about going to crushed..." : " less than the maximum lean angle, which means you make the turn no problem.");
        return message;
    }

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
                my: 'bottom center',
                at: 'top center',
                target: $(this)
            },

        });
});
