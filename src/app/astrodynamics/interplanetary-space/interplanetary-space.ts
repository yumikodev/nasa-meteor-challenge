import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from '../sun/sun';
import { Earth } from './earth'

@Component({
  selector: 'app-interplanetary-space',
  templateUrl: './interplanetary-space.html',
  styleUrls: ['./interplanetary-space.css'],
  standalone: true
})
export class InterplanetarySpaceComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;

  public scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScene();

    // Crear y agregar el Sol
    const sun = new Sun();
    sun.mesh.position.set(0, 0, 0);
    this.scene.add(sun.mesh);

    // Crear y agregar el cubo fijo
    const earth = new Earth();
    earth.mesh.position.set(3, 0, 0);
    this.scene.add(earth.mesh);

    this.animate();
  }

  private initScene() {
    const width = this.canvasRef.nativeElement.clientWidth;
    const height = this.canvasRef.nativeElement.clientHeight;

    // Escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

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

    // Actualiza los controles
    this.controls.update();

    // Renderiza la escena
    this.renderer.render(this.scene, this.camera);
  }
}
