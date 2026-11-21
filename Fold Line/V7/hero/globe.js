/* ============================================================
   FOLD LINE V6 . THE PAPER GLOBE
   Sam's idea (17 Oct 2026), after the Orb Gallery (a sphere of cards that turns slowly): "in the middle of our five
   cards, fill the empty space with a rotating globe ... in the same style as the paper cut-out, no need for a realistic
   3D globe. But rotate, and we can recognise the countries and the continents. And a few pins of colour to match our
   types, yellow, green, blue ... the globe can have some masking around the edges, so it blends".

   One sphere, one shader. The land is card glued onto a navy paper ball: the shader cuts it from a distance field of
   the coast (hero/globe-data.js), raises it a hair above the water, draws its cut edge where the eye looks past it and
   the soft shadow it throws on the sea, and rules three water lines along every coast like an engraved chart. The
   graticule is printed faintly on the sea. The edge of the ball melts into the room instead of ending on a hard rim.
   The five treks are ball pins in the colour of their length. The rest of what the company runs are small paper dots.

   The globe turns to the trek in the light whenever the table turns, then drifts slowly east while the trek is shown.
   A click on a pin picks its trek. Classic script, no modules. hero/switch.js builds it at the table's centre.
   ============================================================ */
(function(){
'use strict';
const PI = Math.PI, D2R = PI/180;

// the other treks the company runs (the hero shows five of them): name, lat, lon, days. Dots only, no labels
const MORE = [
  ['Half Dome, Yosemite', 37.75, -119.53, 1],
  ['Mount Fuji', 35.36, 138.73, 1],
  ['Drakensberg Amphitheatre', -28.69, 28.93, 1],
  ['Laugavegur', 63.99, -19.06, 4],
  ['Toubkal', 31.06, -7.92, 2],
  ['Kinabalu', 6.08, 116.56, 2],
  ['Skyline Trail, Jasper', 52.8, -117.9, 3],
  ['Tour du Mont Blanc', 45.83, 6.86, 11],
  ['Overland Track', -41.64, 145.95, 6],
  ['Simien Mountains', 13.2, 38.0, 7]
];
// V7: the landing counts these with the five, so its cards say how many treks each length has
window.FOLD_GLOBE_MORE = MORE;

const VERT = `
  varying vec3 vP; varying vec3 vNw;
  void main(){
    vP = position; vNw = normalize(mat3(modelMatrix)*position);
    gl_Position = projectionMatrix*modelViewMatrix*vec4(position, 1.0);
  }`;
const FRAG = `
  uniform sampler2D uSdf, uTint; uniform float uScale, uH, uFade, uShadow, uTintK;
  uniform vec3 uCamO, uLightO, uOcean, uLand, uEdge, uInk;
  varying vec3 vP; varying vec3 vNw;
  const float PI = 3.141592653589793;
  vec2 gX, gY;
  vec2 uvOf(vec3 d){ return vec2(atan(d.x, d.z)*(0.5/PI) + 0.5, asin(clamp(d.y, -1.0, 1.0))/PI + 0.5); }
  // distance to the coast, in texels of the field at the equator, + inland
  float F(vec3 d){ return (textureGrad(uSdf, uvOf(normalize(d)), gX, gY).r*255.0 - 128.0)/uScale; }
  float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7)))*43758.5453); }
  float n3(vec3 p){
    vec3 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
    return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  // a fwidth that does not jump where longitude wraps round the back of the globe
  float lonW(vec3 d){
    float a = atan(d.x, d.z), b = atan(-d.x, -d.z);
    return min(fwidth(a), fwidth(b));
  }
  void main(){
    vec3 N = normalize(vP), V = normalize(uCamO - vP), L = normalize(uLightO);
    float ndv = dot(N, V);
    // the texture's mip level from gradients that do not jump at the date line
    vec2 uv = uvOf(N), uv2 = vec2(fract(uv.x + 0.5), uv.y);
    vec2 a1 = dFdx(uv), b1 = dFdy(uv), a2 = dFdx(uv2), b2 = dFdy(uv2);
    gX = vec2(abs(a1.x) < abs(a2.x) ? a1.x : a2.x, a1.y);
    gY = vec2(abs(b1.x) < abs(b2.x) ? b1.x : b2.x, b1.y);

    // the top of the land card, at the outer radius
    float s0 = F(N);
    float aa = max(fwidth(s0), 0.05);
    float top = smoothstep(-aa*0.7, aa*0.7, s0);

    // the ray on into the shell: the sea is the sphere 1 - uH
    float rb = 1.0 - uH, pv = ndv;
    float disc = pv*pv - (1.0 - rb*rb);
    float tEnd = disc > 0.0 ? pv - sqrt(disc) : 2.0*pv;
    // the card's cut edge, where the ray passes through land on its way down
    float wall = 0.0;
    for(int k = 1; k <= 5; k++){
      float s = F(vP - V*(tEnd*float(k)/5.0));
      wall = max(wall, smoothstep(-aa*0.7, aa*0.7, s));
    }
    // past the horizon the ray skims the land on the far side: that edge would light the rim, so it goes
    wall *= smoothstep(0.1, 0.32, ndv);
    // the sea under it
    vec3 B = normalize(vP - V*tEnd);
    float sB = F(B), off = -sB;
    float aB = max(fwidth(sB), 0.05);
    float ndl = dot(B, L);
    vec3 Lt = L - B*ndl;
    // the card floats a little above the sea, so its shadow falls away from the light, soft at the edge
    float sh = smoothstep(-3.5, 2.5, F(B + Lt*(uShadow/max(ndl, 0.3))));
    // three water lines along the coast, like an engraved chart
    float lines = 0.0;
    for(int k = 0; k < 3; k++){
      float at = 4.0 + float(k)*5.0;
      lines += (1.0 - smoothstep(0.2, 0.2 + aB*1.1, abs(off - at)))*(0.5 - float(k)*0.13);
    }
    lines *= step(0.0, off);
    // the graticule, every 30 degrees, printed faintly on the sea
    float lat = asin(clamp(B.y, -1.0, 1.0)), lon = atan(B.x, B.z), u = PI/6.0;
    float gLat = abs(fract(lat/u - 0.5) - 0.5)*u/max(fwidth(lat), 1e-5);
    float gLon = abs(fract(lon/u - 0.5) - 0.5)*u/max(lonW(B), 1e-5);
    float grat = max(1.0 - smoothstep(0.4, 1.3, gLat), (1.0 - smoothstep(0.4, 1.3, gLon))*smoothstep(0.12, 0.35, cos(lat)));
    float eq = 1.0 - smoothstep(0.5, 1.6, abs(lat)/max(fwidth(lat), 1e-5));

    // light: soft, wrapped, so the dark side still reads as paper
    float fib = n3(vP*140.0)*0.6 + n3(vP*420.0)*0.4;
    float dS = 0.38 + 0.62*max(ndl, 0.0);
    vec3 sea = uOcean*dS*(0.95 + fib*0.1);
    sea = mix(sea, uInk, (grat*0.13 + eq*0.1 + lines*0.42)*(0.5 + 0.5*dS));
    sea *= mix(0.5, 1.0, sh);
    float dT = 0.4 + 0.6*max(dot(N, L), 0.0);
    // the card's top: a lip of light along the cut, on the side that faces the lamp
    float lip = (1.0 - smoothstep(0.0, 1.6, s0))*top;
    vec3 land = uLand*dT*(0.94 + fib*0.12)*(1.0 + lip*0.14);
    // each continent's faint tint (Sam: "subtle but noticeable"): a chroma pair, so the paper keeps its light and only
    // its hue moves, and two continents blend where they meet
    vec2 tc = texture2D(uTint, uv).gb - 0.5;
    land *= 1.0 + vec3(1.402*tc.y, -0.344*tc.x - 0.714*tc.y, 1.772*tc.x)*uTintK;
    vec3 edge = uEdge*(0.32 + 0.5*max(ndl, 0.0));
    vec3 col = mix(sea, edge, wall*(1.0 - top));
    col = mix(col, land, top);

    // the mask: the ball's rim melts into the room, and its underside sinks into the shade of the table
    float rim = smoothstep(0.0, 0.62, ndv);
    float under = mix(0.42, 1.0, smoothstep(-0.85, 0.35, normalize(vNw).y));
    col *= mix(0.35, 1.0, rim)*under;
    float alpha = smoothstep(0.03, 0.42, ndv)*uFade;
    if(disc < 0.0) alpha *= max(top, wall);
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

// a matcap drawn on a canvas, so the pins look lacquered without the room's lights
let MATCAP = null;
function matcap(THREE){
  if(MATCAP) return MATCAP;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(46, 42, 2, 64, 64, 64);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.12, '#f2f5fa'); g.addColorStop(0.42, '#b9c1cc'); g.addColorStop(0.8, '#5b6472'); g.addColorStop(1, '#1d222b');
  x.fillStyle = '#1d222b'; x.fillRect(0, 0, 128, 128);
  x.beginPath(); x.arc(64, 64, 63, 0, 2*PI); x.fillStyle = g; x.fill();
  MATCAP = new THREE.CanvasTexture(c); MATCAP.colorSpace = THREE.SRGBColorSpace;
  return MATCAP;
}
const dirOf = (V3, lat, lon) => V3(Math.cos(lat*D2R)*Math.sin(lon*D2R), Math.sin(lat*D2R), Math.cos(lat*D2R)*Math.cos(lon*D2R));

window.FOLD_GLOBE = function(C, o){
  const { THREE, V3, kit, TREKS, lerp, smooth, seg, clamp01 } = C;
  const D = window.GLOBE_DATA;
  if(!D) return null;
  const PL = window.LOOK && window.LOOK.pal;
  const col = (h, f) => new THREE.Color(h || f);
  const root = new THREE.Group(); root.name = 'globe';
  const spin = new THREE.Group(); spin.rotation.order = 'XYZ'; root.add(spin);
  root.position.copy(o.at); root.scale.setScalar(o.r);

  // ---- the ball
  const tex = new THREE.Texture(); const img = new Image();
  img.onload = () => { tex.image = img; tex.needsUpdate = true; U.uFade.ready = 1; };
  img.src = D.src;
  tex.colorSpace = THREE.NoColorSpace; tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
  tex.anisotropy = Math.min(8, kit.renderer ? kit.renderer.capabilities.getMaxAnisotropy() : 4);
  // the continents' tint: small and soft, so no mipmaps, and no seam to worry about at the date line
  const ttex = new THREE.Texture(); const timg = new Image();
  timg.onload = () => { ttex.image = timg; ttex.needsUpdate = true; U.uTintK.value = 0.62; };   // an empty texture reads as black, a strong tint
  if(D.tint) timg.src = D.tint;
  ttex.colorSpace = THREE.NoColorSpace; ttex.wrapS = THREE.RepeatWrapping; ttex.wrapT = THREE.ClampToEdgeWrapping;
  ttex.minFilter = THREE.LinearFilter; ttex.magFilter = THREE.LinearFilter; ttex.generateMipmaps = false;
  const U = {
    uTint:{ value:ttex }, uTintK:{ value:0 },
    uSdf:{ value:tex }, uScale:{ value:D.scale }, uH:{ value:0.011 }, uShadow:{ value:0.026 }, uFade:{ value:0, ready:0 },
    uCamO:{ value:V3(0, 0, 5) }, uLightO:{ value:V3(0, 1, 1) },
    uOcean:{ value:col(o.ocean, '#1C3049') }, uLand:{ value:col(o.land, '#929FAE') }, uEdge:{ value:col(o.edge, '#DCE3EA') },
    uInk:{ value:col(o.ink, '#6E8BAE') }
  };
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 112), new THREE.ShaderMaterial({
    uniforms:U, vertexShader:VERT, fragmentShader:FRAG, transparent:true, depthWrite:true }));
  ball.renderOrder = 10; spin.add(ball);

  // ---- the glow behind it (Sam: "a subtle glow behind the globe so it illuminates around it, with some masking ... it
  //      feels like it's blending into the hero section"). A soft cold halo on a card that always faces the camera, set a
  //      little behind the ball so the ball hides its middle. It falls off like light, leans toward the lamp's side, and
  //      fades out toward the board, so it never ends on a line where it meets the table
  const GLOW = 1.85;
  const GU = { uCol:{ value:col(o.glow || (PL && PL.lampCold), '#9FB7FF') }, uI:{ value:0 }, uRim:{ value:1/GLOW },
    uFloor:{ value:0 }, uFadeH:{ value:1 } };
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(GLOW*2, GLOW*2), new THREE.ShaderMaterial({
    uniforms:GU, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    vertexShader:`varying vec2 vUv; varying float vY;
      void main(){ vUv = uv; vY = (modelMatrix*vec4(position, 1.0)).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position, 1.0); }`,
    fragmentShader:`uniform vec3 uCol; uniform float uI, uRim, uFloor, uFadeH; varying vec2 vUv; varying float vY;
      void main(){
        vec2 p = vUv*2.0 - 1.0; float d = length(p);
        float x = max(d - uRim*0.9, 0.0)/(1.0 - uRim*0.9);
        float g = exp(-x*x*7.0)*(1.0 - smoothstep(0.72, 1.0, d));
        g *= 0.8 + 0.2*dot(p/max(d, 1e-4), vec2(-0.35, 0.94));
        g *= smoothstep(uFloor, uFloor + uFadeH, vY);
        gl_FragColor = vec4(uCol*g*uI, 1.0);
        #include <colorspace_fragment>
      }` }));
  halo.renderOrder = 9; root.add(halo);
  // its colour is the colour of the book in the light (Sam: "the same colour of the book that is selected, so we have three
  // glows, blue, yellow and green"), eased over about a second as the table turns. Each is evened out to the blue's
  // brightness (the middle one of the five), so the ochre does not outshine and the green does not vanish, and lifted a little toward white so it reads as light
  const lum = (c) => 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;
  const GLOWC = TREKS.map((T, i) => new THREE.Color(kit.catOf(i).color).lerp(new THREE.Color(1, 1, 1), 0.12));
  const GREF = lum(GLOWC.slice().sort((a, b) => lum(a) - lum(b))[Math.floor(GLOWC.length/2)]);   // the middle one: the blue
  const glowK = { k:1, init:false };

  // ---- the pins: the five treks, in the colour of their length. the one in the light stands taller, with a ring
  const mc = matcap(THREE);
  const needleGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 1, 8); needleGeo.translate(0, 0.5, 0);
  const headGeo = new THREE.SphereGeometry(1, 24, 16);
  const ringGeo = new THREE.RingGeometry(0.62, 1, 48); ringGeo.rotateX(-PI/2);
  const dotGeo = new THREE.CircleGeometry(1, 24); dotGeo.rotateX(-PI/2);
  const needleMat = new THREE.MeshMatcapMaterial({ matcap:mc, color:0xb8c0cc, transparent:true });
  const up = V3(0, 1, 0);
  const place = (obj, lat, lon) => { const d = dirOf(V3, lat, lon); obj.position.copy(d); obj.quaternion.setFromUnitVectors(up, d); };
  const PINS = TREKS.map((T, i) => {
    const w = (T.waypoints && T.waypoints[0]) || {}, c = kit.catOf(i).color;
    const g = new THREE.Group(); place(g, w.lat || 0, w.lon || 0);
    const needle = new THREE.Mesh(needleGeo, needleMat); needle.scale.set(1, 0.13, 1);
    const head = new THREE.Mesh(headGeo, new THREE.MeshMatcapMaterial({ matcap:mc, color:new THREE.Color(c), transparent:true }));
    head.scale.setScalar(0.034); head.position.y = 0.13;
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color:new THREE.Color(c), transparent:true, depthWrite:false }));
    ring.position.y = 0.006; ring.scale.setScalar(0.001);
    for(const m of [needle, head, ring]){ m.renderOrder = 11; g.add(m); }
    spin.add(g);
    return { g, needle, head, ring, lat:w.lat || 0, lon:w.lon || 0, k:{ p:0, v:0 } };
  });
  const DOTS = MORE.map(([name, lat, lon, days]) => {
    const key = days <= 1 ? 'day' : days <= 4 ? 'multi' : 'exp', c = PL && PL.cats && PL.cats[key] ? PL.cats[key].color : '#c9d1db';
    const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color:new THREE.Color(c), transparent:true, depthWrite:false }));
    m.scale.setScalar(0.016); m.renderOrder = 11; place(m, lat, lon); m.position.multiplyScalar(1.0015);
    m.userData.name = name; spin.add(m);
    return m;
  });

  // ---- the turn: to the trek in the light, then a slow drift east. springs on yaw and pitch
  const st = { sel:-1, base:0, drift:0, yaw:{ p:0, v:0 }, pitch:{ p:0, v:0 }, init:false };
  const DRIFT = 2.2*D2R;                  // radians a second while a trek is shown
  // the picked pin settles a little below the middle and a little west, so its needle shows in profile, then drifts east
  // (elC: how far above the globe's centre the camera looks from, measured each frame)
  let elC = 25*D2R;
  const tiltFor = (lat) => Math.max(-55*D2R, Math.min(55*D2R, lat*D2R - (elC - 17*D2R))), WEST = -9*D2R;
  const _c = V3(), _l = V3(), _v = V3(), _d = V3(), _rw = V3(), _m = new THREE.Matrix4();
  const G = { root, PINS, DOTS, U };
  G.size = (r, at) => { o.r = r; o.at.copy(at); root.position.copy(at); };
  G.update = (t, dt, s) => {
    G.cam = s.cam;
    root.updateWorldMatrix(true, false); root.getWorldPosition(_rw);
    _c.copy(s.cam.position).sub(_rw); elC = Math.asin(Math.max(-1, Math.min(1, _c.y/Math.max(_c.length(), 1e-6))));
    const P = PINS[s.sel] || PINS[0];
    if(!st.init){ st.init = true; st.sel = s.sel; st.yaw.p = -P.lon*D2R + WEST - 50*D2R; st.pitch.p = tiltFor(P.lat); st.base = -P.lon*D2R + WEST; }
    if(s.sel !== st.sel){
      st.sel = s.sel;
      let b = -P.lon*D2R + WEST; const cur = st.yaw.p;
      while(b - cur > PI) b -= 2*PI; while(b - cur < -PI) b += 2*PI;
      st.base = b; st.drift = 0;
    }
    if(!C.REDUCED && s.f > 0.5) st.drift += dt*DRIFT;
    const h = Math.min(dt, 0.034);
    if(C.REDUCED){ st.yaw.p = st.base; st.pitch.p = tiltFor(P.lat); }
    else {
      C.spring(st.yaw, st.base + st.drift, s.k, s.c, h);
      C.spring(st.pitch, tiltFor(P.lat), s.k, s.c, h);
    }
    // V7: the pocket's big globe is turned by the page, a fifth at a time (sections/stations.js)
    if(s.quat) spin.quaternion.copy(s.quat); else spin.rotation.set(st.pitch.p, st.yaw.p, 0);
    // a slow breath, so it floats
    root.position.y = o.at.y + (C.REDUCED ? 0 : Math.sin(t*0.55)*0.05);
    root.scale.setScalar(o.r*(0.93 + 0.07*s.f));
    root.visible = s.f > 0.002;
    // the camera and the lamp in the ball's own space
    root.updateMatrixWorld(true);
    _m.copy(ball.matrixWorld).invert();
    U.uCamO.value.copy(_c.copy(s.cam.position).applyMatrix4(_m));
    U.uLightO.value.copy(_l.copy(o.light).transformDirection(_m));
    U.uFade.value = s.f*U.uFade.ready;
    // the halo faces the camera from just behind the ball
    halo.quaternion.copy(s.cam.quaternion);
    halo.position.copy(s.cam.position).sub(_rw).normalize().multiplyScalar(-0.35);
    GU.uFloor.value = o.floor + o.r*0.1; GU.uFadeH.value = o.r*1.35;
    // (a colour dimmer than the blue gets a stronger lift: green light all but vanishes in a navy room)
    const gc = GLOWC[s.sel] || GLOWC[0], gr = GREF/Math.max(lum(gc), 1e-4), gk = gr > 1 ? Math.pow(gr, 2.4) : gr;
    if(!glowK.init || C.REDUCED){ GU.uCol.value.copy(gc); glowK.k = gk; glowK.init = true; }
    else { const e = 1 - Math.exp(-dt*3.2); GU.uCol.value.lerp(gc, e); glowK.k += (gk - glowK.k)*e; }
    GU.uI.value = (o.glowI || 0.08)*glowK.k*s.f*U.uFade.ready;
    // the pins: the picked one stands taller and wears a ring
    // and every pin and dot fades as the globe turns it away, so none stands out past the rim like a satellite
    _v.copy(U.uCamO.value).normalize();
    const facing = (p) => smooth(seg(_d.copy(p).normalize().dot(_v), 0.35, 0.65));
    PINS.forEach((Q, i) => {
      C.spring(Q.k, i === s.sel ? 1 : 0, 90, 14, h);
      const k = clamp01(Q.k.p), lift = 1 + 0.55*Q.k.p, a = facing(Q.g.position)*s.f;
      Q.needle.scale.set(1, 0.12*lift, 1); Q.head.position.y = 0.12*lift; Q.head.scale.setScalar(0.032*(1 + 0.6*Q.k.p));
      const pulse = (t*0.5) % 1;
      Q.ring.scale.setScalar(0.001 + 0.085*k*(1 + 0.55*smooth(pulse)));
      Q.ring.material.opacity = 0.8*k*(1 - pulse*0.9)*a;
      Q.head.material.opacity = a; Q.needle.material.opacity = a;
      Q.g.visible = a > 0.01;
    });
    DOTS.forEach(m => { const a = facing(m.position)*s.f; m.material.opacity = 0.9*a; m.visible = a > 0.01; });
  };
  // a pin under the pointer, for a click
  const ray = new THREE.Raycaster(), _n = new THREE.Vector2();
  G.pinAt = (nx, ny, cam) => {
    if(!root.visible || U.uFade.value < 0.5) return -1;
    _n.set(nx, ny); ray.setFromCamera(_n, cam);
    let best = -1, bd = 1e9;
    PINS.forEach((Q, i) => {
      const p = Q.head.getWorldPosition(V3()), d = ray.ray.distanceToPoint(p);
      const r = o.r*0.06, front = p.clone().sub(root.position).dot(cam.position.clone().sub(root.position)) > 0;
      if(front && d < r && d < bd){ bd = d; best = i; }
    });
    return best;
  };
  window.FOLD_GLOBE.last = G;   // for the checks in tools/hero-inspect.mjs
  return G;
};
})();
