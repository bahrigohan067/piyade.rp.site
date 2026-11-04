// WebGL2 Universal Backend for AeroShards
// Translates the exact WGSL shaders from AeroShards.tsx into GLSL ES 3.00 (#version 300 es)
// so devices without WebGPU render the exact same 3D raytraced glass shards, markers, DoF, and bloom.

export interface AeroWebGL2RenderParams {
  view: [number, number, number, number];
  eye: [number, number, number, number];
  forward: [number, number, number, number];
  right: [number, number, number, number];
  up: [number, number, number, number];
  shard: [number, number, number, number];
  accent: [number, number, number, number];
  marker: [number, number, number, number];
  surface: [number, number, number, number];
  upload: Float32Array;
  shardCount: number;
  counts: number[];
  starts: number[];
  markerData: Float32Array;
  markerTotal: number;
  markerCounts: number[];
  markerStarts: number[];
  lightMode: boolean;
  glow: number;
  grain: number;
  vignette: number;
  paper: [number, number, number] | null;
  clock: number;
  depthOfField: number;
  focal: number;
  containerWidth: number;
  containerHeight: number;
  isGlass: boolean;
}

const LEVELS = 5;
const DEPTHS = [2.7, 3.9, 5.6, 8.1, 11.6];
const FADE = [1, 0.8, 0.52, 0.32, 0.2];
const SHARD_FOCUS = 2.75;
const LAYER_SCALES = [1, 0.5];
const BLOOM_LEVELS = 4;

const FULLSCREEN_VS = `#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 uv[3] = vec2[3](vec2(0.0, 0.0), vec2(2.0, 0.0), vec2(0.0, 2.0));
  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
  v_uv = uv[gl_VertexID];
}
`;

const SHARD_VS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform vec4 u_scene[9];
uniform vec4 u_layerView;
uniform sampler2D u_shards;
uniform int u_firstInstance;

flat out vec4 v_center;
flat out vec4 v_axis;
flat out vec4 v_normal;
flat out vec4 v_p01;
flat out vec4 v_p23;
flat out vec4 v_p4;
flat out vec4 v_topA;
flat out vec4 v_topB;
flat out vec4 v_topC;
flat out vec4 v_bottomA;
flat out vec4 v_bottomB;
flat out vec4 v_bottomC;

vec3 project(vec3 world) {
  vec3 offset = world - u_scene[1].xyz;
  float depth = max(dot(offset, u_scene[2].xyz), 0.05);
  float x = dot(offset, u_scene[3].xyz);
  float y = dot(offset, u_scene[4].xyz);
  return vec3(
    u_layerView.x * 0.5 + x * u_layerView.z / depth,
    u_layerView.y * 0.5 - y * u_layerView.z / depth,
    depth
  );
}

void main() {
  int inst = gl_InstanceID + u_firstInstance;
  vec4 a = texelFetch(u_shards, ivec2(0, inst), 0);
  vec4 b = texelFetch(u_shards, ivec2(1, inst), 0);
  vec4 c = texelFetch(u_shards, ivec2(2, inst), 0);
  vec4 d = texelFetch(u_shards, ivec2(3, inst), 0);
  vec4 e = texelFetch(u_shards, ivec2(4, inst), 0);
  vec4 f = texelFetch(u_shards, ivec2(5, inst), 0);
  vec3 center = a.xyz;
  float size = a.w;
  vec3 axis = normalize(b.xyz);
  vec3 normal = normalize(c.xyz);
  vec3 side = normalize(cross(normal, axis));

  v_center = vec4(0.0);
  v_axis = vec4(0.0);
  v_normal = vec4(0.0);
  v_p01 = vec4(0.0);
  v_p23 = vec4(0.0);
  v_p4 = vec4(0.0);
  v_topA = vec4(0.0);
  v_topB = vec4(0.0);
  v_topC = vec4(0.0);
  v_bottomA = vec4(0.0);
  v_bottomB = vec4(0.0);
  v_bottomC = vec4(0.0);

  vec3 middle = project(center);
  if (middle.z < 0.35 || size <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 0.5, 1.0);
    return;
  }

  int count = int(f.z);
  vec2 points[5] = vec2[5](d.xy, d.zw, e.xy, e.zw, f.xy);
  vec2 low = vec2(1e9);
  vec2 high = vec2(-1e9);
  vec2 tops[5] = vec2[5](vec2(0.0), vec2(0.0), vec2(0.0), vec2(0.0), vec2(0.0));
  vec2 bottoms[5] = vec2[5](vec2(0.0), vec2(0.0), vec2(0.0), vec2(0.0), vec2(0.0));
  for (int i = 0; i < 5; i += 1) {
    vec2 corner = points[min(i, count - 1)];
    vec3 onPlate = center + (axis * corner.x + side * corner.y) * size;
    vec3 top = project(onPlate + normal * b.w * size);
    vec3 bottom = project(onPlate - normal * b.w * size);
    tops[i] = top.xy;
    bottoms[i] = bottom.xy;
    low = min(low, min(top.xy, bottom.xy));
    high = max(high, max(top.xy, bottom.xy));
  }
  low -= vec2(2.0);
  high += vec2(2.0);
  vec2 corners[6] = vec2[6](
    vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0),
    vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 1.0)
  );
  vec2 pixel = mix(low, high, corners[gl_VertexID]);
  gl_Position = vec4(
    pixel.x / u_layerView.x * 2.0 - 1.0,
    pixel.y / u_layerView.y * 2.0 - 1.0,
    0.5,
    1.0
  );
  v_center = a;
  v_axis = vec4(axis, b.w);
  v_normal = vec4(normal, c.w);
  v_p01 = d;
  v_p23 = e;
  v_p4 = f;
  v_topA = vec4(tops[0], tops[1]);
  v_topB = vec4(tops[2], tops[3]);
  v_topC = vec4(tops[4], 0.0, 0.0);
  v_bottomA = vec4(bottoms[0], bottoms[1]);
  v_bottomB = vec4(bottoms[2], bottoms[3]);
  v_bottomC = vec4(bottoms[4], 0.0, 0.0);
}
`;

const SHARD_FS_COMMON = `#version 300 es
precision highp float;
precision highp int;

uniform vec4 u_scene[9];
uniform vec4 u_layerView;
uniform vec4 u_layerLook;

flat in vec4 v_center;
flat in vec4 v_axis;
flat in vec4 v_normal;
flat in vec4 v_p01;
flat in vec4 v_p23;
flat in vec4 v_p4;
flat in vec4 v_topA;
flat in vec4 v_topB;
flat in vec4 v_topC;
flat in vec4 v_bottomA;
flat in vec4 v_bottomB;
flat in vec4 v_bottomC;

