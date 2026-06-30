import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Geometry, Base, Intersection, Addition } from '@react-three/csg';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { useLoader } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      meshPhysicalMaterial: any;
    }
  }
}

interface IllusionLetterProps {
  letter1: string;
  letter2: string;
  fontUrl: string;
  materialProp: any;
}

const getTopCenter = (geo: THREE.BufferGeometry) => {
  const positionAttr = geo.getAttribute('position');
  if (!positionAttr) return 0;
  
  const array = positionAttr.array;
  let maxY = -Infinity;
  
  // First pass: find the absolute max Y
  for (let i = 1; i < array.length; i += 3) {
    const y = array[i];
    if (y > maxY) {
      maxY = y;
    }
  }
  
  if (maxY === -Infinity) return 0;
  
  // Second pass: find the bounding range of X values of all vertices near the top
  const threshold = 0.8;
  let minX = Infinity;
  let maxX = -Infinity;
  
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    if (y >= maxY - threshold) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  
  if (minX === Infinity || maxX === -Infinity) return 0;
  
  return (minX + maxX) / 2;
};

const getAbsMaxY = (geo: THREE.BufferGeometry) => {
  const positionAttr = geo.getAttribute('position');
  if (!positionAttr) return 5.0;
  
  const array = positionAttr.array;
  let maxY = -Infinity;
  
  for (let i = 1; i < array.length; i += 3) {
    const y = array[i];
    if (y > maxY) {
      maxY = y;
    }
  }
  
  return maxY !== -Infinity ? maxY : 5.0;
};

