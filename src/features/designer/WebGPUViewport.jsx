/**
 * WebGPU 3D Studio Viewport
 * Pipeline: WebGPU → WGSL shaders → Float32Array buffers → RAF render loop
 * Step 1: Canvas + GPU context setup
 * Step 2: WGSL render pipeline (PBR lighting)
 * Step 3: VRAM buffer allocation (vertex, index, uniform)
 * Step 4: Mat4 projection engine (pure typed arrays)
 * Step 5: 60Hz frame execution loop
 */

import { useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Mat4 Projection Engine (pure Float32Array, no external libs)
// ─────────────────────────────────────────────────────────────────────────────

const m4 = {
  create: () => new Float32Array(16),

  identity(out) {
    out.fill(0); out[0]=out[5]=out[10]=out[15]=1; return out
  },

  multiply(out, a, b) {
    for (let i=0;i<4;i++) for (let j=0;j<4;j++) {
      out[j*4+i]=a[0*4+i]*b[j*4+0]+a[1*4+i]*b[j*4+1]+a[2*4+i]*b[j*4+2]+a[3*4+i]*b[j*4+3]
    }
    return out
  },

  perspective(out, fovY, aspect, near, far) {
    const f = 1.0 / Math.tan(fovY / 2)
    out.fill(0)
    out[0]  = f / aspect
    out[5]  = f
    out[10] = (far + near) / (near - far)
    out[11] = -1
    out[14] = (2 * far * near) / (near - far)
    return out
  },

  lookAt(out, eye, center, up) {
    let fx=center[0]-eye[0], fy=center[1]-eye[1], fz=center[2]-eye[2]
    let fl=Math.sqrt(fx*fx+fy*fy+fz*fz); fx/=fl; fy/=fl; fz/=fl
    let rx=fy*up[2]-fz*up[1], ry=fz*up[0]-fx*up[2], rz=fx*up[1]-fy*up[0]
    let rl=Math.sqrt(rx*rx+ry*ry+rz*rz); rx/=rl; ry/=rl; rz/=rl
    let ux=ry*fz-rz*fy, uy=rz*fx-rx*fz, uz=rx*fy-ry*fx
    out[0]=rx; out[1]=ux; out[2]=-fx; out[3]=0
    out[4]=ry; out[5]=uy; out[6]=-fy; out[7]=0
    out[8]=rz; out[9]=uz; out[10]=-fz; out[11]=0
    out[12]=-(rx*eye[0]+ry*eye[1]+rz*eye[2])
    out[13]=-(ux*eye[0]+uy*eye[1]+uz*eye[2])
    out[14]= (fx*eye[0]+fy*eye[1]+fz*eye[2])
    out[15]=1
    return out
  },

  translate(out, a, v) {
    m4.identity(out)
    out[12]=v[0]; out[13]=v[1]; out[14]=v[2]
    const tmp=new Float32Array(16)
    return m4.multiply(tmp, a, out), tmp.forEach((x,i)=>out[i]=x), out
  },

  scale(out, a, v) {
    const s=m4.create(); m4.identity(s)
    s[0]=v[0]; s[5]=v[1]; s[10]=v[2]
    return m4.multiply(out, a, s)
  },

  rotateY(out, a, rad) {
    const c=Math.cos(rad), s=Math.sin(rad)
    const r=m4.create(); m4.identity(r)
    r[0]=c; r[2]=-s; r[8]=s; r[10]=c
    return m4.multiply(out, a, r)
  },

  normalMatrix(out, model) {
    // transpose of inverse (simplified — works for uniform scale)
    out[0]=model[0]; out[1]=model[4]; out[2]=model[8];  out[3]=0
    out[4]=model[1]; out[5]=model[5]; out[6]=model[9];  out[7]=0
    out[8]=model[2]; out[9]=model[6]; out[10]=model[10]; out[11]=0
    out[12]=0; out[13]=0; out[14]=0; out[15]=1
    return out
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — WGSL Shader Programs
// ─────────────────────────────────────────────────────────────────────────────

const WGSL_VERTEX = /* wgsl */`
struct Uniforms {
  mvp        : mat4x4<f32>,
  model      : mat4x4<f32>,
  normalMat  : mat4x4<f32>,
  camPos     : vec4<f32>,
  baseColor  : vec4<f32>,
  // lights packed: xyz=pos, w=intensity  (4 lights)
  light0pos  : vec4<f32>,
  light0col  : vec4<f32>,
  light1pos  : vec4<f32>,
  light1col  : vec4<f32>,
  light2pos  : vec4<f32>,
  light2col  : vec4<f32>,
  roughness  : f32,
  metallic   : f32,
  emissive   : f32,
  time       : f32,
}

@group(0) @binding(0) var<uniform> u : Uniforms;

struct VertIn {
  @location(0) pos    : vec3<f32>,
  @location(1) normal : vec3<f32>,
  @location(2) uv     : vec2<f32>,
}

struct VertOut {
  @builtin(position) clip : vec4<f32>,
  @location(0) worldPos   : vec3<f32>,
  @location(1) worldNorm  : vec3<f32>,
  @location(2) uv         : vec2<f32>,
}

@vertex
fn vs_main(v: VertIn) -> VertOut {
  var out: VertOut;
  let world  = u.model * vec4<f32>(v.pos, 1.0);
  out.clip      = u.mvp * vec4<f32>(v.pos, 1.0);
  out.worldPos  = world.xyz;
  out.worldNorm = normalize((u.normalMat * vec4<f32>(v.normal, 0.0)).xyz);
  out.uv        = v.uv;
  return out;
}
`

const WGSL_FRAGMENT = /* wgsl */`
struct Uniforms {
  mvp        : mat4x4<f32>,
  model      : mat4x4<f32>,
  normalMat  : mat4x4<f32>,
  camPos     : vec4<f32>,
  baseColor  : vec4<f32>,
  light0pos  : vec4<f32>,
  light0col  : vec4<f32>,
  light1pos  : vec4<f32>,
  light1col  : vec4<f32>,
  light2pos  : vec4<f32>,
  light2col  : vec4<f32>,
  roughness  : f32,
  metallic   : f32,
  emissive   : f32,
  time       : f32,
}

@group(0) @binding(0) var<uniform> u : Uniforms;

struct FragIn {
  @location(0) worldPos  : vec3<f32>,
  @location(1) worldNorm : vec3<f32>,
  @location(2) uv        : vec2<f32>,
}

// PBR helper — GGX distribution
fn D_GGX(NdotH: f32, roughness: f32) -> f32 {
  let a  = roughness * roughness;
  let a2 = a * a;
  let d  = NdotH * NdotH * (a2 - 1.0) + 1.0;
  return a2 / (3.14159 * d * d);
}

// Schlick fresnel
fn F_Schlick(cosTheta: f32, F0: vec3<f32>) -> vec3<f32> {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Geometry Smith
fn G_Smith(NdotV: f32, NdotL: f32, roughness: f32) -> f32 {
  let r = roughness + 1.0;
  let k = (r * r) / 8.0;
  let gv = NdotV / (NdotV * (1.0 - k) + k);
  let gl = NdotL / (NdotL * (1.0 - k) + k);
  return gv * gl;
}

fn pbr_light(N: vec3<f32>, V: vec3<f32>, L: vec3<f32>,
             lightCol: vec3<f32>, albedo: vec3<f32>,
             roughness: f32, metallic: f32) -> vec3<f32> {
  let H       = normalize(V + L);
  let NdotL   = max(dot(N, L), 0.0);
  let NdotV   = max(dot(N, V), 0.001);
  let NdotH   = max(dot(N, H), 0.0);
  let HdotV   = max(dot(H, V), 0.0);

  let F0      = mix(vec3<f32>(0.04), albedo, metallic);
  let F       = F_Schlick(HdotV, F0);
  let D       = D_GGX(NdotH, roughness);
  let G       = G_Smith(NdotV, NdotL, roughness);

  let specular = (D * G * F) / max(4.0 * NdotV * NdotL, 0.001);
  let kd       = (1.0 - F) * (1.0 - metallic);
  let diffuse  = kd * albedo / 3.14159;

  return (diffuse + specular) * lightCol * NdotL;
}

// Procedural floor tile pattern
fn floorPattern(uv: vec2<f32>) -> f32 {
  let tile = fract(uv * 4.0);
  let edge = smoothstep(0.0, 0.02, tile.x) * smoothstep(1.0, 0.98, tile.x)
           * smoothstep(0.0, 0.02, tile.y) * smoothstep(1.0, 0.98, tile.y);
  return 0.85 + edge * 0.15;
}

// Vignette
fn vignette(uv: vec2<f32>) -> f32 {
  let d = length(uv - vec2<f32>(0.5));
  return 1.0 - smoothstep(0.4, 0.9, d) * 0.6;
}

// ACES tone mapping
fn aces(x: vec3<f32>) -> vec3<f32> {
  let a = 2.51; let b = 0.03; let c = 2.43; let d = 0.59; let e = 0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), vec3<f32>(0.0), vec3<f32>(1.0));
}

@fragment
fn fs_main(f: FragIn) -> @location(0) vec4<f32> {
  let N = normalize(f.worldNorm);
  let V = normalize(u.camPos.xyz - f.worldPos);

  var albedo = u.baseColor.rgb;

  // Procedural tile tint on floor (y≈0)
  if (f.worldPos.y < 0.05) {
    let pat = floorPattern(f.uv);
    albedo   = albedo * pat;
  }

  let roughness = u.roughness;
  let metallic  = u.metallic;

  // Ambient (IBL-lite: sky gradient)
  let skyUp    = vec3<f32>(0.4, 0.5, 0.7);
  let skyDown  = vec3<f32>(0.08, 0.06, 0.05);
  let ambient  = mix(skyDown, skyUp, max(dot(N, vec3<f32>(0,1,0))*0.5+0.5, 0.0))
               * albedo * 0.35;

  // Light 0 — warm sun from upper-right
  let L0   = normalize(u.light0pos.xyz - f.worldPos);
  let att0 = 1.0 / (1.0 + 0.05*dot(u.light0pos.xyz-f.worldPos, u.light0pos.xyz-f.worldPos));
  let c0   = pbr_light(N,V,L0, u.light0col.rgb*u.light0col.w*att0, albedo, roughness, metallic);

  // Light 1 — cool fill from left
  let L1   = normalize(u.light1pos.xyz - f.worldPos);
  let att1 = 1.0 / (1.0 + 0.08*dot(u.light1pos.xyz-f.worldPos, u.light1pos.xyz-f.worldPos));
  let c1   = pbr_light(N,V,L1, u.light1col.rgb*u.light1col.w*att1, albedo, roughness, metallic);

  // Light 2 — ceiling point
  let L2   = normalize(u.light2pos.xyz - f.worldPos);
  let att2 = 1.0 / (1.0 + 0.12*dot(u.light2pos.xyz-f.worldPos, u.light2pos.xyz-f.worldPos));
  let c2   = pbr_light(N,V,L2, u.light2col.rgb*u.light2col.w*att2, albedo, roughness, metallic);

  var color = ambient + c0 + c1 + c2;

  // Emissive (for accent strips / glowing surfaces)
  color += albedo * u.emissive;

  // ACES tone mapping + gamma
  color = aces(color * 1.4);
  color = pow(color, vec3<f32>(1.0/2.2));

  // Vignette
  color *= vignette(f.uv);

  return vec4<f32>(color, u.baseColor.a);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Geometry builders (vertex: [x,y,z, nx,ny,nz, u,v])
// ─────────────────────────────────────────────────────────────────────────────

function buildPlane(w, h, nx, ny, nz, offsetX=0, offsetY=0, offsetZ=0) {
  // Axis-aligned quad facing along normal
  const vertices = []
  const indices  = []

  const half_w = w/2, half_h = h/2
  // Build 4 corners based on dominant normal axis
  let pts
  if (Math.abs(ny) > 0.5) {
    // floor / ceiling — XZ plane
    pts = [
      [-half_w+offsetX, offsetY, -half_h+offsetZ],
      [ half_w+offsetX, offsetY, -half_h+offsetZ],
      [ half_w+offsetX, offsetY,  half_h+offsetZ],
      [-half_w+offsetX, offsetY,  half_h+offsetZ],
    ]
  } else if (Math.abs(nz) > 0.5) {
    // back/front wall — XY plane
    pts = [
      [-half_w+offsetX, offsetY,         offsetZ],
      [ half_w+offsetX, offsetY,         offsetZ],
      [ half_w+offsetX, offsetY+h,       offsetZ],
      [-half_w+offsetX, offsetY+h,       offsetZ],
    ]
  } else {
    // side wall — ZY plane
    pts = [
      [offsetX, offsetY,         -half_h+offsetZ],
      [offsetX, offsetY,          half_h+offsetZ],
      [offsetX, offsetY+h,        half_h+offsetZ],
      [offsetX, offsetY+h,       -half_h+offsetZ],
    ]
  }

  const uvs = [[0,1],[1,1],[1,0],[0,0]]
  pts.forEach(([x,y,z],[i]) => {
    vertices.push(x,y,z, nx,ny,nz, uvs[i][0], uvs[i][1])
  })
  indices.push(0,1,2, 0,2,3)
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) }
}

function buildBox(w, h, d) {
  const hw=w/2, hh=h/2, hd=d/2
  const v=[], idx=[]
  const faces = [
    // pos  normal          uvs
    [[[-hw,-hh,-hd],[-hw,-hh,hd],[hw,-hh,hd],[hw,-hh,-hd]], [0,-1,0]],  // bottom
    [[[-hw, hh,-hd],[hw, hh,-hd],[hw, hh,hd],[-hw, hh,hd]], [0,1,0]],   // top
    [[[-hw,-hh,-hd],[hw,-hh,-hd],[hw,hh,-hd],[-hw,hh,-hd]], [0,0,-1]],  // front
    [[[hw,-hh,hd],[-hw,-hh,hd],[-hw,hh,hd],[hw,hh,hd]],    [0,0,1]],   // back
    [[[-hw,-hh,hd],[-hw,-hh,-hd],[-hw,hh,-hd],[-hw,hh,hd]], [-1,0,0]], // left
    [[[hw,-hh,-hd],[hw,-hh,hd],[hw,hh,hd],[hw,hh,-hd]],     [1,0,0]],  // right
  ]
  const uvList = [[0,1],[1,1],[1,0],[0,0]]
  let base = 0
  faces.forEach(([pts, n]) => {
    pts.forEach((p, i) => {
      v.push(...p, ...n, uvList[i][0], uvList[i][1])
    })
    idx.push(base,base+1,base+2, base,base+2,base+3)
    base += 4
  })
  return { vertices: new Float32Array(v), indices: new Uint16Array(idx) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Material presets
// ─────────────────────────────────────────────────────────────────────────────

const MAT = {
  floor:    { color:[0.85,0.80,0.72,1], roughness:0.15, metallic:0.0, emissive:0 },
  wall:     { color:[0.96,0.94,0.90,1], roughness:0.9,  metallic:0.0, emissive:0 },
  ceiling:  { color:[0.99,0.99,0.97,1], roughness:1.0,  metallic:0.0, emissive:0 },
  skirting: { color:[0.92,0.90,0.86,1], roughness:0.4,  metallic:0.0, emissive:0 },
  sofa:     { color:[0.35,0.28,0.22,1], roughness:0.85, metallic:0.0, emissive:0 },
  table:    { color:[0.55,0.38,0.20,1], roughness:0.3,  metallic:0.1, emissive:0 },
  chair:    { color:[0.62,0.55,0.48,1], roughness:0.7,  metallic:0.0, emissive:0 },
  lamp:     { color:[0.9, 0.85,0.7, 1], roughness:0.1,  metallic:0.8, emissive:1.5 },
  plant:    { color:[0.22,0.45,0.18,1], roughness:0.9,  metallic:0.0, emissive:0 },
  rug:      { color:[0.72,0.38,0.25,1], roughness:1.0,  metallic:0.0, emissive:0 },
  default:  { color:[0.7, 0.65,0.6, 1], roughness:0.6,  metallic:0.0, emissive:0 },
}

function matForItem(item) {
  const n = (item?.name || '').toLowerCase()
  if (n.includes('sofa') || n.includes('couch'))  return MAT.sofa
  if (n.includes('table') || n.includes('desk'))  return MAT.table
  if (n.includes('chair') || n.includes('stool')) return MAT.chair
  if (n.includes('lamp') || n.includes('light'))  return MAT.lamp
  if (n.includes('plant') || n.includes('tree'))  return MAT.plant
  if (n.includes('rug')  || n.includes('carpet')) return MAT.rug
  return MAT.default
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 + 5 — Main component: GPU context + RAF loop
// ─────────────────────────────────────────────────────────────────────────────

export default function WebGPUViewport({ step=1, addedItems=[], appliedTemplate=null, onSelectFurniture }) {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({})   // holds all GPU objects across renders
  const mouseRef   = useRef({ dragging:false, lastX:0, lastY:0, button:0 })
  const camRef     = useRef({ theta: Math.PI*0.25, phi: Math.PI*0.28, radius:7, target:[0,0.5,0] })
  const rafRef     = useRef(null)
  const itemsRef   = useRef(addedItems)
  const stepRef    = useRef(step)

  useEffect(() => { itemsRef.current = addedItems }, [addedItems])
  useEffect(() => { stepRef.current = step }, [step])

  // ── GPU init ───────────────────────────────────────────────────────────────
  const init = useCallback(async (canvas) => {
    if (!navigator.gpu) {
      stateRef.current.noGPU = true
      return
    }

    const adapter = await navigator.gpu.requestAdapter({ powerPreference:'high-performance' })
    if (!adapter) { stateRef.current.noGPU = true; return }
    const device  = await adapter.requestDevice()

    const ctx = canvas.getContext('webgpu')
    const fmt = navigator.gpu.getPreferredCanvasFormat()

    ctx.configure({ device, format: fmt, alphaMode:'premultiplied' })

    // Depth texture
    let depthTex = device.createTexture({
      size:[canvas.width, canvas.height, 1],
      format:'depth24plus', usage: GPUTextureUsage.RENDER_ATTACHMENT
    })

    // ── Shader modules ──────────────────────────────────────────────────────
    const vsModule = device.createShaderModule({ code: WGSL_VERTEX })
    const fsModule = device.createShaderModule({ code: WGSL_FRAGMENT })

    // ── Uniform buffer layout ───────────────────────────────────────────────
    // mvp(64)+model(64)+normalMat(64)+camPos(16)+baseColor(16)+
    // l0pos(16)+l0col(16)+l1pos(16)+l1col(16)+l2pos(16)+l2col(16)+
    // roughness(4)+metallic(4)+emissive(4)+time(4) = 352 bytes → pad to 384
    const UNI_SIZE = 384

    const bindGroupLayout = device.createBindGroupLayout({
      entries:[{ binding:0, visibility: GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,
        buffer:{ type:'uniform' } }]
    })

    const pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts:[bindGroupLayout] }),
      vertex: {
        module: vsModule, entryPoint:'vs_main',
        buffers:[{
          arrayStride: 8*4,
          attributes:[
            { shaderLocation:0, offset:0,    format:'float32x3' },
            { shaderLocation:1, offset:3*4,  format:'float32x3' },
            { shaderLocation:2, offset:6*4,  format:'float32x2' },
          ]
        }]
      },
      fragment: { module:fsModule, entryPoint:'fs_main',
        targets:[{ format:fmt,
          blend:{ color:{ srcFactor:'src-alpha', dstFactor:'one-minus-src-alpha', operation:'add' },
                  alpha: { srcFactor:'one', dstFactor:'one-minus-src-alpha', operation:'add' } }
        }]
      },
      primitive: { topology:'triangle-list', cullMode:'back' },
      depthStencil: { format:'depth24plus', depthWriteEnabled:true, depthCompare:'less' },
    })

    stateRef.current = { device, ctx, fmt, pipeline, bindGroupLayout, depthTex, noGPU:false, UNI_SIZE }
  }, [])

  // ── Create one draw object ─────────────────────────────────────────────────
  const makeDrawable = useCallback((device, bindGroupLayout, geo, mat, modelMatrix) => {
    const vbuf = device.createBuffer({
      size: geo.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(vbuf, 0, geo.vertices)

    const ibuf = device.createBuffer({
      size: geo.indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(ibuf, 0, geo.indices)

    const ubuf = device.createBuffer({
      size: stateRef.current.UNI_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const bg = device.createBindGroup({
      layout: bindGroupLayout,
      entries:[{ binding:0, resource:{ buffer:ubuf } }]
    })

    return { vbuf, ibuf, ubuf, bg, indexCount: geo.indices.length, mat, modelMatrix }
  }, [])

  // ── Build scene drawables ──────────────────────────────────────────────────
  const buildScene = useCallback(() => {
    const { device, bindGroupLayout } = stateRef.current
    if (!device) return

    const drawables = []
    const ROOM = 8, RH = 3.2

    const I = m4.create(); m4.identity(I)

    // Floor
    const floorGeo = buildPlane(ROOM, ROOM, 0,1,0, 0,0,0)
    drawables.push(makeDrawable(device, bindGroupLayout, floorGeo, MAT.floor, I))

    // Ceiling
    const ceilMat = m4.create(); m4.identity(ceilMat); ceilMat[13]=RH; ceilMat[5]=-1
    const ceilGeo  = buildPlane(ROOM, ROOM, 0,-1,0, 0,RH,0)
    drawables.push(makeDrawable(device, bindGroupLayout, ceilGeo, MAT.ceiling, I))

    // Walls
    const wallDefs = [
      { n:[0,0,-1], ox:0,  oy:0, oz:-ROOM/2 },
      { n:[0,0, 1], ox:0,  oy:0, oz: ROOM/2 },
      { n:[-1,0,0], ox:-ROOM/2, oy:0, oz:0  },
      { n:[ 1,0,0], ox: ROOM/2, oy:0, oz:0  },
    ]
    wallDefs.forEach(({n,ox,oy,oz}) => {
      const geo = buildPlane(ROOM, RH, n[0],n[1],n[2], ox,oy,oz)
      drawables.push(makeDrawable(device, bindGroupLayout, geo, MAT.wall, I))
    })

    // Skirting boards
    const skirtDefs = [
      { n:[0,0,-1], ox:0, oy:0, oz:-ROOM/2+0.01 },
      { n:[0,0, 1], ox:0, oy:0, oz: ROOM/2-0.01 },
      { n:[-1,0,0], ox:-ROOM/2+0.01, oy:0, oz:0 },
      { n:[ 1,0,0], ox: ROOM/2-0.01, oy:0, oz:0 },
    ]
    skirtDefs.forEach(({n,ox,oy,oz}) => {
      const geo = buildPlane(ROOM, 0.12, n[0],n[1],n[2], ox,oy,oz)
      drawables.push(makeDrawable(device, bindGroupLayout, geo, MAT.skirting, I))
    })

    // Furniture from addedItems
    const placed = new Map()
    itemsRef.current.forEach((item, idx) => {
      const angle = (idx / Math.max(itemsRef.current.length,1)) * Math.PI * 2
      const r = 1.8
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      const w = item.width  || 0.9
      const h = item.height || 0.85
      const d = item.depth  || 0.9
      const geo = buildBox(w, h, d)
      const mat = matForItem(item)
      const model = m4.create(); m4.identity(model)
      model[12]=x; model[13]=h/2; model[14]=z
      drawables.push(makeDrawable(device, bindGroupLayout, geo, mat, model))
    })

    stateRef.current.drawables = drawables
  }, [makeDrawable])

  // ── Write uniforms ─────────────────────────────────────────────────────────
  const writeUniforms = useCallback((drawable, view, proj, camPos, time) => {
    const { device, UNI_SIZE } = stateRef.current
    const buf = new Float32Array(UNI_SIZE / 4)

    const mvp = m4.create()
    m4.multiply(mvp, proj, m4.multiply(m4.create(), view, drawable.modelMatrix))

    const nm  = m4.create()
    m4.normalMatrix(nm, drawable.modelMatrix)

    // offsets in float32 words
    buf.set(mvp,                  0)   // 0..15
    buf.set(drawable.modelMatrix, 16)  // 16..31
    buf.set(nm,                   32)  // 32..47
    buf.set([camPos[0],camPos[1],camPos[2], 1], 48) // 48..51
    buf.set(drawable.mat.color,   52)  // 52..55

    // lights: warm sun, cool fill, ceiling
    buf.set([5, 4, -3, 1],           56)  // light0 pos
    buf.set([1.0, 0.92, 0.76, 3.5],  60)  // light0 col+intensity
    buf.set([-5, 3,  5, 1],          64)  // light1 pos
    buf.set([0.5, 0.65, 1.0, 1.2],   68)  // light1 col
    buf.set([0, 3.1, 0,  1],         72)  // light2 pos (ceiling)
    buf.set([1.0, 0.95, 0.85, 2.0],  76)  // light2 col

    buf[80] = drawable.mat.roughness
    buf[81] = drawable.mat.metallic
    buf[82] = drawable.mat.emissive
    buf[83] = time

    device.queue.writeBuffer(drawable.ubuf, 0, buf)
  }, [])

  // ── Resize handler ─────────────────────────────────────────────────────────
  const handleResize = useCallback(() => {
    const { device, noGPU, ctx } = stateRef.current
    const canvas = canvasRef.current
    if (!canvas || !device || noGPU) return
    const w = canvas.clientWidth  * devicePixelRatio
    const h = canvas.clientHeight * devicePixelRatio
    canvas.width  = w
    canvas.height = h
    if (stateRef.current.depthTex) stateRef.current.depthTex.destroy()
    stateRef.current.depthTex = device.createTexture({
      size:[w,h,1], format:'depth24plus', usage:GPUTextureUsage.RENDER_ATTACHMENT
    })
  }, [])

  // ── STEP 5 — Frame execution loop ──────────────────────────────────────────
  const startLoop = useCallback(() => {
    let t0 = performance.now()

    const frame = (ts) => {
      rafRef.current = requestAnimationFrame(frame)
      const { device, ctx, pipeline, depthTex, drawables, noGPU } = stateRef.current
      if (!device || noGPU || !drawables?.length) return

      const canvas = canvasRef.current
      if (!canvas) return

      const time    = (ts - t0) / 1000
      const cam     = camRef.current
      const step    = stepRef.current

      // Camera position from spherical coords
      let camTheta = cam.theta, camPhi = cam.phi, camRadius = cam.radius
      if (step === 1) { camTheta = -Math.PI/2; camPhi = Math.PI*0.5; camRadius = 9 }
      if (step === 3) { camTheta += time*0.004; camPhi = Math.PI*0.22; camRadius = 5.5 }

      const cx = cam.target[0] + camRadius * Math.sin(camPhi) * Math.cos(camTheta)
      const cy = cam.target[1] + camRadius * Math.cos(camPhi)
      const cz = cam.target[2] + camRadius * Math.sin(camPhi) * Math.sin(camTheta)
      const camPos = [cx, cy, cz]

      const aspect = canvas.width / canvas.height
      const proj   = m4.create()
      m4.perspective(proj, Math.PI/4, aspect, 0.1, 100)

      const view = m4.create()
      m4.lookAt(view, camPos, cam.target, [0,1,0])

      const colorView  = ctx.getCurrentTexture().createView()
      const depthView  = depthTex.createView()

      const enc = device.createCommandEncoder()
      const pass = enc.beginRenderPass({
        colorAttachments:[{
          view: colorView,
          clearValue:{ r:0.06, g:0.06, b:0.07, a:1 },
          loadOp:'clear', storeOp:'store'
        }],
        depthStencilAttachment:{
          view: depthView,
          depthClearValue:1, depthLoadOp:'clear', depthStoreOp:'store'
        }
      })

      pass.setPipeline(pipeline)

      drawables.forEach(d => {
        writeUniforms(d, view, proj, camPos, time)
        pass.setBindGroup(0, d.bg)
        pass.setVertexBuffer(0, d.vbuf)
        pass.setIndexBuffer(d.ibuf, 'uint16')
        pass.drawIndexed(d.indexCount)
      })

      pass.end()
      device.queue.submit([enc.finish()])
    }

    rafRef.current = requestAnimationFrame(frame)
  }, [writeUniforms])

  // ── Main effect: init → build → start ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    handleResize()
    const ro = new ResizeObserver(handleResize)
    ro.observe(canvas.parentElement)

    ;(async () => {
      await init(canvas)
      buildScene()
      startLoop()
    })()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      stateRef.current.drawables?.forEach(d => {
        d.vbuf?.destroy(); d.ibuf?.destroy(); d.ubuf?.destroy()
      })
      stateRef.current.depthTex?.destroy()
    }
  }, [])

  // Rebuild scene when items or template change
  useEffect(() => {
    if (stateRef.current.device) buildScene()
  }, [addedItems, appliedTemplate, buildScene])

  // ── Mouse orbit controls ───────────────────────────────────────────────────
  const onMouseDown = (e) => {
    mouseRef.current = { dragging:true, lastX:e.clientX, lastY:e.clientY, button:e.button }
  }
  const onMouseMove = (e) => {
    const m = mouseRef.current
    if (!m.dragging) return
    const dx = (e.clientX - m.lastX) * 0.005
    const dy = (e.clientY - m.lastY) * 0.005
    m.lastX = e.clientX; m.lastY = e.clientY
    camRef.current.theta -= dx
    camRef.current.phi    = Math.max(0.05, Math.min(Math.PI*0.48, camRef.current.phi + dy))
  }
  const onMouseUp   = () => { mouseRef.current.dragging = false }
  const onWheel     = (e) => {
    camRef.current.radius = Math.max(2, Math.min(15, camRef.current.radius + e.deltaY * 0.01))
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background:'#0f0f11', overflow:'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width:'100%', height:'100%', display:'block', cursor:'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onContextMenu={e=>e.preventDefault()}
      />

      {/* HUD overlay */}
      <div style={{
        position:'absolute', bottom:16, left:16,
        display:'flex', gap:8, pointerEvents:'none'
      }}>
        {['WebGPU','WGSL PBR','HDR Lighting'].map(tag => (
          <span key={tag} style={{
            background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(196,149,106,0.3)',
            color:'#c4956a', fontSize:10, letterSpacing:2,
            padding:'4px 10px', textTransform:'uppercase'
          }}>{tag}</span>
        ))}
      </div>

      {/* Controls hint */}
      <div style={{
        position:'absolute', top:12, right:12,
        color:'rgba(255,255,255,0.3)', fontSize:10, letterSpacing:1,
        textAlign:'right', pointerEvents:'none', lineHeight:1.8
      }}>
        DRAG · ORBIT<br/>SCROLL · ZOOM
      </div>

      {/* WebGPU not supported message */}
      {stateRef.current.noGPU && (
        <div style={{
          position:'absolute', inset:0, display:'flex', alignItems:'center',
          justifyContent:'center', flexDirection:'column', gap:12,
          background:'#0f0f11', color:'#888'
        }}>
          <div style={{ fontSize:32 }}>⚠</div>
          <div style={{ fontSize:14, letterSpacing:2 }}>WEBGPU NOT SUPPORTED</div>
          <div style={{ fontSize:11, color:'#555' }}>Enable in Chrome flags or use Chrome 113+</div>
        </div>
      )}
    </div>
  )
}
