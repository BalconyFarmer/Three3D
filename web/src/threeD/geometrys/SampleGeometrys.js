export class SampleGeometrys {
    constructor(app) {
        this.app = app
        this.nameList = []
        this.initName()

    }

    BoxBufferGeometry() {
        var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    }

    BoxGeometry() {
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    }

    CircleBufferGeometry() {
        var geometry = new THREE.CircleBufferGeometry(5, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var circle = new THREE.Mesh(geometry, material);
        scene.add(circle);
    }

    CircleGeometry() {
        var geometry = new THREE.CircleGeometry(5, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var circle = new THREE.Mesh(geometry, material);
        scene.add(circle);
    }

    ConeBufferGeometry() {
        var geometry = new THREE.ConeBufferGeometry(5, 20, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var cone = new THREE.Mesh(geometry, material);
        scene.add(cone);
    }

    ConeGeometry() {
        var geometry = new THREE.ConeGeometry(5, 20, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var cone = new THREE.Mesh(geometry, material);
        scene.add(cone);
    }

    CylinderBufferGeometry() {
        var geometry = new THREE.CylinderBufferGeometry(5, 5, 20, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var cylinder = new THREE.Mesh(geometry, material);
        scene.add(cylinder);
    }

    CylinderGeometry() {
        var geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var cylinder = new THREE.Mesh(geometry, material);
        scene.add(cylinder);
    }

    DodecahedronBufferGeometry() {

    }

    DodecahedronGeometry() {

    }

    EdgesGeometry() {
        var geometry = new THREE.BoxBufferGeometry(100, 100, 100);
        var edges = new THREE.EdgesGeometry(geometry);
        var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xffffff}));
        scene.add(line);
    }

    ExtrudeBufferGeometry() {
        var length = 12, width = 8;

        var shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, width);
        shape.lineTo(length, width);
        shape.lineTo(length, 0);
        shape.lineTo(0, 0);

        var extrudeSettings = {
            steps: 2,
            depth: 16,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1
        };

        var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    ExtrudeGeometry() {
        var length = 12, width = 8;

        var shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, width);
        shape.lineTo(length, width);
        shape.lineTo(length, 0);
        shape.lineTo(0, 0);

        var extrudeSettings = {
            steps: 2,
            depth: 16,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1
        };

        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    IcosahedronBufferGeometry() {

    }

    IcosahedronGeometry() {

    }

    LatheBufferGeometry() {
        var points = [];
        for (var i = 0; i < 10; i++) {
            points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
        }
        var geometry = new THREE.LatheBufferGeometry(points);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var lathe = new THREE.Mesh(geometry, material);
        scene.add(lathe);
    }

    LatheGeometry() {
        var points = [];
        for (var i = 0; i < 10; i++) {
            points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
        }
        var geometry = new THREE.LatheGeometry(points);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var lathe = new THREE.Mesh(geometry, material);
        scene.add(lathe);
    }

    OctahedronBufferGeometry() {

    }

    OctahedronGeometry() {

    }

    ParametricBufferGeometry() {
        var geometry = new THREE.ParametricBufferGeometry(THREE.ParametricGeometries.klein, 25, 25);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var klein = new THREE.Mesh(geometry, material);
        scene.add(klein);
    }

    ParametricGeometry() {
        var geometry = new THREE.ParametricGeometry(THREE.ParametricGeometries.klein, 25, 25);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var klein = new THREE.Mesh(geometry, material);
        scene.add(klein);
    }

    PlaneBufferGeometry() {
        var geometry = new THREE.PlaneBufferGeometry(5, 20, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
        var plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
    }

    PlaneGeometry() {
        var geometry = new THREE.PlaneGeometry(5, 20, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
        var plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
    }

    PolyhedronBufferGeometry() {
        var verticesOfCube = [
            -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
            -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
        ];

        var indicesOfFaces = [
            2, 1, 0, 0, 3, 2,
            0, 4, 7, 7, 3, 0,
            0, 1, 5, 5, 4, 0,
            1, 2, 6, 6, 5, 1,
            2, 3, 7, 7, 6, 2,
            4, 5, 6, 6, 7, 4
        ];

        var geometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, 6, 2);
    }

    PolyhedronGeometry() {
        var verticesOfCube = [
            -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
            -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
        ];

        var indicesOfFaces = [
            2, 1, 0, 0, 3, 2,
            0, 4, 7, 7, 3, 0,
            0, 1, 5, 5, 4, 0,
            1, 2, 6, 6, 5, 1,
            2, 3, 7, 7, 6, 2,
            4, 5, 6, 6, 7, 4
        ];

        var geometry = new THREE.PolyhedronGeometry(verticesOfCube, indicesOfFaces, 6, 2);
    }

    RingBufferGeometry() {
        var geometry = new THREE.RingBufferGeometry(1, 5, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    RingGeometry() {
        var geometry = new THREE.RingGeometry(1, 5, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    ShapeBufferGeometry() {
        var x = 0, y = 0;

        var heartShape = new THREE.Shape();

        heartShape.moveTo(x + 5, y + 5);
        heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
        heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
        heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
        heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
        heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
        heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

        var geometry = new THREE.ShapeBufferGeometry(heartShape);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    ShapeGeometry() {
        var x = 0, y = 0;

        var heartShape = new THREE.Shape();

        heartShape.moveTo(x + 5, y + 5);
        heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
        heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
        heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
        heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
        heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
        heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

        var geometry = new THREE.ShapeGeometry(heartShape);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    SphereBufferGeometry() {
        var geometry = new THREE.SphereBufferGeometry(5, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
    }

    SphereGeometry() {
        var geometry = new THREE.SphereGeometry(5, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
    }

    TetrahedronBufferGeometry() {

    }

    TetrahedronGeometry() {

    }

    TextBufferGeometry() {
        var loader = new THREE.FontLoader();

        loader.load('fonts/helvetiker_regular.typeface.json', function (font) {

            var geometry = new THREE.TextBufferGeometry('Hello three.js!', {
                font: font,
                size: 80,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5
            });
        });
    }

    TextGeometry() {
        var loader = new THREE.FontLoader();

        loader.load('fonts/helvetiker_regular.typeface.json', function (font) {

            var geometry = new THREE.TextGeometry('Hello three.js!', {
                font: font,
                size: 80,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5
            });
        });
    }

    TorusBufferGeometry() {
        var geometry = new THREE.TorusBufferGeometry(10, 3, 16, 100);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var torus = new THREE.Mesh(geometry, material);
        scene.add(torus);
    }

    TorusGeometry() {
        var geometry = new THREE.TorusGeometry(10, 3, 16, 100);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var torus = new THREE.Mesh(geometry, material);
        scene.add(torus);
    }

    TorusKnotBufferGeometry() {
        var geometry = new THREE.TorusKnotBufferGeometry(10, 3, 100, 16);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var torusKnot = new THREE.Mesh(geometry, material);
        scene.add(torusKnot);
    }

    TorusKnotGeometry() {
        var geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
        var material = new THREE.MeshBasicMaterial({color: 0xffff00});
        var torusKnot = new THREE.Mesh(geometry, material);
        scene.add(torusKnot);
    }

    TubeBufferGeometry() {
        function CustomSinCurve(scale) {

            THREE.Curve.call(this);

            this.scale = (scale === undefined) ? 1 : scale;

        }

        CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
        CustomSinCurve.prototype.constructor = CustomSinCurve;

        CustomSinCurve.prototype.getPoint = function (t) {

            var tx = t * 3 - 1.5;
            var ty = Math.sin(2 * Math.PI * t);
            var tz = 0;

            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

        };

        var path = new CustomSinCurve(10);
        var geometry = new THREE.TubeBufferGeometry(path, 20, 2, 8, false);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    TubeGeometry() {
        function CustomSinCurve(scale) {

            THREE.Curve.call(this);

            this.scale = (scale === undefined) ? 1 : scale;

        }

        CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
        CustomSinCurve.prototype.constructor = CustomSinCurve;

        CustomSinCurve.prototype.getPoint = function (t) {

            var tx = t * 3 - 1.5;
            var ty = Math.sin(2 * Math.PI * t);
            var tz = 0;

            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

        };

        var path = new CustomSinCurve(10);
        var geometry = new THREE.TubeGeometry(path, 20, 2, 8, false);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    WireframeGeometry() {
        var geometry = new THREE.SphereBufferGeometry(100, 100, 100);

        var wireframe = new THREE.WireframeGeometry(geometry);

        var line = new THREE.LineSegments(wireframe);
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        scene.add(line);
    }

    BufferGeometryLoader() {
        // instantiate a loader
        var loader = new THREE.BufferGeometryLoader();

        // load a resource
        loader.load(
            // resource URL
            'models/json/pressure.json',

            // onLoad callback
            function (geometry) {
                var material = new THREE.MeshLambertMaterial({color: 0xF5F5F5});
                var object = new THREE.Mesh(geometry, material);
                scene.add(object);
            },

            // onProgress callback
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },

            // onError callback
            function (err) {
                console.log('An error happened');
            }
        );
    }

    initName() {
        this.nameList = [
            'BoxBufferGeometry',
            'BoxGeometry',
            'CircleBufferGeometry',
            'CircleGeometry',
            'ConeBufferGeometry',
            'ConeGeometry',
            'CylinderBufferGeometry',
            'CylinderGeometry',
            'DodecahedronBufferGeometry',
            'DodecahedronGeometry',
            'EdgesGeometry',
            'ExtrudeBufferGeometry',
            'ExtrudeGeometry',
            'IcosahedronBufferGeometry',
            'IcosahedronGeometry',
            'LatheBufferGeometry',
            'LatheGeometry',
            'OctahedronBufferGeometry',
            'OctahedronGeometry',
            'ParametricBufferGeometry',
            'ParametricGeometry',
            'PlaneBufferGeometry',
            'PlaneGeometry',
            'PolyhedronBufferGeometry',
            'PolyhedronGeometry',
            'RingBufferGeometry',
            'RingGeometry',
            'ShapeBufferGeometry',
            'ShapeGeometry',
            'SphereBufferGeometry',
            'SphereGeometry',
            'TetrahedronBufferGeometry',
            'TetrahedronGeometry',
            'TextBufferGeometry',
            'TextGeometry',
            'TorusBufferGeometry',
            'TorusGeometry',
            'TorusKnotBufferGeometry',
            'TorusKnotGeometry',
            'TubeBufferGeometry',
            'TubeGeometry',
            'WireframeGeometry'
        ]
    }

}
