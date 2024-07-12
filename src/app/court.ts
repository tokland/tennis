import * as THREE from "three";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ball, Game } from "../domain/entities";

type GameItems = {
    ball: THREE.Mesh;
};

export class GameRenderer {
    private game: Game;
    private items: GameItems;

    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;

    constructor(initialGame: Game) {
        this.game = initialGame;
        const scene = new THREE.Scene();
        this.scene = scene;

        const renderer = new THREE.WebGLRenderer();
        this.renderer = renderer;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        this.camera = this.addCamera();
        this.addLight();
        this.addCourt(this.game);
        const ball = this.addBall(this.game.ball);

        this.items = { ball: ball };
    }

    initRenderLoop() {
        const { renderer, scene, camera, items } = this;

        let lastTime: number | undefined;
        let game = this.game;

        function animate(currentTime: number) {
            if (lastTime === undefined) lastTime = currentTime;
            const elapsed = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            renderer.render(scene, camera);

            game = game.update(elapsed);

            const ballPos = game.ball.position;
            items.ball.position.set(ballPos.x, ballPos.z, -ballPos.y);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    addCamera() {
        const camera = new THREE.PerspectiveCamera(80, 1, 0.1);
        camera.position.set(0, 8, 5);
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
    const gameRendered = new GameRenderer(initialGame);
    gameRendered.initRenderLoop();
}
