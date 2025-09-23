import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from '../planets/sun';
import { Earth } from '../planets/earth';

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

  // Para animación orbital
  private time: number = 0;

  // Guardamos referencia para actualizar posición
  private earth!: Earth;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScene();

    // Crear y agregar el Sol
    const sun = new Sun();
    sun.mesh.position.set(0, 0, 0);
    this.scene.add(sun.mesh);

    // Crear la Tierra y agregarla a la escena
    this.earth = new Earth();
    // La posición inicial la pondremos con la animación, aquí la puedes dejar en cualquier lugar
    this.earth.mesh.position.set(3, 0, 0);
    this.scene.add(this.earth.mesh);

    this.animate();
  }

  private initScene() {
    const width = this.canvasRef.nativeElement.clientWidth;
    const height = this.canvasRef.nativeElement.clientHeight;

    // Escena
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

    // Cámara
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);

    // Controles de cámara (tu control)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // suaviza movimiento
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.time += 0.01; // Incrementamos el tiempo para animación

    // Actualizar posición orbital de la Tierra
    const distance = 3; // distancia fija al Sol
    const speed = 1; // velocidad orbital, ajusta este valor para que orbite más rápido o lento
    const angle = this.time * speed;

    if (this.earth) {
      this.earth.mesh.position.set(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      );

      // Opcional: rotar la Tierra sobre su propio eje para más realismo
      this.earth.mesh.rotation.y += 0.02;
    }

    // Actualiza los controles
    this.controls.update();

    // Renderiza la escena
    this.renderer.render(this.scene, this.camera);
  };
}
