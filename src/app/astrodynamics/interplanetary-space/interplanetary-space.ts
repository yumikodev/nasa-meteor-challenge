import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { createPlanetLabel } from '../../shared/helpers/label.helper';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from '../celestial-bodies/sun';
import { Mercury } from '../planets/mercury';
import { Venus } from '../planets/venus';
import { Earth } from '../planets/earth';
import { Moon } from '../celestial-bodies/moon';
import { Mars } from '../planets/mars';
import { createHighlightCircle } from '../../shared/helpers/highlight.helper';

@Component({
  selector: 'app-interplanetary-space',
  templateUrl: './interplanetary-space.html',
  styleUrls: ['./interplanetary-space.css'],
  standalone: true,
})
export class InterplanetarySpaceComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;

  public scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  private time: number = 0;

  // Planets
  private mercury!: Mercury;
  private venus!: Venus;
  private earth!: Earth;
  private mars!: Mars;
  private moon!: Moon;

  // Labels
  private sunLabel!: THREE.Sprite;
  private mercuryLabel!: THREE.Sprite;
  private venusLabel!: THREE.Sprite;
  private earthLabel!: THREE.Sprite;
  private moonLabel!: THREE.Sprite;
  private marsLabel!: THREE.Sprite;

  // Highlights (corrected type)
  private mercuryHighlight!: THREE.Mesh;
  private venusHighlight!: THREE.Mesh;
  private earthHighlight!: THREE.Mesh;
  private moonHighlight!: THREE.Mesh;
  private marsHighlight!: THREE.Mesh;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScene();

    // Sun
    const sun = new Sun();
    sun.mesh.position.set(0, 0, 0);
    this.scene.add(sun.mesh);

    this.sunLabel = createPlanetLabel('Sun');
    this.sunLabel.position.set(0, 10, 0);
    this.scene.add(this.sunLabel);

    // Mercury
    this.mercury = new Mercury();
    this.mercury.mesh.position.set(this.mercury.orbitRadius, 0, 0);
    this.scene.add(this.mercury.mesh);
    this.scene.add(this.mercury.orbit());

    this.mercuryLabel = createPlanetLabel('Mercury');
    this.mercuryLabel.position.set(this.mercury.orbitRadius, 10, 0);
    this.scene.add(this.mercuryLabel);

    this.mercuryHighlight = createHighlightCircle(this.mercury.radius * 3, 0xffcc00);
    this.mercuryHighlight.position.copy(this.mercury.mesh.position);
    this.scene.add(this.mercuryHighlight);

    // Venus
    this.venus = new Venus();
    this.venus.mesh.position.set(this.venus.orbitRadius, 0, 0);
    this.scene.add(this.venus.mesh);
    this.scene.add(this.venus.orbit());

    this.venusLabel = createPlanetLabel('Venus');
    this.venusLabel.position.set(this.venus.orbitRadius, 10, 0);
    this.scene.add(this.venusLabel);

    this.venusHighlight = createHighlightCircle(this.venus.radius * 3, 0xffa500);
    this.venusHighlight.position.copy(this.venus.mesh.position);
    this.scene.add(this.venusHighlight);

    // Earth
    this.earth = new Earth();
    this.earth.mesh.position.set(this.earth.orbitRadius, 0, 0);
    this.scene.add(this.earth.mesh);
    this.scene.add(this.earth.orbit());

    this.earthLabel = createPlanetLabel('Earth');
    this.earthLabel.position.set(this.earth.orbitRadius, 10, 0);
    this.scene.add(this.earthLabel);

    this.earthHighlight = createHighlightCircle(this.earth.radius * 3, 0x00ccff);
    this.earthHighlight.position.copy(this.earth.mesh.position);
    this.scene.add(this.earthHighlight);

    // Moon
    this.moon = new Moon();
    this.moon.mesh.position.set(1, 0, 0);
    this.scene.add(this.moon.mesh);

    this.moonLabel = createPlanetLabel('Moon');
    this.moonLabel.position.set(this.moon.mesh.position.x, 5, this.moon.mesh.position.z);
    this.scene.add(this.moonLabel);

    this.moonHighlight = createHighlightCircle(this.moon.radius * 4, 0xffffff);
    this.moonHighlight.position.copy(this.moon.mesh.position);
    this.scene.add(this.moonHighlight);

    // Mars
    this.mars = new Mars();
    this.mars.mesh.position.set(this.mars.orbitRadius, 0, 0);
    this.scene.add(this.mars.mesh);
    this.scene.add(this.mars.orbit());

    this.marsLabel = createPlanetLabel('Mars');
    this.marsLabel.position.set(this.mars.orbitRadius, 10, 0);
    this.scene.add(this.marsLabel);

    this.marsHighlight = createHighlightCircle(this.mars.radius * 3, 0xff4500);
    this.marsHighlight.position.copy(this.mars.mesh.position);
    this.scene.add(this.marsHighlight);

    this.animate();
  }

  private initScene() {
    const width = this.canvasRef.nativeElement.clientWidth;
    const height = this.canvasRef.nativeElement.clientHeight;

    this.scene = new THREE.Scene();

    const loader = new THREE.TextureLoader();
    loader
      .loadAsync('/images/interplanetary-space.jpg')
      .then((texture) => {
        this.scene.background = texture;
      })
      .catch(() => {
        this.scene.background = new THREE.Color(0x000000);
      });

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.time += 0.01;

    // Mercury
    if (this.mercury) {
      const angle = this.time * 0.02;
      this.mercury.mesh.position.set(
        Math.cos(angle) * this.mercury.orbitRadius,
        0,
        Math.sin(angle) * this.mercury.orbitRadius
      );
      this.mercury.mesh.rotation.y += 0.01;

      this.mercuryHighlight.position.copy(this.mercury.mesh.position);
    }

    if (this.mercuryLabel && this.mercury) {
      this.mercuryLabel.position.set(
        this.mercury.mesh.position.x,
        10,
        this.mercury.mesh.position.z
      );
    }

    // Venus
    if (this.venus) {
      const angle = this.time * 0.015;
      this.venus.mesh.position.set(
        Math.cos(angle) * this.venus.orbitRadius,
        0,
        Math.sin(angle) * this.venus.orbitRadius
      );
      this.venus.mesh.rotation.y += 0.008;

      this.venusHighlight.position.copy(this.venus.mesh.position);
    }

    if (this.venusLabel && this.venus) {
      this.venusLabel.position.set(
        this.venus.mesh.position.x,
        10,
        this.venus.mesh.position.z
      );
    }

    // Earth
    const earthSpeed = 0.01;
    const earthAngle = this.time * earthSpeed;

    if (this.earth) {
      this.earth.mesh.position.set(
        Math.cos(earthAngle) * this.earth.orbitRadius,
        0,
        Math.sin(earthAngle) * this.earth.orbitRadius
      );
      this.earth.mesh.rotation.y += 0.02;

      this.earthHighlight.position.copy(this.earth.mesh.position);
    }

    if (this.earthLabel && this.earth) {
      this.earthLabel.position.set(
        this.earth.mesh.position.x,
        10,
        this.earth.mesh.position.z
      );
    }

    // Moon (relative to Earth)
    if (this.moon && this.earth) {
      const moonDistance = this.moon.orbitRadius;
      const moonSpeed = earthSpeed * (365 / 27.3);
      const moonAngle = this.time * moonSpeed;

      this.moon.mesh.position.set(
        this.earth.mesh.position.x + Math.cos(moonAngle) * moonDistance,
        0,
        this.earth.mesh.position.z + Math.sin(moonAngle) * moonDistance
      );
      this.moon.mesh.rotation.y = moonAngle;

      this.moonHighlight.position.copy(this.moon.mesh.position);
    }

    if (this.moonLabel && this.moon) {
      this.moonLabel.position.set(
        this.moon.mesh.position.x,
        5,
        this.moon.mesh.position.z
      );
    }

    // Mars
    if (this.mars) {
      const angle = this.time * 0.008;
      this.mars.mesh.position.set(
        Math.cos(angle) * this.mars.orbitRadius,
        0,
        Math.sin(angle) * this.mars.orbitRadius
      );
      this.mars.mesh.rotation.y += 0.015;

      this.marsHighlight.position.copy(this.mars.mesh.position);
    }

    if (this.marsLabel && this.mars) {
      this.marsLabel.position.set(
        this.mars.mesh.position.x,
        10,
        this.mars.mesh.position.z
      );
    }

    // Sun label fixed position
    if (this.sunLabel) {
      this.sunLabel.position.set(0, 10, 0);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
