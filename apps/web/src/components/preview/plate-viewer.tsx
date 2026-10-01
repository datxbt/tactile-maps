"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { previewContent } from "@/data/content";

type PlateViewerProps = {
  // URL of the STL to show; change it to reload.
  src: string;
};

// A three.js scene showing the STL the backend generated: exactly the file
// you download. Drag to rotate, scroll to zoom, right-drag to pan.
export function PlateViewer({ src }: PlateViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Which src has finished loading (or failed), so a new src shows "loading".
  const [loaded, setLoaded] = useState<{ src: string; error: string | null } | null>(null);
  const loading = loaded?.src !== src;
  const error = loading ? null : loaded.error;

  useEffect(() => {
    const container = containerRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fafaf9");
    scene.add(new THREE.HemisphereLight("#ffffff", "#57534e", 1.2));
    const sun = new THREE.DirectionalLight("#ffffff", 3);
    // Low side light makes the raised relief cast visible shading.
    sun.position.set(-120, 160, 80);
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(35, 1, 1, 2000);
    camera.position.set(0, 260, 220);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let mesh: THREE.Mesh | null = null;
    new STLLoader().load(
      src,
      (geometry) => {
        geometry.computeVertexNormals();
        geometry.center();
        mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ color: "#d6d3d1", roughness: 0.8, flatShading: true })
        );
        // STL is z-up; three.js is y-up. Lay the plate flat.
        mesh.rotation.x = -Math.PI / 2;
        scene.add(mesh);
        setLoaded({ src, error: null });
      },
      undefined,
      () => {
        setLoaded({ src, error: previewContent.loadError });
      }
    );

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      mesh?.geometry.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [src]);

  return (
    <div
      aria-label={previewContent.viewerLabel}
      className="relative aspect-square w-full overflow-hidden rounded-lg border"
      ref={containerRef}
      role="img"
    >
      {(loading || error) && (
        <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          {error ?? previewContent.loading}
        </p>
      )}
    </div>
  );
}