const IllusionLetter: React.FC<IllusionLetterProps> = ({ letter1, letter2, fontUrl, materialProp }) => {
  const textureIntensity = 0.5;
  const manualOffsetX = 0;
  const manualOffsetY = 0;
  const manualOffsetZ = 0;
  const isItalic = fontUrl.endsWith('#italic');
  const baseFontUrl = isItalic ? fontUrl.split('#')[0] : fontUrl;
  const font = useLoader(FontLoader, baseFontUrl);

  // Configuration for geometry generation
  const TARGET_HEIGHT = 10;
  // Use high segments for smooth curves
  const CURVE_SEGMENTS = 64; 
  // Differing extrusion depths and a micro-nudge prevents coplanar Z-fighting in CSG
  const EXTRUSION_DEPTH_FRONT = 30;
  const EXTRUSION_DEPTH_SIDE = 30.005;

  const createGeo = (char: string, depth: number) => {
    const safeChar = char && char.trim() !== '' ? char : '?';
    const geo = new TextGeometry(safeChar, { 
      font, 
      size: 5,
      height: depth,
      curveSegments: CURVE_SEGMENTS,
      bevelEnabled: false 
    });

    if (isItalic) {
      // Apply shear for italic effect
      // Matrix4 shear: x' = x + y * skewX
      const shearMatrix = new THREE.Matrix4();
      const skewX = 0.25; // Adjust for desired slant
      shearMatrix.set(
        1, skewX, 0, 0,
        0, 1,     0, 0,
        0, 0,     1, 0,
        0, 0,     0, 1
      );
      geo.applyMatrix4(shearMatrix);
    }
    
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    
    if (box) {
      const h = box.max.y - box.min.y;
      const s = h > 0.001 ? TARGET_HEIGHT / h : 1;
      geo.scale(s, s, 1);
    }

    geo.center();
    geo.computeVertexNormals();
    return geo;
  };

  const createHeartGeo = (depth: number) => {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo( x, y + 0.3 );
    heartShape.bezierCurveTo( x, y + 0.3, x - 0.05, y + 0.6, x - 0.4, y + 0.6 );
    heartShape.bezierCurveTo( x - 0.8, y + 0.6, x - 0.8, y + 0.1, x - 0.8, y + 0.1 );
    heartShape.bezierCurveTo( x - 0.8, y - 0.3, x - 0.4, y - 0.7, x, y - 1 );
    heartShape.bezierCurveTo( x + 0.4, y - 0.7, x + 0.8, y - 0.3, x + 0.8, y + 0.1 );
    heartShape.bezierCurveTo( x + 0.8, y + 0.1, x + 0.8, y + 0.6, x + 0.4, y + 0.6 );
    heartShape.bezierCurveTo( x + 0.1, y + 0.6, x, y + 0.3, x, y + 0.3 );

    const holePath = new THREE.Path();
    const s = 0.75; 
    holePath.moveTo( x * s, (y + 0.3) * s );
    holePath.bezierCurveTo( x * s, (y + 0.3) * s, (x - 0.05) * s, (y + 0.6) * s, (x - 0.4) * s, (y + 0.6) * s );
    holePath.bezierCurveTo( (x - 0.8) * s, (y + 0.6) * s, (x - 0.8) * s, (y + 0.1) * s, (x - 0.8) * s, (y + 0.1) * s );
    holePath.bezierCurveTo( (x - 0.8) * s, (y - 0.3) * s, (x - 0.4) * s, (y - 0.7) * s, x * s, (y - 1) * s );
    holePath.bezierCurveTo( (x + 0.4) * s, (y - 0.7) * s, (x + 0.8) * s, (y - 0.3) * s, (x + 0.8) * s, (y + 0.1) * s );
    holePath.bezierCurveTo( (x + 0.8) * s, (y + 0.1) * s, (x + 0.8) * s, (y + 0.6) * s, (x + 0.4) * s, (y + 0.6) * s );
    holePath.bezierCurveTo( (x + 0.1) * s, (y + 0.6) * s, x * s, (y + 0.3) * s, x * s, (y + 0.3) * s );
    heartShape.holes.push(holePath);

    const geo = new THREE.ExtrudeGeometry(heartShape, {
      depth: depth,
      bevelEnabled: false,
      curveSegments: CURVE_SEGMENTS
    });
    
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    if (box) {
      const h = box.max.y - box.min.y;
      const scale = h > 0.001 ? TARGET_HEIGHT / h : 1;
      geo.scale(scale, scale, 1);
    }
    geo.center();
    geo.computeVertexNormals();
    return geo;
  };

  const geo1 = useMemo(() => createGeo(letter1, EXTRUSION_DEPTH_FRONT), [letter1, font]);
  const geo2 = useMemo(() => createGeo(letter2, EXTRUSION_DEPTH_SIDE), [letter2, font]);
  
  const heartBailFront = useMemo(() => createHeartGeo(EXTRUSION_DEPTH_FRONT), []);
  const heartBailSide = useMemo(() => createHeartGeo(EXTRUSION_DEPTH_SIDE), []);

  const hammeredTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, size, size);
      const numDents = 3000; 
      for (let i = 0; i < numDents; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 2 + Math.random() * 12;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(0, 0, 0, 0.3)'); 
        g.addColorStop(1, 'rgba(128, 128, 128, 0)'); 
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // --- Dimensions & Measurements ---
  const rawWidth1 = useMemo(() => geo1.boundingBox ? geo1.boundingBox.max.x - geo1.boundingBox.min.x : 5, [geo1]);
  const rawWidth2 = useMemo(() => geo2.boundingBox ? geo2.boundingBox.max.x - geo2.boundingBox.min.x : 5, [geo2]);

  const GAP_LETTERS = useMemo(() => new Set(['H', 'K', 'M', 'N', 'U', 'V', 'W', 'X', 'Y']), []);
  const SLIGHT_LEFT_HEAVY = useMemo(() => new Set(['B', 'D', 'P', 'R']), []);

  const isGap1 = GAP_LETTERS.has(letter1);
  const isGap2 = GAP_LETTERS.has(letter2);
  const isDoubleGap = isGap1 && isGap2;
  const isPeaked = letter1 === 'W' || letter2 === 'W' || letter1 === 'M' || letter2 === 'M' || letter1 === 'A' || letter2 === 'A';

  const maxY1 = useMemo(() => getAbsMaxY(geo1), [geo1]);
  const maxY2 = useMemo(() => getAbsMaxY(geo2), [geo2]);
  const contactY = useMemo(() => Math.min(maxY1, maxY2), [maxY1, maxY2]);
  const TOP_Y = contactY - 0.15;
  
  const BAIL_SCALE = 0.38; 
  const bailHeight = TARGET_HEIGHT * BAIL_SCALE;
  const bailYOffset = (bailHeight / 2) - 0.45; 
  const BAR_THICKNESS = 0.22; 

  const bailOffsetX = useMemo(() => {
    return getTopCenter(geo1);
  }, [geo1]);

  const bailOffsetZ = useMemo(() => {
    return -getTopCenter(geo2);
  }, [geo2]);

  const dynamicAngle = useMemo(() => Math.atan2(rawWidth2, rawWidth1), [rawWidth1, rawWidth2]);
  const diagLength = Math.sqrt(Math.pow(rawWidth1 / 2, 2) + Math.pow(rawWidth2 / 2, 2)) * 1.6;

  const finalX = Number.isFinite(bailOffsetX) ? bailOffsetX + manualOffsetX : manualOffsetX;
  const finalZ = Number.isFinite(bailOffsetZ) ? bailOffsetZ + manualOffsetZ : manualOffsetZ;
  const finalY = Number.isFinite(TOP_Y) ? TOP_Y + manualOffsetY : 4.85 + manualOffsetY;

  return (
    <group>
      {/* Main Monogram Pendant Mesh containing the letters intersection and cylinder support bars */}
      <mesh name="unifiedPendant" castShadow receiveShadow>
        <Geometry>
          {/* Main Monogram Body: Intersection of Letter 1 and Letter 2 */}
          <Base>
            <Geometry>
               <Base geometry={geo1} />
               {/* Micro-nudge on Z rotation pivot and position to avoid coplanar Z-fighting artifacts */}
               <Intersection geometry={geo2} rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0.002]} />
            </Geometry>
          </Base>

          {/* Support Bars for open-topped letters */}
          {(isDoubleGap || isGap1) && (
            <Addition 
              geometry={new THREE.CylinderGeometry(BAR_THICKNESS, BAR_THICKNESS, isDoubleGap ? diagLength : rawWidth1 * 0.95, 16)} 
              position={[finalX, finalY, finalZ]} 
              rotation={[0, isDoubleGap ? dynamicAngle : 0, Math.PI / 2]} 
            />
          )}
          {(isDoubleGap || isGap2) && (
            <Addition 
              geometry={new THREE.CylinderGeometry(BAR_THICKNESS, BAR_THICKNESS, isDoubleGap ? diagLength : rawWidth2 * 0.95, 16)} 
              position={[finalX, finalY, finalZ]} 
              rotation={[0, isDoubleGap ? -dynamicAngle : Math.PI / 2, Math.PI / 2]} 
            />
          )}
        </Geometry>
        <meshPhysicalMaterial 
          {...materialProp} 
          bumpMap={hammeredTexture}
          bumpScale={textureIntensity * 0.25} 
          roughnessMap={hammeredTexture} 
          roughness={(materialProp.roughness ?? 0.04) + (textureIntensity * 0.15)} 
          clearcoat={materialProp.clearcoat ?? 1.0}
          clearcoatRoughness={materialProp.clearcoatRoughness ?? 0.01}
          metalness={1.0}
        />
      </mesh>

      {/* Heart Bail: Rendered as an independent mesh (its own CSG tree) to prevent compilation/rendering freeze or CSG crashes */}
      <mesh name="heartBail" position={[finalX, finalY + bailYOffset, finalZ]} scale={[BAIL_SCALE, BAIL_SCALE, BAIL_SCALE]} castShadow receiveShadow>
        <Geometry>
           <Base geometry={heartBailFront} />
           <Intersection geometry={heartBailSide} rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0.002]} />
        </Geometry>
        <meshPhysicalMaterial 
          {...materialProp} 
          bumpMap={hammeredTexture}
          bumpScale={textureIntensity * 0.25} 
          roughnessMap={hammeredTexture} 
          roughness={(materialProp.roughness ?? 0.04) + (textureIntensity * 0.15)} 
          clearcoat={materialProp.clearcoat ?? 1.0}
          clearcoatRoughness={materialProp.clearcoatRoughness ?? 0.01}
          metalness={1.0}
        />
      </mesh>
    </group>
  );
};

export default IllusionLetter;