out vec4 outColor;

float cross2(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}

float outlineCoverage(vec2 p, vec2 points[5], int count) {
  float area = 0.0;
  for (int i = 0; i < 5; i += 1) {
    if (i < count) {
      area += cross2(points[i], points[(i + 1) % count]);
    }
  }
  float orient = area > 0.0 ? 1.0 : -1.0;
  float distance = -1e9;
  for (int i = 0; i < 5; i += 1) {
    if (i < count) {
      vec2 a = points[i];
      vec2 edge = points[(i + 1) % count] - a;
      float span = length(edge);
      if (span > 1e-4) {
        vec2 n = vec2(edge.y, -edge.x) * (orient / span);
        distance = max(distance, dot(p - a, n));
      }
    }
  }
  return clamp(0.5 - distance, 0.0, 1.0);
}

struct Prism {
  vec2 points[5];
  int count;
  float halfThick;
};

struct Hit {
  float nearT;
  float farT;
  vec3 normal;
};

vec4 plane(Prism prism, int k) {
  if (k == 0) { return vec4(0.0, 0.0, 1.0, prism.halfThick); }
  if (k == 1) { return vec4(0.0, 0.0, -1.0, prism.halfThick); }
  vec2 a = prism.points[k - 2];
  vec2 b = prism.points[(k - 1) % prism.count];
  vec2 edge = b - a;
  vec2 n = normalize(vec2(edge.y, -edge.x));
  return vec4(n, 0.0, dot(n, a));
}

Hit trace(Prism prism, vec3 ro, vec3 rd) {
  Hit hit;
  hit.nearT = -1e9;
  hit.farT = 1e9;
  hit.normal = vec3(0.0, 0.0, 1.0);
  for (int k = 0; k < 7; k += 1) {
    if (k < prism.count + 2) {
      vec4 p = plane(prism, k);
      float denom = dot(p.xyz, rd);
      float gap = p.w - dot(p.xyz, ro);
      if (abs(denom) < 1e-7) {
        if (gap < 0.0) { hit.farT = -1e9; }
      } else {
        float t = gap / denom;
        if (denom < 0.0) {
          if (t > hit.nearT) {
            hit.nearT = t;
            hit.normal = p.xyz;
          }
        } else if (t < hit.farT) {
          hit.farT = t;
        }
      }
    }
  }
  return hit;
}

vec4 exitFrom(Prism prism, vec3 ro, vec3 rd) {
  float best = 1e9;
  vec3 normal = vec3(0.0, 0.0, -1.0);
  for (int k = 0; k < 7; k += 1) {
    if (k < prism.count + 2) {
      vec4 p = plane(prism, k);
      float denom = dot(p.xyz, rd);
      if (denom > 1e-6) {
        float t = (p.w - dot(p.xyz, ro)) / denom;
        if (t < best) {
          best = t;
          normal = p.xyz;
        }
      }
    }
  }
  return vec4(normal, max(best, 0.0));
}

float rectLight(vec3 r, vec3 dir, vec3 across, vec2 extent, float soft) {
  float facing = dot(r, dir);
  if (facing <= 0.0) { return 0.0; }
  vec3 up = cross(dir, across);
  float u = dot(r, across) / facing;
  float v = dot(r, up) / facing;
  float a = 1.0 - smoothstep(extent.x - soft, extent.x + soft, abs(u));
  float b = 1.0 - smoothstep(extent.y - soft, extent.y + soft, abs(v));
  return a * b;
}

const vec3 KEY_DIR = normalize(vec3(-0.28, 0.72, 0.64));
const vec3 KEY_ACROSS = normalize(vec3(0.92, 0.0, 0.4));
const vec3 LEFT_DIR = normalize(vec3(-0.86, 0.12, 0.5));
const vec3 LEFT_ACROSS = normalize(vec3(0.5, 0.0, 0.86));
const vec3 RIM_DIR = normalize(vec3(0.78, 0.22, -0.58));
const vec3 RIM_ACROSS = normalize(vec3(0.6, 0.0, 0.8));
const vec3 TOP_DIR = normalize(vec3(0.05, 0.94, -0.33));
const vec3 TOP_ACROSS = vec3(1.0, 0.0, 0.0);

float lobe(vec3 r, vec3 dir, float width) {
  return exp((dot(r, dir) - 1.0) / (width * width));
}

vec3 studio(vec3 r, float soft, vec3 accent, vec3 ink) {
  float sky = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(ink * 0.03, ink * 0.12 + accent * 0.03, smoothstep(0.25, 0.95, sky));
  col += mix(ink, vec3(1.0), 0.6) * lobe(r, KEY_DIR, 0.38) * 3.6;
  col += mix(accent, vec3(1.0), 0.2) * lobe(r, RIM_DIR, 0.34) * 3.4;
  col += vec3(1.0, 0.98, 1.0) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2(0.12, 0.8), 0.08 + soft) * 3.2;
  col += vec3(1.0, 0.98, 1.0) * rectLight(r, TOP_DIR, TOP_ACROSS, vec2(0.9, 0.1), 0.08 + soft) * 2.6;
  return col;
}

vec3 studioLight(vec3 r, float soft, vec3 accent) {
  vec3 ground = vec3(0.2, 0.2, 0.23);
  vec3 skyTone = vec3(0.97, 0.97, 0.99);
  vec3 col = mix(ground, skyTone, smoothstep(-0.08 - soft, 0.16 + soft, r.y));
  col = mix(col, vec3(0.55, 0.55, 0.6), lobe(r, vec3(0.0, -1.0, 0.0), 0.5) * 0.4);
  col += vec3(0.4) * rectLight(r, KEY_DIR, KEY_ACROSS, vec2(0.46, 0.3), 0.07 + soft);
  col -= vec3(0.55) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2(0.1, 0.85), 0.05 + soft);
  col -= vec3(0.45) * rectLight(r, RIM_DIR, RIM_ACROSS, vec2(0.12, 0.9), 0.05 + soft);
  return clamp(col, vec3(0.05), vec3(1.2));
}

float schlick(float cosine, float f0) {
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
}

vec3 rayFor(vec2 pixel) {
  float x = pixel.x - u_layerView.x * 0.5;
  float y = u_layerView.y * 0.5 - pixel.y;
  return normalize(u_scene[2].xyz * u_layerView.z + u_scene[3].xyz * x + u_scene[4].xyz * y);
}

struct Surface {
  float coverage;
  vec3 color;
  float alpha;
  float depth;
};

