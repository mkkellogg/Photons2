import * as THREE from 'three';
import { Renderer } from '../Renderer.js';
import { ParticleStateAttributeArray } from './ParticleStateAttributeArray.js';

export class AnimatedSpriteRenderer extends Renderer {

    constructor() {
        super();
        this.particleStateArray = null;
        this.material = null;
        this.mesh = null;
    }

    getParticleStateArray() {
        return this.particleStateArray;
    }

    init(particleCount) {
        if (super.init(particleCount)) {
            this.particleStateArray = new ParticleStateAttributeArray();
            this.particleStateArray.init(particleCount);
            this.material = AnimatedSpriteRenderer.createMaterial(null, null, null, true, false);
            this.mesh = new THREE.Mesh(this.particleStateArray.getGeometry(), this.material);
        }
    }

    dispose() {
        this.particleStateArray.dispose();
    }

    static createMaterial(vertexShader, fragmentShader, customUniforms, useWebGL2, useLogarithmicDepth) {

        customUniforms = customUniforms || {};
        customUniforms.particleTexture = { type: 't', value: null };
        customUniforms.cameraaxisx = {type: 'v3', value: new THREE.Vector3()};
        customUniforms.cameraaxisy = {type: 'v3', value: new THREE.Vector3()};
        customUniforms.cameraaxisz = {type: 'v3', value: new THREE.Vector3()};

        vertexShader = vertexShader || AnimatedSpriteRenderer.Shader.getVertexShader(useLogarithmicDepth);
        fragmentShader = fragmentShader ||
                         AnimatedSpriteRenderer.Shader.getFragmentShader(useWebGL2, useLogarithmicDepth);

        return new THREE.ShaderMaterial({
            uniforms: customUniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            alphaTest: 0.5,
            blending: THREE.NormalBlending,
            depthTest: true,
            depthWrite: false
        } );

    }

    static Shader = {

        get VertexVars() {
            return [
                'attribute vec4 customColor;',
                'attribute vec2 size;',
                'attribute float rotation;',
                'attribute float customIndex;',
                'varying vec2 vUV;',
                'varying vec4 vColor;',
                'uniform vec3 cameraaxisx;',
                'uniform vec3 cameraaxisy;',
                'uniform vec3 cameraaxisz;',
            ].join('\n');
        },

        get FragmentVars() {
            return [
                'varying vec2 vUV;',
                'varying vec4 vColor;',
                'uniform sampler2D particleTexture;',
            ].join('\n');
        },

        get ParticleVertexQuadPositionFunction() {
            return [
                'vec4 getQuadPosition() {',
                    'vec3 axisX = cameraaxisx;',
                    'vec3 axisY = cameraaxisy;',
                    'vec3 axisZ = cameraaxisz;',

                    'axisX *= cos( rotation );',
                    'axisY *= sin( rotation );',

                    'axisX += axisY;',
                    'axisY = cross( axisZ, axisX );',

                    'vec3 edge = vec3( 2.0, customIndex, 3.0 );',
                    'vec3 test = vec3( customIndex, 0.5, customIndex );',
                    'vec3 result = step( edge, test );',

                    'float xFactor = -1.0 + ( result.x * 2.0 );',
                    'float yFactor = -1.0 + ( result.y * 2.0 ) + ( result.z * 2.0 );',

                    'axisX *= size.x * xFactor;',
                    'axisY *= size.y * yFactor;',

                    'return ( modelMatrix * vec4( position, 1.0 ) ) + vec4( axisX + axisY, 0.0 );',
                '}',
            ].join('\n');
        },

        getVertexShader: function(useLogarithmicDepth) {
            let shader = [
                '#include <common>',
                this.VertexVars,
                this.ParticleVertexQuadPositionFunction,
            ].join('\n');

            if (useLogarithmicDepth) shader += '  \n #include <logdepthbuf_pars_vertex> \n';

            shader += [
                'void main() { ',
                    'vColor = customColor;',
                    'vUV = uv;',
                    'vec4 quadPos = getQuadPosition();',
                    'gl_Position = projectionMatrix * viewMatrix * quadPos;',
            ].join('\n');

            if (useLogarithmicDepth) shader += '   \n  #include <logdepthbuf_vertex> \n';

            shader += '} \n';

            return shader;
        },

        getFragmentShader: function(useWebGL2, useLogarithmicDepth) {

            let shader ='#include <common> \n' + this.FragmentVars + '\n';

            if (useLogarithmicDepth) shader += '  \n #include <logdepthbuf_pars_fragment> \n';

            shader += 'void main() { \n';

            if (useLogarithmicDepth) shader += '    \n  #include <logdepthbuf_fragment> \n';

            if (useWebGL2) {
                shader += 'vec4 textureColor = texture( particleTexture,  vUV ); \n';
            } else {
                shader += 'vec4 textureColor = texture2D( particleTexture,  vUV ); \n';
            }

            shader += [
                    'gl_FragColor = vColor * textureColor;',
                '}'
            ].join('\n');
            return shader;
        }
    };

}
