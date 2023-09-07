import * as THREE from 'three';

const fogMaterialUniforms = THREE.UniformsUtils.merge([
    {
        color: {value: new THREE.Color(0xBBBBBB)},
        opacity: {value: 1.0}
    }
]);

const fogMaterialVertexShader = [
"  #include <common> \n",
"  #include <logdepthbuf_pars_vertex> \n",
"  out vec2 vUv; \n",
"  void main() {\n",
"       vUv = uv - vec2(0.5, 0.5); \n",
"       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); \n",
"       #include <logdepthbuf_vertex> \n",
"  }\n"
].join('');

let fogMaterialFragmentShader = [
"  precision highp float; \n",
"  uniform vec3 color; \n",
"  uniform float opacity; \n",
"  in vec2 vUv; \n",
"  #include <common> \n",
"  #include <logdepthbuf_pars_fragment> \n",
"  void main() {\n",
"    #include <logdepthbuf_fragment> \n",
"    const float inThreshold = 0.06; \n",
"    const float inFadeRange = 0.02; \n",
"    const float outThreshold = 0.16; \n",
"    const float outFadeRange = 0.12; \n",
"    const float thresholdMid = (inThreshold + outThreshold) / 2.0; \n",
"    float distFromCenter = length(vUv); \n",
"    float inOpacity = pow(clamp(clamp(distFromCenter - inThreshold, 0.0, 1.0) / inFadeRange, 0.0, 1.0), 1.0); \n",
"    float outOpacity = pow(1.0 - clamp(clamp(distFromCenter - outThreshold, 0.0, 1.0) / outFadeRange, 0.0, 1.0), 1.0); \n",
"    float midTest = step(distFromCenter, thresholdMid); \n",
"    float fadeOpacity = midTest * inOpacity + (1.0 - midTest) * outOpacity; \n",
"    gl_FragColor = vec4(color.rgb, fadeOpacity * opacity); \n",
"  }\n",
].join('');

export class FogMaterial extends THREE.ShaderMaterial {

    constructor() {
        super({'uniforms': fogMaterialUniforms, 'vertexShader': fogMaterialVertexShader, 'fragmentShader': fogMaterialFragmentShader});
    }

    setColor (color) {
        this.uniforms.color.value.copy(color);
        this.uniformsNeedUpdate = true;
    }
      
    setOpacity (opacity) {
        this.uniforms.opacity.value = opacity;
        this.uniformsNeedUpdate = true;
    }

}