Surface shade(vec2 pixel) {
  vec3 center = v_center.xyz;
  float size = v_center.w;
  vec3 axis = v_axis.xyz;
  vec3 plateNormal = v_normal.xyz;
  vec3 side = normalize(cross(plateNormal, axis));
  Prism prism;
  prism.points = vec2[5](v_p01.xy, v_p01.zw, v_p23.xy, v_p23.zw, v_p4.xy);
  prism.count = int(v_p4.z);
  prism.halfThick = v_axis.w;

  vec3 eye = u_scene[1].xyz;
  mat3 toLocal = mat3(
    axis.x, side.x, plateNormal.x,
    axis.y, side.y, plateNormal.y,
    axis.z, side.z, plateNormal.z
  );
  mat3 fromLocal = mat3(axis, side, plateNormal);
  vec3 origin = toLocal * (eye - center) / size;

  vec3 rd = rayFor(pixel);
  vec3 ray = toLocal * rd;
  float denom = dot(ray, vec3(0.0, 0.0, 1.0));
  float flatT = -origin.z / (abs(denom) < 1e-4 ? 1e-4 : denom);
  vec2 flatPoint = origin.xy + ray.xy * flatT;
  float footprint = max(length(fwidth(flatPoint)) * 0.7, 1e-4);
  float softBase = clamp(length(fwidth(reflect(rd, plateNormal))) * 0.5, 0.0, 0.5);

  Hit primary = trace(prism, origin, ray);
  vec2 tops[5] = vec2[5](v_topA.xy, v_topA.zw, v_topB.xy, v_topB.zw, v_topC.xy);
  vec2 bottoms[5] = vec2[5](v_bottomA.xy, v_bottomA.zw, v_bottomB.xy, v_bottomB.zw, v_bottomC.xy);
  float coverage = max(outlineCoverage(pixel, tops, prism.count), outlineCoverage(pixel, bottoms, prism.count));

  Surface surface;
  float facing = origin.z > 0.0 ? 1.0 : -1.0;
  float capT = (facing * prism.halfThick - origin.z) / (abs(ray.z) < 1e-4 ? -1e-4 * facing : ray.z);
  bool missed = primary.nearT > primary.farT;
  float hitT = missed ? capT : primary.nearT;
  vec3 hitNormal = missed ? vec3(0.0, 0.0, facing) : primary.normal;
  surface.coverage = hitT > 0.0 ? coverage : 0.0;
  surface.color = vec3(0.0);
  surface.alpha = 0.0;
  surface.depth = 1.0;
  if (surface.coverage <= 0.0) { return surface; }
  vec3 mainRay = ray;

  vec3 local = origin + mainRay * hitT;
  vec3 worldRay = fromLocal * mainRay;
  float viewDepth = max(hitT * size * dot(worldRay, u_scene[2].xyz), 0.05);
  surface.depth = clamp(1.0 - 0.3 / viewDepth, 0.0, 1.0);

  float radius = max(prism.halfThick * 1.15, footprint * 2.5);
  vec3 n = hitNormal;
  float bevel = 0.0;
  if (abs(n.z) > 0.5) {
    float gap = 1e9;
    for (int k = 2; k < 7; k += 1) {
      if (k < prism.count + 2) {
        vec4 p = plane(prism, k);
        gap = min(gap, p.w - dot(p.xy, local.xy));
      }
    }
    vec2 toward = vec2(0.0);
    for (int k = 2; k < 7; k += 1) {
      if (k < prism.count + 2) {
        vec4 p = plane(prism, k);
        float g = p.w - dot(p.xy, local.xy);
        toward += p.xy * exp(-(g - gap) / (radius * 0.35));
      }
    }
    toward = normalize(toward);
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);
    float angle = bevel * bevel * 0.7853982;
    n = normalize(n * cos(angle) + vec3(toward, 0.0) * sin(angle));
  } else {
    float gap = prism.halfThick - abs(local.z);
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);
    float angle = bevel * bevel * 0.7853982;
    n = normalize(n * cos(angle) + vec3(0.0, 0.0, sign(local.z)) * sin(angle));
  }
  float bendRate = 1.8 / max(radius / footprint, 1.0);
  vec3 normal = normalize(fromLocal * n);
  vec3 view = -worldRay;
  vec3 reflected = reflect(worldRay, normal);
  float soft = softBase + bendRate * smoothstep(0.0, 0.25, bevel) * 1.2 + clamp(footprint * 0.6, 0.0, 0.5);
  float ndv = clamp(dot(normal, view), 0.0, 1.0);

  vec3 accent = u_scene[6].rgb;
  vec3 base = u_scene[5].rgb;
  vec3 world = center + fromLocal * local * size;
  float height = clamp(0.5 + world.y * 0.45, 0.0, 1.0);
  vec3 tone = mix(accent, base, height);
  vec3 body = mix(tone, mix(base, accent, 0.5), v_normal.w * 0.3);
  float mode = u_scene[8].x;
  bool lightMode = u_scene[4].w > 0.5;
  float wrap = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);

  vec3 color = vec3(0.0);
  float alpha = 1.0;
  bool chrome = mode > 0.5;
  if (lightMode) {
    vec3 env = studioLight(reflected, soft, accent);
    if (chrome) {
      color = env * mix(body, vec3(1.0), 0.6);
    } else {
      float fresnel = schlick(ndv, 0.05);
      float diffuse = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);
      alpha = clamp(0.32 + fresnel * 0.5 + (1.0 - abs(n.z)) * 0.5, 0.0, 1.0);
      color = mix(body, vec3(1.0), 0.15) * (0.5 + 0.4 * diffuse) * alpha + (env - vec3(0.78)) * fresnel * 0.8;
    }
  } else if (chrome) {
    vec3 env = studio(reflected, soft, accent, body);
    color = env * mix(body, vec3(1.0), 0.55) * 0.9 + body * 0.02;
  } else {
    float fresnel = schlick(ndv, 0.04);
    vec3 env = studio(reflected, soft, accent, body);
    vec3 light = vec3(0.0);
    vec3 cursor = local;
    vec3 direction = toLocal * refract(worldRay, normal, 1.0 / 1.5);
    float travelled = 0.0;
    float carry = 1.0 - fresnel;
    float through = 0.0;
    for (int bounce = 0; bounce < 3; bounce += 1) {
      vec4 outlet = exitFrom(prism, cursor, direction);
      travelled += outlet.w;
      cursor = cursor + direction * outlet.w;
      vec3 outward = outlet.xyz;
      vec3 escaped = refract(direction, -outward, 1.5);
      if (dot(escaped, escaped) > 0.0) {
        float leave = schlick(dot(direction, outward), 0.04);
        vec3 worldOut = normalize(fromLocal * escaped);
        vec3 absorb = exp(-(vec3(1.0) - body) * travelled * size * 22.0);
        float straight = smoothstep(0.97, 0.999, dot(worldOut, worldRay));
        float energy = carry * (1.0 - leave);
        light += studio(worldOut, soft * 2.0 + 0.04, accent, body) * absorb * energy * (1.0 - straight) * 2.0;
        through += energy * straight * (absorb.r + absorb.g + absorb.b) / 3.0;
        carry *= leave;
      }
      direction = reflect(direction, outward);
    }
    float edge = max(pow(1.0 - abs(n.z), 1.2), bevel * bevel * 0.85);
    vec3 glow = mix(mix(body, accent, 0.35), vec3(1.0), 0.28) * edge * (0.35 + 0.45 * wrap);
    color = env * fresnel * 0.85 + light * (1.0 - smoothstep(0.0, 0.6, bevel)) + body * 0.02 + glow;
    alpha = clamp(1.0 - through + edge * 0.25, 0.0, 1.0);
  }

  color *= (lightMode ? 1.0 : 1.3);
  float haze = smoothstep(3.5, 12.0, viewDepth) * u_layerLook.x;
  vec3 hazeColor = lightMode ? mix(base, vec3(1.0), 0.72) : mix(base, accent, 0.5) * 0.3;
  color = mix(color, hazeColor * alpha + color * 0.3, haze);
  float flash = v_p4.w;
  color += mix(accent, vec3(1.0), 0.35) * flash * (lightMode ? 0.0 : 0.5) * max(alpha, 0.35);
  alpha = max(alpha, flash * 0.45 * (lightMode ? 0.0 : 1.0));
  surface.color = color;
  surface.alpha = alpha;
  return surface;
}
`;

const SHARD_FS_SOLID = `${SHARD_FS_COMMON}
void main() {
  Surface surface = shade(gl_FragCoord.xy);
  if (surface.coverage < 0.999 || surface.alpha < 0.6) { discard; }
  outColor = vec4(surface.color, surface.alpha);
  gl_FragDepth = surface.depth;
}
`;

const SHARD_FS_EDGE = `${SHARD_FS_COMMON}
void main() {
  Surface surface = shade(gl_FragCoord.xy);
  if (surface.coverage <= 0.001 || (surface.coverage >= 0.9996 && surface.alpha >= 0.62)) { discard; }
  outColor = vec4(surface.color, surface.alpha) * surface.coverage;
  gl_FragDepth = surface.depth;
}
`;

const SHADOW_FS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D u_source;
uniform sampler2D u_depthMap;
uniform vec4 u_shadeInfo;
uniform vec4 u_shadeMore;

out vec4 outColor;

void main() {
  ivec2 bounds = textureSize(u_source, 0) - ivec2(1);
  ivec2 here = ivec2(gl_FragCoord.xy);
  vec4 color = texelFetch(u_source, here, 0);
  if (color.a <= 0.002 || u_shadeInfo.z <= 0.0) {
    outColor = color;
    return;
  }
  float depth = texelFetch(u_depthMap, here, 0).r;
  float east = texelFetch(u_depthMap, clamp(here + ivec2(1, 0), ivec2(0), bounds), 0).r;
  float west = texelFetch(u_depthMap, clamp(here - ivec2(1, 0), ivec2(0), bounds), 0).r;
  float south = texelFetch(u_depthMap, clamp(here + ivec2(0, 1), ivec2(0), bounds), 0).r;
  float north = texelFetch(u_depthMap, clamp(here - ivec2(0, 1), ivec2(0), bounds), 0).r;
  float limit = u_shadeMore.x * 0.5;
  float slopeX = clamp(abs(depth - west) < abs(east - depth) ? (depth - west) : (east - depth), -limit, limit);
  float slopeY = clamp(abs(depth - north) < abs(south - depth) ? (depth - north) : (south - depth), -limit, limit);
  float occlusion = 0.0;
  for (int i = 1; i <= 12; i += 1) {
    vec2 offset = -u_shadeInfo.xy * float(i);
    ivec2 probe = clamp(ivec2(gl_FragCoord.xy + offset), ivec2(0), bounds);
    float other = texelFetch(u_depthMap, probe, 0).r;
    float expected = depth + slopeX * offset.x + slopeY * offset.y;
    float closer = smoothstep(u_shadeMore.x * 0.6, u_shadeMore.x * 2.4, expected - other);
    float reach = 1.0 - float(i - 1) / 12.0;
    occlusion = max(occlusion, closer * reach * reach);
  }
  outColor = vec4(color.rgb * (1.0 - occlusion * u_shadeInfo.z), color.a);
}
`;

