import {
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  Clock,
  DirectionalLight,
  Light,
} from "three";

import { Brick } from "./brick";

export class App {
  private timer = new Clock();
  private scene = new Scene();
  private camera = new PerspectiveCamera(
    45,
    innerWidth / innerHeight,
    0.1,
    10000
  );
  private renderer = new WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("main-canvas") as HTMLCanvasElement,
  });

  private brick: Brick;
  private brick2: Brick;
  private brick3: Brick;
  private light: Light;

  constructor() {
    this.brick = new Brick(40, new Color("rgb(255, 0, 0)"));
    this.brick.position.x = -60;

    this.brick2 = new Brick(40, new Color("rgb(0,255,0)"));
    this.brick2.position.x = 0;

    this.brick3 = new Brick(40, new Color("rgb(0,0,255)"));
    this.brick3.position.x = 60;

    this.scene.add(this.brick);
    this.scene.add(this.brick2);
    this.scene.add(this.brick3);

    this.light = this.getLight();
    this.scene.add(this.light);

    this.camera.position.set(0, 50, 200);
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(new Color("rgb(0,0,0)"));

    this.render();
  }

  private getLight() {
    const color = "#ABC";
    const intensity = 1;
    const light = new DirectionalLight(color, intensity);
    light.position.set(0, 50, 200);
    return light;
  }

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private render() {
    const delta = this.timer.getDelta();
    this.renderer.render(this.scene, this.camera);
    this.adjustCanvasSize();
    this.brick.rotateY(0.5 * delta);
    this.brick2.rotateX(-0.5 * delta);
    this.brick3.rotateY(-0.5 * delta);
    requestAnimationFrame(() => this.render());
  }
}
