import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function HatModel({ textures }) {
  const gltf = useGLTF("/models/hat.glb", true);
  const scene = gltf?.scene;
  if (!scene) return null;
  const texLoader = new THREE.TextureLoader();

  scene.traverse((child) => {
    if (child.isMesh) {
      ["Front","Back","Left","Right","Bottom"].forEach((part) => {
        if (child.name.includes(part) && textures[part.toLowerCase()]) {
          child.material.map = texLoader.load(textures[part.toLowerCase()]);
        }
      });
      child.material.needsUpdate = true;
    }
  });

  return <primitive object={scene} scale={2} />;
}

export default function HatDesigner() {
  const [textures, setTextures] = useState({
    front: null, back: null, left: null, right: null, bottom: null,
  });
  const handleFileChange = (e, pos) => {
    const file = e.target.files[0];
    if (file) {
      setTextures(prev => ({ ...prev, [pos]: URL.createObjectURL(file) }));
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh" }}>
      <div style={{ width:"240px", padding:10, background:"#f0f0f0" }}>
        <h4>Upload textures</h4>
        {["front","back","left","right","bottom"].map(pos => (
          <div key={pos} style={{ marginBottom:8 }}>
            <label>{pos.toUpperCase()}</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e,pos)} />
          </div>
        ))}
      </div>
      <div style={{ flex:1 }}>
        <Canvas camera={{ position:[0,1,5], fov:50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5,5,5]} />
          <HatModel textures={textures} />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
