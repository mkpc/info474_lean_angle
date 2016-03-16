'use strict';
//THREE JS Implementation
Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

var renderer, scene, camera, light, ground_material, ground_geometry, ground, loader, id, render;
var created = false;
var angle = 0;

var objectLoader;
var yResult = 0;
var windowSizeFactor = 0.5;
var windowWidth = window.innerWidth * windowSizeFactor;
var windowHeight = window.innerHeight * windowSizeFactor;

function initScene() {
    //Renderer
    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize( 400, 400 );
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById( 'viewport' ).appendChild( renderer.domElement );

    //Scene
    scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));

    //Camera
    camera = new THREE.PerspectiveCamera(
        90,
        360 / 360,
        1,
        750
    );
    //camera.position.set( 30, 18, 30 );
    camera.position.set( 0, 0, 20 );
    camera.lookAt( scene.position );
    scene.add( camera );

    //Light
    light = new THREE.DirectionalLight( 0xFFFFFF );
    light.position.set( 0, 10, 30 );
    light.target.position.copy( scene.position );
    light.castShadow = true;
    light.shadowCameraLeft = -60;
    light.shadowCameraTop = -60;
    light.shadowCameraRight = 60;
    light.shadowCameraBottom = 60;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 200;
    light.shadowBias = -.0001;
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = .7;
    scene.add( light );

    //Generate
    createGround();
    render();
};

initScene();

function render() {
    id = requestAnimationFrame( render );
    if (created) {
        for (var i = scene.children.length - 1; i >= 0 ; i -- ) {
            if (scene.children[i].isMotorcycle) {
                if ((scene.children[i].rotation.y > yResult - 0.05  && scene.children[i].rotation.y < yResult + 0.05)) {
                    created = false;
                }
                scene.children[i].rotation.y = scene.children[i].rotation.y + (yResult / 120);
            }
        }
    }
    renderer.render( scene, camera );
    scene.simulate();
};

function createMotorCycle() {
    lean = calculateLeanAngle(speed, radian);
    angle = convertToDegrees(lean);
    objectLoader = new THREE.ObjectLoader();
    //yResult = (180-angle) * Math.PI / 180;;
    yResult = (angle) * Math.PI / 180;
        
    objectLoader.load("img/motor.json",function ( front ) {
        front.name = "Motorcycle";
        front.scale.x = 0.03;
        front.scale.y = 0.03;
        front.scale.z = 0.03;
        front.rotation.x = -90 * Math.PI / 180;
        front.rotation.z = -180 * Math.PI / 180;
        //front.rotation.y = (180-angle) * Math.PI / 180;
        //front.rotation.y = (angle) * Math.PI / 180
        front.position.set(0, 0, 0);
        front.isMotorcycle = true;
        scene.add( front );
        created = true;
    });
    calculateSpeedGraph(speed, radian);
    calculateRadianGraph(speed, radian);
    calculateTangentGraph();
}

function createGround() {
    loader = new THREE.TextureLoader();
    ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({map: loader.load('img/road.jpg')}),
        .8, // high friction
        .4 // low restitution
    );
    ground_geometry = new THREE.PlaneGeometry( 20, 20, 50, 50 );
    ground = new Physijs.HeightfieldMesh(
        ground_geometry,
        ground_material,
        0, // mass
        50,
        50
    );
    ground.position.set(0, -3, 0);
    ground.rotation.x = -Math.PI / 2.5;
    ground.rotation.z = Math.PI / -2;
    ground.receiveShadow = true;
    ground.name = "floor";
    scene.add( ground );
}

function calculateLeanAngle(speed, radian) {
    var friction = (Math.pow(speed, 2)) / (9.81 * radian);
    var answer = Math.atan(friction);
    return answer;
}

function convertToDegrees(radians) {
    return (radians * 180) / Math.PI
}

function convertToRadians(degree) {
    return (degree * Math.PI) / 180;
}

function convertToMeter(feet) {
    return feet * 0.3048;
}

