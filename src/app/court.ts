import * as THREE from "three";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ball, Game } from "../domain/entities";

type GameItems = {
    ball: THREE.Mesh;
};

export class GameRenderer {
    constructor(private scene: THREE.Scene) {}

    static loop(initialGame: Game) {
        const scene = new THREE.Scene();

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        const gameR = new GameRenderer(scene);
        const camera = this.createCamera();
        const items = gameR.render(initialGame);
        gameR.initRenderLoop(initialGame, renderer, scene, camera, items);
    }

    render(game: Game): GameItems {
        this.addLight();
        this.addCourt(game);
        const ball = this.addBall(game.ball);

        return { ball: ball };
    }

    initRenderLoop(
        initialGame: Game,
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        items: GameItems
    ) {
        let startTime: number | undefined;
        let lastTime: number | undefined;
        let game = initialGame;

        function animate(currentTime: number) {
            if (startTime === undefined) startTime = currentTime;
            const elapsed = lastTime ? (currentTime - lastTime) / 1000 : 0;
            lastTime = currentTime;

            renderer.render(scene, camera);

            const timestamp = (currentTime - startTime) / 1000;
            game = game.update(elapsed);

            const ballPos = game.ball.position;
            items.ball.position.set(ballPos.x, ballPos.z, -ballPos.y);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    static createCamera() {
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 5);
        camera.lookAt(0, 0, 0);
        return camera;
    }

    addCourt(game: Game) {
        const { scene } = this;
        const courtWidth = 8.23;
        const courtLength = 23.77;
        const courtHeight = 0.1;

        const courtGeometry = new THREE.BoxGeometry(
            courtWidth,
            courtHeight,
            courtLength
        );
        const courtMaterial = new THREE.MeshStandardMaterial({
            color: 0x008000,
        });
        const courtMesh = new THREE.Mesh(courtGeometry, courtMaterial);
        courtMesh.position.y = -courtHeight / 2;
        courtMesh.receiveShadow = true;
        scene.add(courtMesh);

        const netHeight = game.court.netHeight;
        const netWidth = courtWidth;
        const netThickness = 0.02;

        const netGeometry = new THREE.BoxGeometry(
            netWidth,
            netHeight,
            netThickness
        );
        const netMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const netMesh = new THREE.Mesh(netGeometry, netMaterial);
        netMesh.position.y = netHeight / 2;
        netMesh.position.z = 0;
        scene.add(netMesh);

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-courtWidth / 2, 0, courtLength / 2),
            new THREE.Vector3(courtWidth / 2, 0, courtLength / 2),
            new THREE.Vector3(courtWidth / 2, 0, -courtLength / 2),
            new THREE.Vector3(-courtWidth / 2, 0, -courtLength / 2),
            new THREE.Vector3(-courtWidth / 2, 0, courtLength / 2),
        ]);

        const courtLines = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(courtLines);
    }

    addBall(ball: Ball): THREE.Mesh {
        const ballRadius = ball.radius;
        const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
        });
        const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
        const ballPos = ball.position;
        ballMesh.position.set(ballPos.x, ballPos.z, -ballPos.y);
        ballMesh.castShadow = true;
        this.scene.add(ballMesh);

        return ballMesh;
    }

    addLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1);

        light.position.set(0, 10, 0);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;

        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 50;

        this.scene.add(light);

        return light;
    }
}

export function createTennisCourt() {
    const initialGame = Game.create();
    GameRenderer.loop(initialGame);
}