const LAYER_BLUR_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_uv;
uniform sampler2D u_source;
uniform vec4 u_spreadTexel;
out vec4 outColor;

void main() {
  float sigma = max(u_spreadTexel.z, 0.3);
  int reach = min(int(ceil(sigma * 2.6)), 20);
  vec4 total = textureLod(u_source, v_uv, 0.0);
  float weight = 1.0;
  for (int i = 1; i <= 20; i += 1) {
    if (i > reach) break;
    float fi = float(i);
    float w = exp(-(fi * fi) / (2.0 * sigma * sigma));
    vec2 o = u_spreadTexel.xy * fi;
    total += (textureLod(u_source, v_uv + o, 0.0) + textureLod(u_source, v_uv - o, 0.0)) * w;
    weight += 2.0 * w;
  }
  outColor = total / weight;
}
`;

const COMPOSITE_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_uv;
uniform sampler2D u_source;
uniform vec4 u_mixInfo;
out vec4 outColor;

void main() {
  outColor = textureLod(u_source, v_uv, 0.0) * u_mixInfo.x;
}
`;

const MARKER_VS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform vec4 u_scene[9];
uniform sampler2D u_markers;
uniform int u_firstInstance;

out vec2 v_local;
flat out vec4 v_shape;
flat out vec4 v_light;

