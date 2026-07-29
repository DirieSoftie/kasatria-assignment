"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { Easing, Group, Tween } from "@tweenjs/tween.js";
import type { Person } from "@/lib/people";

type Layout = "table" | "sphere" | "helix" | "grid" | "tetra";

function tileColor(netWorth: number): string {
  if (netWorth > 200_000) return "40,180,80"; // green
  if (netWorth > 100_000) return "230,140,30"; // orange
  return "210,50,50"; // red
}

export default function PeriodicTable({ people }: { people: Person[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<((layout: Layout, duration?: number) => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.z = 3000;

    const scene = new THREE.Scene();

    const objects: CSS3DObject[] = [];
    const targets: Record<Layout, THREE.Object3D[]> = {
      table: [],
      sphere: [],
      helix: [],
      grid: [],
      tetra: [],
    };

    for (let i = 0; i < people.length; i++) {
      const person = people[i];

      const element = document.createElement("div");
      element.className = "element";
      const rgb = tileColor(person.netWorth);
      const alpha = Math.random() * 0.5 + 0.35;
      element.style.setProperty("--tile-color", rgb);
      element.style.backgroundColor = `rgba(${rgb},${alpha})`;

      const country = document.createElement("div");
      country.className = "country";
      country.textContent = person.country;
      element.appendChild(country);

      const age = document.createElement("div");
      age.className = "number";
      age.textContent = String(person.age);
      element.appendChild(age);

      const symbol = document.createElement("div");
      symbol.className = "symbol";
      const img = document.createElement("img");
      img.src = person.photo;
      img.alt = person.name;
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      symbol.appendChild(img);
      element.appendChild(symbol);

      const details = document.createElement("div");
      details.className = "details";
      const nameEl = document.createElement("div");
      nameEl.className = "name";
      nameEl.textContent = person.name;
      details.appendChild(nameEl);
      const metaEl = document.createElement("div");
      metaEl.className = "meta";
      metaEl.textContent = person.interest;
      details.appendChild(metaEl);
      element.appendChild(details);

      const objectCSS = new CSS3DObject(element);
      objectCSS.position.x = Math.random() * 4000 - 2000;
      objectCSS.position.y = Math.random() * 4000 - 2000;
      objectCSS.position.z = Math.random() * 4000 - 2000;
      scene.add(objectCSS);
      objects.push(objectCSS);

      const col = i % 20;
      const row = Math.floor(i / 20);
      const tableTarget = new THREE.Object3D();
      tableTarget.position.x = col * 140 - 1330;
      tableTarget.position.y = -row * 180 + 810;
      targets.table.push(tableTarget);
    }

    const vector = new THREE.Vector3();
    for (let i = 0, l = objects.length; i < l; i++) {
      const phi = Math.acos(-1 + (2 * i) / l);
      const theta = Math.sqrt(l * Math.PI) * phi;

      const sphereTarget = new THREE.Object3D();
      sphereTarget.position.setFromSphericalCoords(800, phi, theta);
      vector.copy(sphereTarget.position).multiplyScalar(2);
      sphereTarget.lookAt(vector);
      targets.sphere.push(sphereTarget);

      const half = Math.ceil(l / 2);
      const strand = i < half ? 0 : 1;
      const k = i < half ? i : i - half;
      const helixTarget = new THREE.Object3D();
      helixTarget.position.setFromCylindricalCoords(
        900,
        k * 0.30 + strand * Math.PI + Math.PI,
        -k * 20 + 990,
      );
      vector.x = helixTarget.position.x * 2;
      vector.y = helixTarget.position.y;
      vector.z = helixTarget.position.z * 2;
      helixTarget.lookAt(vector);
      targets.helix.push(helixTarget);

      const gridTarget = new THREE.Object3D();
      gridTarget.position.x = (i % 5) * 400 - 800;
      gridTarget.position.y = -(Math.floor(i / 5) % 4) * 400 + 600;
      gridTarget.position.z = Math.floor(i / 20) * 1000 - 4500;
      targets.grid.push(gridTarget);
    }

    const TETRA_SCALE = 850;
    const tetraV = [
      new THREE.Vector3(1, 1, 1).multiplyScalar(TETRA_SCALE),
      new THREE.Vector3(1, -1, -1).multiplyScalar(TETRA_SCALE),
      new THREE.Vector3(-1, 1, -1).multiplyScalar(TETRA_SCALE),
      new THREE.Vector3(-1, -1, 1).multiplyScalar(TETRA_SCALE),
    ];
    const tetraFaces = [
      { A: tetraV[1], B: tetraV[2], C: tetraV[3], N: new THREE.Vector3(-1, -1, -1).normalize() },
      { A: tetraV[0], B: tetraV[3], C: tetraV[2], N: new THREE.Vector3(-1, 1, 1).normalize() },
      { A: tetraV[0], B: tetraV[1], C: tetraV[3], N: new THREE.Vector3(1, -1, 1).normalize() },
      { A: tetraV[0], B: tetraV[2], C: tetraV[1], N: new THREE.Vector3(1, 1, -1).normalize() },
    ];
    const totalTetra = objects.length;
    const TETRA_SHRINK = 0.15;
    for (let f = 0; f < 4; f++) {
      const faceStart = Math.floor((f * totalTetra) / 4);
      const faceEnd = Math.floor(((f + 1) * totalTetra) / 4);
      const count = faceEnd - faceStart;
      let rows = 1;
      while ((rows * (rows + 1)) / 2 < count) rows++;
      const { A, B, C, N } = tetraFaces[f];
      const denom = 3 * rows;
      for (let idx = 0; idx < count; idx++) {
        let r = 0;
        let remaining = idx;
        while (remaining > r) {
          remaining -= r + 1;
          r++;
        }
        const j = remaining;
        const alpha = (3 * (rows - r) - 2) / denom;
        const beta = (3 * j + 1) / denom;
        const gamma = (3 * (r - j) + 1) / denom;
        const a = (1 - TETRA_SHRINK) * alpha + TETRA_SHRINK / 3;
        const b = (1 - TETRA_SHRINK) * beta + TETRA_SHRINK / 3;
        const c = (1 - TETRA_SHRINK) * gamma + TETRA_SHRINK / 3;
        const tetraTarget = new THREE.Object3D();
        tetraTarget.position.set(
          a * A.x + b * B.x + c * C.x,
          a * A.y + b * B.y + c * C.y,
          a * A.z + b * B.z + c * C.z,
        );
        const lookAtPoint = tetraTarget.position.clone().addScaledVector(N, 1000);
        tetraTarget.lookAt(lookAtPoint);
        targets.tetra.push(tetraTarget);
      }
    }

    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    const onControlsChange = () => renderer.render(scene, camera);
    controls.addEventListener("change", onControlsChange);

    const tweenGroup = new Group();

    function transform(layout: Layout, duration = 2000) {
      tweenGroup.removeAll();
      const layoutTargets = targets[layout];
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = layoutTargets[i];

        new Tween(object.position, tweenGroup)
          .to(
            { x: target.position.x, y: target.position.y, z: target.position.z },
            Math.random() * duration + duration,
          )
          .easing(Easing.Exponential.InOut)
          .start();

        new Tween(object.rotation, tweenGroup)
          .to(
            { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
            Math.random() * duration + duration,
          )
          .easing(Easing.Exponential.InOut)
          .start();
      }

      new Tween({}, tweenGroup)
        .to({}, duration * 2)
        .onUpdate(() => renderer.render(scene, camera))
        .start();
    }

    transformRef.current = transform;
    transform("table", 2000);

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      tweenGroup.update();
      controls.update();
    }
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      controls.removeEventListener("change", onControlsChange);
      controls.dispose();
      tweenGroup.removeAll();
      transformRef.current = null;
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [people]);

  return (
    <>
      <div ref={containerRef} id="container" />
      <div id="menu">
        <button type="button" onClick={() => transformRef.current?.("table")}>
          TABLE
        </button>
        <button type="button" onClick={() => transformRef.current?.("sphere")}>
          SPHERE
        </button>
        <button type="button" onClick={() => transformRef.current?.("helix")}>
          HELIX
        </button>
        <button type="button" onClick={() => transformRef.current?.("grid")}>
          GRID
        </button>
        <button type="button" onClick={() => transformRef.current?.("tetra")}>
          TETRAHEDRON
        </button>
      </div>
    </>
  );
}
