import React, { Suspense, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import IllusionLetter from './IllusionLetter';
import { DesignState, MetalType } from '../types';
import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';

// Handle JSX declaration robustly
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      directionalLight: any;
      mesh: any;
      meshPhysicalMaterial: any;
      meshBasicMaterial: any;
      planeGeometry: any;
    }
  }
}

interface Viewer3DProps extends DesignState {
  exportRef?: React.Ref<any>;
  // Allow for fallback characters if the user clears the input
  letter1: string;
  letter2: string;
}

const MATERIALS = {
  [MetalType.GOLD]: { color: '#FAD250', metalness: 1.0, roughness: 0.04, envMapIntensity: 1.8, clearcoat: 1.0, clearcoatRoughness: 0.01 },
  [MetalType.ROSE_GOLD]: { color: '#E5B8AE', metalness: 1.0, roughness: 0.04, envMapIntensity: 1.8, clearcoat: 1.0, clearcoatRoughness: 0.01 },
  [MetalType.SILVER]: { color: '#BFC1C5', metalness: 1.0, roughness: 0.12, envMapIntensity: 1.2, clearcoat: 0.4, clearcoatRoughness: 0.1 }, // Refined polished sterling silver, optimized for high visibility
  [MetalType.PLATINUM]: { color: '#D8D6D2', metalness: 1.0, roughness: 0.10, envMapIntensity: 1.2, clearcoat: 0.5, clearcoatRoughness: 0.08 },
};

// SceneContent handles the actual 3D objects and the export logic
const SceneContent = forwardRef(({ letter1, letter2, font, metal, textureIntensity, manualOffsetX, manualOffsetY, manualOffsetZ }: DesignState, ref) => {
  const groupRef = useRef<THREE.Group>(null);

  useImperativeHandle(ref, () => ({
    export: () => {
      if (!groupRef.current) return null;
      
      // Clone the group to traverse and modify for export without affecting the live scene.
      const sceneClone = groupRef.current.clone(true);

      // Clean up CSG artifacts (remove invisible children/helpers)
      sceneClone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
           if (child.children.length > 0) {
              child.children = [];
           }
        }
      });

      // NOTE: We do NOT apply physical displacement here anymore.
      // The browser cannot handle high-res mesh generation reliably.
      // We export a clean "Base Mesh" and use the external Python/Blender script
      // to generate the high-quality physical hammered texture.

      const exporter = new OBJExporter();
      return exporter.parse(sceneClone);
    }
  }));

  // Metal material props
  const materialProp = useMemo(() => ({
    ...MATERIALS[metal],
  }), [metal]);

  return (
    <group ref={groupRef}>
      <IllusionLetter 
        letter1={letter1} 
        letter2={letter2} 
        fontUrl={font} 
        materialProp={materialProp} 
        textureIntensity={textureIntensity}
        manualOffsetX={manualOffsetX}
        manualOffsetY={manualOffsetY}
        manualOffsetZ={manualOffsetZ}
      />
    </group>
  );
});

const Viewer3D: React.FC<Viewer3DProps> = ({ letter1, letter2, font, metal, textureIntensity, manualOffsetX, manualOffsetY, manualOffsetZ, exportRef }) => {
  return (
    <Canvas shadows camera={{ position: [0, 0, 15], fov: 45 }}>
      <Suspense fallback={null}>
        {/* Uniform 360-degree Lighting for consistent shine from every camera perspective */}
        <ambientLight intensity={0.7} />
        
        {/* Main physical lights in cardinal 3D axes */}
        <directionalLight position={[0, 20, 10]} intensity={1.5} castShadow shadow-bias={-0.0001} />
        <directionalLight position={[0, -20, 10]} intensity={0.8} />
        <directionalLight position={[20, 5, 5]} intensity={1.2} />
        <directionalLight position={[-20, 5, 5]} intensity={1.2} />
        <directionalLight position={[0, 5, -20]} intensity={1.5} />
        <directionalLight position={[0, 25, 0]} intensity={1.0} />

        {/* Diagonal Soft Point Lights to eliminate any dull spots and give sparkles to details */}
        <pointLight position={[12, 12, 12]} intensity={0.8} />
        <pointLight position={[-12, 12, -12]} intensity={0.8} />
        <pointLight position={[12, -12, -12]} intensity={0.5} />
        <pointLight position={[-12, -12, 12]} intensity={0.5} />

        {/* Custom procedural reflection map using pure white lightbox meshes for plain, realistic, luxury reflections without city elements */}
        <Environment resolution={256}>
          <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            {/* Overhead soft panel */}
            <mesh position={[0, 15, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[40, 40]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            {/* Key lights */}
            <mesh position={[18, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[30, 30]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            <mesh position={[-18, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[30, 30]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            {/* Front & Back fill banners */}
            <mesh position={[0, 0, 18]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[25, 25]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -18]} rotation={[0, 0, 0]}>
              <planeGeometry args={[25, 25]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          </group>
        </Environment>

        <SceneContent 
          ref={exportRef}
          letter1={letter1} 
          letter2={letter2} 
          font={font} 
          metal={metal} 
          textureIntensity={textureIntensity}
          manualOffsetX={manualOffsetX}
          manualOffsetY={manualOffsetY}
          manualOffsetZ={manualOffsetZ}
        />
        
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI} />
      </Suspense>
    </Canvas>
  );
};

export default Viewer3D;