function convertToMPS(mph) {
    return mph * 1.609344*1000/3600
}

function calculateRadianGraph(speed, radian) {
    var radianArray = [];
    for (var i = 0; i < 300; i++) {
        var radianLeanAngle = calculateLeanAngle(parseInt(speed), parseInt(i));
        var radianAngle = convertToDegrees(radianLeanAngle);
        radianArray.push(radianAngle);
    }
    $("#graph2").empty();
    console.log(radianArray);
    drawGraph(radianArray, "radian");
}

function calculateSpeedGraph(speed, radian) {
    var speedArray = [];
    for (var i = 0; i < 100; i++) {
        var speedLeanAngle = calculateLeanAngle(parseInt(i), parseInt(radian));
        var speedAngle = convertToDegrees(speedLeanAngle);
        speedArray.push(speedAngle);
    }
    $("#graph").empty();
    drawGraph(speedArray, "speed");
}

function calculateTangentGraph() {
    var frictionArray = []
    for (var i = 0; i < 90; i++) {
        var rad = convertToRadians(i);
        var friction = Math.tan(rad);
        frictionArray.push(friction);
    }
    $("#graph3").empty();
    drawGraph(frictionArray, "friction");
}

function drawGraph(data, type) {
    // define dimensions of graph
    var m = [80, 80, 80, 80]; // margins
    //var w = 1000 - m[1] - m[3]; // width
    var w = (window.innerWidth / 2) - m[1] - m[3] - m[0] - m[2] ; // width
    var h = 400 - m[0] - m[2]; // height

    var x = d3.scale.linear().domain([0, data.length]).range([0, w]);
    var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    var line = d3.svg.line()
        .x(function(d, i) {
            return x(i);
        })
        .y(function(d) {
            return y(d);
        })

    if (type == "speed") {
        var graph = d3.select("#graph").append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);

        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        graph.append("text")
            .attr("x",  w/2)
            .attr("y",  h + m[0] / 2)
            .style("text-anchor", "middle")
            .text("Speed (mph)");

        graph.append("text")
            .attr("x",  -w / 4)
            .attr("y",  -h / 4)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Lean Angle (\xB0)");

        graph.append("text")
            .attr("x",  w / 2)
            .attr("y",  0)
            .style("text-anchor", "middle")
            .text("Speed vs Lean Angle");

        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
        graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);

        graph.append("svg:path").attr("d", line(data));
    } else if (type == "radian") {
         var graph = d3.select("#graph2").append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);

        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        graph.append("text")
            .attr("x",  w / 2)
            .attr("y",  h + m[0] / 2)
            .style("text-anchor", "middle")
            .text("Turn Radius (m)");

        graph.append("text")
            .attr("x",  -w / 4)
            .attr("y",  -h / 4)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Lean Angle (\xB0)");

        graph.append("text")
            .attr("x",  w / 2)
            .attr("y",  0)
            .style("text-anchor", "middle")
            .text("Turn Radius vs Lean Angle");

        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
        graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);

        graph.append("svg:path").attr("d", line(data));
    } else if (type == "friction") {
         var graph = d3.select("#graph3").append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);

        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        graph.append("text")
            .attr("x",  w / 2)
            .attr("y",  h + m[0] / 2)
            .style("text-anchor", "middle")
            .text("Lean Angle (\xB0)");

        graph.append("text")
            .attr("x",  -w / 4)
            .attr("y",  -h / 4)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Friction");

        graph.append("text")
            .attr("x",  w / 2)
            .attr("y",  0)
            .style("text-anchor", "middle")
            .text("Friction vs Lean Angle");

        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
        graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);

        graph.append("svg:path").attr("d", line(data));
    }
}

function removeEntity() {
    for (var i = scene.children.length - 1; i >= 0 ; i -- ) {
        var obj = scene.children[ i ];
        if (obj.isMotorcycle) {
            scene.remove(obj);
        }
    }
}

$("#search").click(function() {
    removeEntity();
    createMotorCycle();
    created = true;
});