void main() {
  int inst = gl_InstanceID + u_firstInstance;
  vec4 a = texelFetch(u_markers, ivec2(0, inst), 0);
  vec4 b = texelFetch(u_markers, ivec2(1, inst), 0);
  vec3 offset = a.xyz - u_scene[1].xyz;
  float depth = max(dot(offset, u_scene[2].xyz), 0.05);
  vec2 center = vec2(
    u_scene[0].x * 0.5 + dot(offset, u_scene[3].xyz) * u_scene[0].z / depth,
    u_scene[0].y * 0.5 - dot(offset, u_scene[4].xyz) * u_scene[0].z / depth
  );
  float pixel = u_scene[7].y;
  float size = u_scene[7].z * clamp(sqrt(u_scene[7].w / depth), 0.6, 1.3) * b.z;
  float blur = min(u_scene[2].w * abs(1.0 - u_scene[1].w / depth), u_scene[3].w) * 0.18;
  float frame = b.y;
  float reach = (frame > 0.001 ? size * 2.6 : size) + blur + 1.5 * pixel;
  vec2 corners[6] = vec2[6](
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0)
  );
  vec2 corner = corners[gl_VertexID % 6] * reach;
  v_local = vec2(0.0);
  v_shape = vec4(0.0);
  v_light = vec4(0.0);
  if (depth < 0.35 || a.w <= 0.002) {
    gl_Position = vec4(2.0, 2.0, 0.5, 1.0);
    return;
  }
  vec2 at = center + corner;
  gl_Position = vec4(
    at.x / u_scene[0].x * 2.0 - 1.0,
    at.y / u_scene[0].y * 2.0 - 1.0,
    0.5,
    1.0
  );
  v_local = corner;
  v_shape = vec4(size, blur, frame, pixel);
  v_light = vec4(b.x, a.w, 0.0, 0.0);
}
`;

const MARKER_FS = `#version 300 es
precision highp float;

uniform vec4 u_scene[9];
in vec2 v_local;
flat in vec4 v_shape;
flat in vec4 v_light;
out vec4 outColor;

float bar(float value, float edge, float soft) {
  return clamp((edge - value) / soft + 0.5, 0.0, 1.0);
}

void main() {
  float size = v_shape.x;
  float blur = v_shape.y;
  float frame = v_shape.z;
  float pixel = v_shape.w;
  vec2 q = abs(v_local);
  float soft = 1.0 + blur;
  float thick = 0.6 * pixel + blur * 0.5;
  float energy = (0.6 * pixel) / thick;
  float cover = 0.0;
  if (u_scene[7].x < 0.5) {
    float across = bar(q.x, size, soft) * bar(q.y, thick, soft);
    float down = bar(q.y, size, soft) * bar(q.x, thick, soft);
    cover = max(across, down) * energy;
  } else {
    cover = bar(length(v_local), size * 0.42 + blur * 0.3, soft) * mix(1.0, energy, 0.6);
  }
  if (frame > 0.001) {
    float edge = size * 2.3;
    float span = edge * 0.45;
    float line = 0.5 * pixel;
    float sides = bar(abs(q.x - edge), line, 1.0) * bar(edge - span - q.y, 0.0, 1.0) * bar(q.y - edge - line, 0.0, 1.0);
    float caps = bar(abs(q.y - edge), line, 1.0) * bar(edge - span - q.x, 0.0, 1.0) * bar(q.x - edge - line, 0.0, 1.0);
    cover = max(cover, max(sides, caps) * frame * 0.85);
  }
  float glow = v_light.x;
  float fade = v_light.y;
  vec3 tint = mix(u_scene[5].rgb, u_scene[6].rgb, 0.4);
  if (u_scene[4].w > 0.5) {
    float ink = (1.0 - exp(-glow * 1.6)) * 0.85 * cover * fade;
    outColor = vec4(mix(tint, u_scene[6].rgb, 0.5) * 0.55 * ink, ink);
    return;
  }
  float light = cover * glow * fade;
  vec3 color = (1.0 - exp(-mix(tint, vec3(1.0), 0.35) * light * 1.6)) * 1.4;
  outColor = vec4(color, max(max(color.r, color.g), color.b) * 0.8);
}
`;

const PREFILTER_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_uv;
uniform sampler2D u_source;
uniform vec4 u_bloomTexel;
out vec4 outColor;

vec3 bright(vec2 uv) {
  vec3 color = textureLod(u_source, uv, 0.0).rgb;
  float peak = max(max(color.r, color.g), color.b);
  return color * smoothstep(u_bloomTexel.z, u_bloomTexel.z + u_bloomTexel.w, peak);
}

void main() {
  vec2 o = u_bloomTexel.xy;
  vec3 total = bright(v_uv + vec2(o.x, o.y)) + bright(v_uv + vec2(-o.x, o.y)) + bright(v_uv + vec2(o.x, -o.y)) + bright(v_uv - o);
  outColor = vec4(total * 0.25, 0.0);
}
`;

const DOWNSAMPLE_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_uv;
uniform sampler2D u_source;
uniform vec4 u_bloomTexel;
out vec4 outColor;

void main() {
  vec2 o = u_bloomTexel.xy;
  vec4 color = textureLod(u_source, v_uv, 0.0) * 0.25;
  color += textureLod(u_source, v_uv + vec2(o.x, o.y), 0.0) * 0.1875;
  color += textureLod(u_source, v_uv + vec2(-o.x, o.y), 0.0) * 0.1875;
  color += textureLod(u_source, v_uv + vec2(o.x, -o.y), 0.0) * 0.1875;
  color += textureLod(u_source, v_uv - o, 0.0) * 0.1875;
  outColor = color;
}
`;

const BLUR_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_uv;
uniform sampler2D u_source;
uniform vec4 u_bloomTexel;
out vec4 outColor;

void main() {
  vec2 delta = u_bloomTexel.xy;
  vec4 color = textureLod(u_source, v_uv, 0.0) * 0.181862;
  color += (textureLod(u_source, v_uv + delta * 1.423135, 0.0) + textureLod(u_source, v_uv - delta * 1.423135, 0.0)) * 0.284316;
  color += (textureLod(u_source, v_uv + delta * 3.326702, 0.0) + textureLod(u_source, v_uv - delta * 3.326702, 0.0)) * 0.106598;
  color += (textureLod(u_source, v_uv + delta * 5.242989, 0.0) + textureLod(u_source, v_uv - delta * 5.242989, 0.0)) * 0.018156;
  outColor = color;
}
`;

const FINISH_FS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

in vec2 v_uv;
uniform sampler2D u_sceneTexture;
uniform sampler2D u_bloom0;
uniform sampler2D u_bloom1;
uniform sampler2D u_bloom2;
uniform sampler2D u_bloom3;
uniform vec4 u_finishInfo;
uniform vec4 u_finishPaper;
uniform vec4 u_finishMode;

out vec4 outColor;

float hash12(vec2 value) {
  vec2 p = fract(value * vec2(0.1031, 0.1030));
  vec2 mixed = p + dot(p, p.yx + 33.33);
  return fract((mixed.x + mixed.y) * mixed.x);
}

