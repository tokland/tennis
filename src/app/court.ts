import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function createTennisCourt() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Tennis court dimensions
  const courtWidth = 8.23; // meters
  const courtLength = 23.77; // meters
  const courtHeight = 0.1; // thickness of the court

  // Create court base
  const courtGeometry = new THREE.BoxGeometry(
    courtWidth,
    courtHeight,
    courtLength
  );
  const courtMaterial = new THREE.MeshStandardMaterial({ color: 0x008000 });
  const courtMesh = new THREE.Mesh(courtGeometry, courtMaterial);
  courtMesh.position.y = -courtHeight / 2;
  courtMesh.receiveShadow = true;
  scene.add(courtMesh);

  // Create net
  const netHeight = 0.914; // meters
  const netWidth = courtWidth;
  const netThickness = 0.02; // meters

  const netGeometry = new THREE.BoxGeometry(netWidth, netHeight, netThickness);
  const netMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const netMesh = new THREE.Mesh(netGeometry, netMaterial);
  netMesh.position.y = netHeight / 2;
  netMesh.position.z = 0;
  scene.add(netMesh);

  // Add court lines (simplified)
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

  // Create a ball and add it to the scene
  const ballRadius = 0.1; // Tennis ball radius in meters
  const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
  const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Yellow tennis ball
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
  ballMesh.position.set(0, 3, 3); // Position the ball at (x=2, y=3, z=1)
  ballMesh.castShadow = true;
  scene.add(ballMesh);

  // Add a light source to cast shadows
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 0);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  scene.add(light);

  // Configure shadow properties for the light
  light.shadow.mapSize.width = 512; // Shadow map resolution
  light.shadow.mapSize.height = 512;
  light.shadow.camera.near = 0.5; // Near clipping plane
  light.shadow.camera.far = 50; // Far clipping plane

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);

  // Render loop
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