float smootherstep(float x) {
  float t = clamp(x, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  ivec2 texSize = textureSize(u_sceneTexture, 0);
  // Flip Y when presenting FBO texture (where y=0 is top) to WebGL default canvas (where y=0 is bottom)
  vec2 pixel = vec2(gl_FragCoord.x, float(texSize.y) - gl_FragCoord.y);
  ivec2 ipixel = clamp(ivec2(pixel), ivec2(0), texSize - ivec2(1));
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);

  vec4 scene = texelFetch(u_sceneTexture, ipixel, 0);
  float alpha = clamp(scene.a, 0.0, 1.0);
  float noise = hash12(floor(pixel) + vec2(u_finishInfo.y, u_finishInfo.y * 1.618)) - 0.5;
  float grain = 1.0 + noise * u_finishInfo.x;
  vec3 rgb = vec3(0.0);
  float a = alpha;
  if (u_finishMode.x > 0.5) {
    rgb = clamp(scene.rgb, vec3(0.0), vec3(alpha)) * grain;
  } else {
    vec3 halo = textureLod(u_bloom0, uv, 0.0).rgb * 0.4;
    halo += textureLod(u_bloom1, uv, 0.0).rgb * 0.3;
    halo += textureLod(u_bloom2, uv, 0.0).rgb * 0.2;
    halo += textureLod(u_bloom3, uv, 0.0).rgb * 0.1;
    halo = halo * u_finishInfo.z;
    rgb = (1.0 - exp(-max(scene.rgb, vec3(0.0)) * u_finishInfo.w)) * grain + halo / (1.0 + halo);
    a = max(alpha, max(max(rgb.r, rgb.g), rgb.b));
  }
  float vignette = u_finishMode.y;
  if (vignette > 0.0) {
    vec2 size = vec2(texSize);
    float reach = max(vignette * 0.5 * min(size.x, size.y), 1.0);
    vec2 fromEdge = min(pixel, size - pixel);
    float mask = smootherstep(fromEdge.x / reach) * smootherstep(fromEdge.y / reach);
    rgb *= mask;
    a *= mask;
  }
  rgb = clamp(rgb, vec3(0.0), vec3(max(a, 0.0)));
  if (u_finishPaper.a > 0.5) {
    outColor = vec4(u_finishPaper.rgb * (1.0 - a) + rgb, 1.0);
    return;
  }
  outColor = vec4(rgb, a);
}
`;

interface FboTarget {
  fbo: WebGLFramebuffer;
  color: WebGLTexture;
  depth: WebGLTexture | null;
  size: [number, number];
  hasDepth: boolean;
  resize: (next: [number, number]) => void;
  dispose: () => void;
}

export function createAeroWebGL2Backend(canvas: HTMLCanvasElement, initialSize: [number, number]) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
  if (!gl) {
    throw new Error('WebGL2 is not available');
  }

  // Enable floating-point render targets if supported (fallback to RGBA8 seamlessly if not)
  const hasFloatFbo =
    !!gl.getExtension('EXT_color_buffer_float') || !!gl.getExtension('EXT_color_buffer_half_float');
  gl.getExtension('OES_texture_float_linear');

  const colorInternalFormat = hasFloatFbo ? gl.RGBA16F : gl.RGBA8;
  const colorType = hasFloatFbo ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

  const compileShader = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create WebGL2 shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`WebGL2 shader compile error: ${log}`);
    }
    return shader;
  };

  const createProgram = (vsSource: string, fsSource: string) => {
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    const prog = gl.createProgram();
    if (!prog) throw new Error('Failed to create WebGL2 program');
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error(`WebGL2 program link error: ${log}`);
    }
    return prog;
  };

  const progSolid = createProgram(SHARD_VS, SHARD_FS_SOLID);
  const progEdge = createProgram(SHARD_VS, SHARD_FS_EDGE);
  const progShadow = createProgram(FULLSCREEN_VS, SHADOW_FS);
  const progLayerBlur = createProgram(FULLSCREEN_VS, LAYER_BLUR_FS);
  const progComposite = createProgram(FULLSCREEN_VS, COMPOSITE_FS);
  const progMarker = createProgram(MARKER_VS, MARKER_FS);
  const progPrefilter = createProgram(FULLSCREEN_VS, PREFILTER_FS);
  const progDownsample = createProgram(FULLSCREEN_VS, DOWNSAMPLE_FS);
  const progBlur = createProgram(FULLSCREEN_VS, BLUR_FS);
  const progFinish = createProgram(FULLSCREEN_VS, FINISH_FS);

  const emptyVao = gl.createVertexArray();

  const createTarget = (size: [number, number], withDepth = false): FboTarget => {
    const fbo = gl.createFramebuffer()!;
    const color = gl.createTexture()!;
    const depth = withDepth ? gl.createTexture()! : null;
    const currentSize: [number, number] = [Math.max(1, size[0]), Math.max(1, size[1])];

    const allocate = (w: number, h: number) => {
      gl.bindTexture(gl.TEXTURE_2D, color);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, colorInternalFormat, w, h, 0, gl.RGBA, colorType, null);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);

      if (withDepth && depth) {
        gl.bindTexture(gl.TEXTURE_2D, depth);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.DEPTH_COMPONENT24,
          w,
          h,
          0,
          gl.DEPTH_COMPONENT,
          gl.UNSIGNED_INT,
          null
        );
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    allocate(currentSize[0], currentSize[1]);

    return {
      fbo,
      color,
      depth,
      size: currentSize,
      hasDepth: withDepth,
      resize(next: [number, number]) {
        const w = Math.max(1, next[0]);
        const h = Math.max(1, next[1]);
        if (w === currentSize[0] && h === currentSize[1]) return;
        currentSize[0] = w;
        currentSize[1] = h;
        allocate(w, h);
      },
      dispose() {
        gl.deleteFramebuffer(fbo);
        gl.deleteTexture(color);
        if (depth) gl.deleteTexture(depth);
      },
    };
  };

  const outputSize: [number, number] = [Math.max(1, initialSize[0]), Math.max(1, initialSize[1])];
  canvas.width = outputSize[0];
  canvas.height = outputSize[1];

  const scene = createTarget(outputSize, false);
  const levelSize = (index: number): [number, number] => [
    Math.max(1, Math.round(outputSize[0] / 2 ** (index + 1))),
    Math.max(1, Math.round(outputSize[1] / 2 ** (index + 1))),
  ];
  const levels = Array.from({ length: BLOOM_LEVELS }, (_, index) => ({
    main: createTarget(levelSize(index), false),
    spare: createTarget(levelSize(index), false),
  }));

  const groupSize = (scale: number): [number, number] => [
    Math.max(1, Math.round(outputSize[0] * scale)),
    Math.max(1, Math.round(outputSize[1] * scale)),
  ];
  const groups = LAYER_SCALES.map((scale, index) => ({
    scale,
    layer: createTarget(groupSize(scale), true),
    shaded: createTarget(groupSize(scale), false),
    temp: createTarget(index === 0 ? [1, 1] : groupSize(scale), false),
    blurred: createTarget(index === 0 ? [1, 1] : groupSize(scale), false),
    softReady: index !== 0,
  }));

  // Data textures for shard instances (6 texels wide x capacity high, RGBA32F)
  // and marker instances (2 texels wide x markerCapacity high, RGBA32F)
  const shardTex = gl.createTexture()!;
  let shardTexCapacity = 0;
  const ensureShardTex = (needed: number) => {
    if (needed <= shardTexCapacity) return;
    shardTexCapacity = Math.max(needed, 256);
    gl.bindTexture(gl.TEXTURE_2D, shardTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 6, shardTexCapacity, 0, gl.RGBA, gl.FLOAT, null);
  };
  ensureShardTex(1300);

  const markerTex = gl.createTexture()!;
  let markerTexCapacity = 0;
  const ensureMarkerTex = (needed: number) => {
    if (needed <= markerTexCapacity) return;
    markerTexCapacity = Math.max(needed, 512);
    gl.bindTexture(gl.TEXTURE_2D, markerTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 2, markerTexCapacity, 0, gl.RGBA, gl.FLOAT, null);
  };
  ensureMarkerTex(512);

  const sceneUniformArray = new Float32Array(9 * 4);

  const bindTarget = (target: FboTarget | null, clearColor?: [number, number, number, number], clearDepth?: number) => {
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.size[0], target.size[1]);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, outputSize[0], outputSize[1]);
    }
    let mask = 0;
    if (clearColor) {
      gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
      mask |= gl.COLOR_BUFFER_BIT;
    }
    if (clearDepth !== undefined) {
      gl.depthMask(true);
      gl.clearDepth(clearDepth);
      mask |= gl.DEPTH_BUFFER_BIT;
    }
    if (mask !== 0) gl.clear(mask);
  };

  const bindTex = (unit: number, tex: WebGLTexture | null) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
  };

  return {
    get size(): [number, number] {
      return outputSize;
    },
    resize(next: [number, number]) {
      if (next[0] === outputSize[0] && next[1] === outputSize[1]) return;
      outputSize[0] = next[0];
      outputSize[1] = next[1];
      canvas.width = next[0];
      canvas.height = next[1];
      scene.resize(next);
      groups.forEach((group) => {
        group.layer.resize(groupSize(group.scale));
        group.shaded.resize(groupSize(group.scale));
        if (group.softReady) {
          group.temp.resize(groupSize(group.scale));
          group.blurred.resize(groupSize(group.scale));
        }
      });
      levels.forEach((level, index) => {
        level.main.resize(levelSize(index));
        level.spare.resize(levelSize(index));
      });
    },
    renderFrame(p: AeroWebGL2RenderParams) {
      // Pack scene[9]
      sceneUniformArray.set(p.view, 0);
      sceneUniformArray.set(p.eye, 4);
      sceneUniformArray.set(p.forward, 8);
      sceneUniformArray.set(p.right, 12);
      sceneUniformArray.set(p.up, 16);
      sceneUniformArray.set(p.shard, 20);
      sceneUniformArray.set(p.accent, 24);
      sceneUniformArray.set(p.marker, 28);
      sceneUniformArray.set(p.surface, 32);

      // Upload shard instance data
      ensureShardTex(p.shardCount);
      if (p.shardCount > 0) {
        gl.bindTexture(gl.TEXTURE_2D, shardTex);
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          6,
          p.shardCount,
          gl.RGBA,
          gl.FLOAT,
          p.upload.subarray(0, p.shardCount * 24)
        );
      }

      // Upload marker instance data
      if (p.markerTotal > 0) {
        ensureMarkerTex(p.markerTotal);
        gl.bindTexture(gl.TEXTURE_2D, markerTex);
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          2,
          p.markerTotal,
          gl.RGBA,
          gl.FLOAT,
          p.markerData.subarray(0, p.markerTotal * 8)
        );
      }

      gl.bindVertexArray(emptyVao);
      gl.disable(gl.CULL_FACE);

      const coc = p.depthOfField * outputSize[1] * 0.012;
      const cap = outputSize[1] * 0.02;

      for (let level = LEVELS - 1; level >= 0; level -= 1) {
        const depth = DEPTHS[level];
        const sigma = Math.min(coc * Math.abs(1 - SHARD_FOCUS / depth), cap);
        const groupIndex = sigma >= 2.2 ? 1 : 0;
        const group = groups[groupIndex];
        const soft = sigma >= 0.45;
        if (soft && !group.softReady) {
          group.softReady = true;
          group.temp.resize(groupSize(group.scale));
          group.blurred.resize(groupSize(group.scale));
        }
        const size = group.layer.size;
        const layerView: [number, number, number, number] = [
          size[0],
          size[1],
          p.focal * (size[0] / outputSize[0]),
          level,
        ];
        const layerLook: [number, number, number, number] = [p.lightMode ? 0.5 : 0.7, 0, 0, 0];
        const local = sigma * group.scale;
        const step = Math.max(0.6, 1.4 * (size[0] / Math.max(p.containerWidth, 1)));
        const shadowStrength = p.isGlass ? 0 : p.lightMode ? 0.32 : 0.62;

        if (p.counts[level] > 0) {
          // 1. Render solid & edge shards into group.layer
          bindTarget(group.layer, [0, 0, 0, 0], 1.0);
          gl.enable(gl.DEPTH_TEST);
          gl.depthFunc(gl.LESS);

          // Solid pass
          gl.depthMask(true);
          gl.disable(gl.BLEND);
          gl.useProgram(progSolid);
          gl.uniform4fv(gl.getUniformLocation(progSolid, 'u_scene'), sceneUniformArray);
          gl.uniform4fv(gl.getUniformLocation(progSolid, 'u_layerView'), layerView);
          gl.uniform4fv(gl.getUniformLocation(progSolid, 'u_layerLook'), layerLook);
          gl.uniform1i(gl.getUniformLocation(progSolid, 'u_firstInstance'), p.starts[level]);
          bindTex(0, shardTex);
          gl.uniform1i(gl.getUniformLocation(progSolid, 'u_shards'), 0);
          gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, p.counts[level]);

          // Edge pass
          gl.depthMask(false);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          gl.useProgram(progEdge);
          gl.uniform4fv(gl.getUniformLocation(progEdge, 'u_scene'), sceneUniformArray);
          gl.uniform4fv(gl.getUniformLocation(progEdge, 'u_layerView'), layerView);
          gl.uniform4fv(gl.getUniformLocation(progEdge, 'u_layerLook'), layerLook);
          gl.uniform1i(gl.getUniformLocation(progEdge, 'u_firstInstance'), p.starts[level]);
          bindTex(0, shardTex);
          gl.uniform1i(gl.getUniformLocation(progEdge, 'u_shards'), 0);
          gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, p.counts[level]);

          gl.disable(gl.DEPTH_TEST);
          gl.disable(gl.BLEND);

          // 2. Shadow pass into group.shaded
          bindTarget(group.shaded, [0, 0, 0, 0]);
          gl.useProgram(progShadow);
          bindTex(0, group.layer.color);
          gl.uniform1i(gl.getUniformLocation(progShadow, 'u_source'), 0);
          bindTex(1, group.layer.depth);
          gl.uniform1i(gl.getUniformLocation(progShadow, 'u_depthMap'), 1);
          gl.uniform4f(
            gl.getUniformLocation(progShadow, 'u_shadeInfo'),
            step * 0.55,
            step * 0.85,
            shadowStrength,
            0
          );
          gl.uniform4f(gl.getUniformLocation(progShadow, 'u_shadeMore'), 0.00045, 0, 0, 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3);

          // 3. Optional DoF blur X & Y
          if (soft) {
            bindTarget(group.temp, [0, 0, 0, 0]);
            gl.useProgram(progLayerBlur);
            bindTex(0, group.shaded.color);
            gl.uniform1i(gl.getUniformLocation(progLayerBlur, 'u_source'), 0);
            gl.uniform4f(gl.getUniformLocation(progLayerBlur, 'u_spreadTexel'), 1 / size[0], 0, local, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            bindTarget(group.blurred, [0, 0, 0, 0]);
            gl.useProgram(progLayerBlur);
            bindTex(0, group.temp.color);
            gl.uniform1i(gl.getUniformLocation(progLayerBlur, 'u_source'), 0);
            gl.uniform4f(gl.getUniformLocation(progLayerBlur, 'u_spreadTexel'), 0, 1 / size[1], local, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
          }
        }

        // 4. Composite markers + layer into scene
        bindTarget(scene, level === LEVELS - 1 ? [0, 0, 0, 0] : undefined);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        if (p.markerCounts[level] > 0) {
          gl.useProgram(progMarker);
          gl.uniform4fv(gl.getUniformLocation(progMarker, 'u_scene'), sceneUniformArray);
          gl.uniform1i(gl.getUniformLocation(progMarker, 'u_firstInstance'), p.markerStarts[level]);
          bindTex(0, markerTex);
          gl.uniform1i(gl.getUniformLocation(progMarker, 'u_markers'), 0);
          gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, p.markerCounts[level]);
        }

        if (p.counts[level] > 0) {
          gl.useProgram(progComposite);
          bindTex(0, soft ? group.blurred.color : group.shaded.color);
          gl.uniform1i(gl.getUniformLocation(progComposite, 'u_source'), 0);
          gl.uniform4f(gl.getUniformLocation(progComposite, 'u_mixInfo'), FADE[level], 0, 0, 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        gl.disable(gl.BLEND);
      }

      // 5. Bloom pyramid passes
      const blooming = p.glow > 0.001 && !p.lightMode;
      for (let index = 0; index < BLOOM_LEVELS; index += 1) {
        const level = levels[index];
        if (!blooming) {
          bindTarget(level.main, [0, 0, 0, 0]);
          continue;
        }
        const source = index === 0 ? scene : levels[index - 1].main;

        // Down / Prefilter
        bindTarget(level.main, [0, 0, 0, 0]);
        const downProg = index === 0 ? progPrefilter : progDownsample;
        gl.useProgram(downProg);
        bindTex(0, source.color);
        gl.uniform1i(gl.getUniformLocation(downProg, 'u_source'), 0);
        gl.uniform4f(
          gl.getUniformLocation(downProg, 'u_bloomTexel'),
          0.5 / source.size[0],
          0.5 / source.size[1],
          0.75,
          0.5
        );
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Horizontal Blur
        bindTarget(level.spare, [0, 0, 0, 0]);
        gl.useProgram(progBlur);
        bindTex(0, level.main.color);
        gl.uniform1i(gl.getUniformLocation(progBlur, 'u_source'), 0);
        gl.uniform4f(gl.getUniformLocation(progBlur, 'u_bloomTexel'), 1 / level.main.size[0], 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Vertical Blur
        bindTarget(level.main, [0, 0, 0, 0]);
        gl.useProgram(progBlur);
        bindTex(0, level.spare.color);
        gl.uniform1i(gl.getUniformLocation(progBlur, 'u_source'), 0);
        gl.uniform4f(gl.getUniformLocation(progBlur, 'u_bloomTexel'), 0, 1 / level.main.size[1], 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      // 6. Final Finish pass to screen canvas
      bindTarget(null, [0, 0, 0, 0]);
      gl.useProgram(progFinish);
      bindTex(0, scene.color);
      gl.uniform1i(gl.getUniformLocation(progFinish, 'u_sceneTexture'), 0);
      bindTex(1, levels[0].main.color);
      gl.uniform1i(gl.getUniformLocation(progFinish, 'u_bloom0'), 1);
      bindTex(2, levels[1].main.color);
      gl.uniform1i(gl.getUniformLocation(progFinish, 'u_bloom1'), 2);
      bindTex(3, levels[2].main.color);
      gl.uniform1i(gl.getUniformLocation(progFinish, 'u_bloom2'), 3);
      bindTex(4, levels[3].main.color);
      gl.uniform1i(gl.getUniformLocation(progFinish, 'u_bloom3'), 4);

      const paper = p.paper ?? [0, 0, 0];
      gl.uniform4f(
        gl.getUniformLocation(progFinish, 'u_finishInfo'),
        p.grain,
        Math.floor(p.clock * 24),
        blooming ? p.glow : 0,
        1.3
      );
      gl.uniform4f(
        gl.getUniformLocation(progFinish, 'u_finishPaper'),
        paper[0],
        paper[1],
        paper[2],
        p.paper ? 1 : 0
      );
      gl.uniform4f(
        gl.getUniformLocation(progFinish, 'u_finishMode'),
        p.lightMode ? 1 : 0,
        p.vignette,
        0,
        0
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      scene.dispose();
      levels.forEach((l) => {
        l.main.dispose();
        l.spare.dispose();
      });
      groups.forEach((g) => {
        g.layer.dispose();
        g.shaded.dispose();
        g.temp.dispose();
        g.blurred.dispose();
      });
      gl.deleteTexture(shardTex);
      gl.deleteTexture(markerTex);
      if (emptyVao) gl.deleteVertexArray(emptyVao);
      [
        progSolid,
        progEdge,
        progShadow,
        progLayerBlur,
        progComposite,
        progMarker,
        progPrefilter,
        progDownsample,
        progBlur,
        progFinish,
      ].forEach((p) => gl.deleteProgram(p));
    },
  };
}
