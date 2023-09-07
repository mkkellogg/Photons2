import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { ParticleStateAttributeArray } from './ParticleStateAttributeArray.js';

export class AnimatedSpriteRenderer extends Renderer {

    constructor(atlas, interpolateAtlasFrames) {
        super();
        this.particleStateArray = null;
        this.material = null;
        this.mesh = null;
        this.atlas = atlas;
        this.interpolateAtlasFrames = !!interpolateAtlasFrames;
    }

    setOwner(owner) {
        super.setOwner(owner);
    }

    getParticleStateArray() {
        return this.particleStateArray;
    }

    init(particleCount) {
        if (super.init(particleCount)) {
            this.particleStateArray = new ParticleStateAttributeArray();
            this.particleStateArray.init(particleCount);
            this.material = this.createMaterial(null, null, null, true, false);
            this.mesh = new THREE.Mesh(this.particleStateArray.getGeometry(), this.material);
            this.owner.add(this.mesh);
        }
    }

    dispose() {
        this.particleStateArray.dispose();
    }

    createMaterial(vertexShader, fragmentShader, customUniforms, useWebGL2, useLogarithmicDepth) {

        let shaderAtlas = [...Array(16).keys()].map(i => new THREE.Vector4());
        if (this.atlas) {
            for (let i = 0; i < this.atlas.getTileArrayCount(); i++) {
                const tileArray = this.atlas.getTileArray(i);
                shaderAtlas[i] = new THREE.Vector4(tileArray.x, tileArray.y, tileArray.width, tileArray.height);
            }
        }

        const atlasTexture = this.atlas ? this.atlas.getTexture() : null;
        const interpolateAtlasFrames = this.interpolateAtlasFrames;

        const baseUniforms = {
            'atlasTileArray': {
                'type': 'v4v',
                'value': shaderAtlas
            },
            'atlasTexture': {
                'type': 't',
                'value': atlasTexture
            },
            'interpolateAtlasFrames': {
                'value': interpolateAtlasFrames
            },
            'uvOffset': {
                'type': 'v2',
                'value': new THREE.Vector2()
            },
        };

        customUniforms = customUniforms || {};
        Object.assign(customUniforms, baseUniforms);

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
            blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
            blendSrcAlpha: THREE.SrcAlphaFactor,
            depthTest: true,
            depthWrite: false
        } );

    }

    static Shader = {

        get VertexVars() {
            return [
                'const int MAX_ATLAS_TILE_ARRAYS = 16; \n',
                'uniform vec4 atlasTileArray[MAX_ATLAS_TILE_ARRAYS]; \n',
                'uniform int interpolateAtlasFrames; \n',
                'attribute float customIndex;\n',
                'attribute vec4 worldPosition;\n',
                'attribute float rotation;\n',
                'attribute vec2 size;\n',
                'attribute vec4 sequenceElement;\n',
                'attribute vec3 color;\n',
                'attribute float alpha;\n',
                'varying vec2 vUV1;\n',
                'varying vec2 vUV2;\n',
                'varying vec3 vFragColor;\n',
                'varying float vFragAlpha;\n',
                'varying float vSequenceElementT; \n',
            ].join('\n');
        },

        get FragmentVars() {
            return [
                'uniform int interpolateAtlasFrames; \n',
                'uniform sampler2D atlasTexture;\n',
                'uniform vec2 uvOffset;\n',
                'varying vec2 vUV1;\n',
                'varying vec2 vUV2;\n',
                'varying vec3 vFragColor;\n',
                'varying float vFragAlpha;\n',
                'varying float vSequenceElementT;\n',
            ].join('\n');
        },

        getVertexShader: function(useLogarithmicDepth) {
            let shader = [
                '#include <common>',
                this.VertexVars,
            ].join('\n');

            if (useLogarithmicDepth) shader += '  \n #include <logdepthbuf_pars_vertex> \n';

            shader += [

                'void getUV(in int sequenceElement, in int sequenceNumber, in vec4 atlasTiles, out vec2 uv) { \n',
                '   float atlasTileWidth = atlasTiles.z; \n',
                '   float atlasTileHeight = atlasTiles.w; \n',
                '   float atlasTileX = atlasTiles.x; \n',
                '   float atlasTileY = atlasTiles.y; \n',
                '   int firstRowSections = int((1.0 - atlasTileX) / atlasTileWidth); \n',
                '   int maxRowSections = int(1.0 / atlasTileWidth); \n',

                '   float firstRowX = atlasTileX + atlasTileWidth * float(sequenceElement); \n',
                '   float firstRowY = 1.0 - (atlasTileY + atlasTileHeight); \n',

                '   int nRowSequenceElement = sequenceElement - firstRowSections; \n',
                '   float SNOverHS = float(nRowSequenceElement) / float(maxRowSections);\n',
                '   int nRowYTile = int(SNOverHS);\n',
                '   int nRowXTile = int((SNOverHS - float(nRowYTile)) * float(maxRowSections));\n',
                '   float nRowX = float(nRowXTile) * atlasTileWidth;\n',
                '   float nRowY = 1.0 - ((float(nRowYTile) + 1.0) * (atlasTileHeight) + atlasTileY + atlasTileHeight);\n',

                '   float nRow = step(float(firstRowSections), float(sequenceElement)); \n',
                '   uv.x = nRow * nRowX + (1.0 - nRow) * firstRowX; \n',
                '   uv.y = nRow * nRowY + (1.0 - nRow) * firstRowY; \n',
                '} \n',

                'void main()\n',
                '{\n',

                '   const vec2 right = vec2(1.0, 0.0);\n',
                '   const vec2 up = vec2(0.0, 1.0);\n',
                '   const vec2 left = vec2(-1.0, 0.0);\n',
                '   const vec2 down = vec2(0.0, -1.0);\n',

                '   const vec2 uRight = vec2(1.0, 1.0);\n',
                '   const vec2 uLeft = vec2(-1.0, 1.0);\n',
                '   const vec2 dLeft = vec2(-1.0, -1.0);\n',
                '   const vec2 dRight = vec2(1.0, -1.0);\n',

                '   vec4 viewPosition = viewMatrix * worldPosition;\n',
                '   float sequenceElementF = sequenceElement.x;\n',
                '   int sequenceNumber = int(sequenceElement.y);\n',
                '   int sequenceStart = int(sequenceElement.z);\n',
                '   int sequenceLength = int(sequenceElement.w);\n',
                '   vec4 atlasTiles = atlasTileArray[sequenceNumber]; \n',

                '   vec2 uv1; \n',
                '   vec2 uv2; \n',
                '   vSequenceElementT = sequenceElementF - float(int(sequenceElementF)); \n',
                '   int firstSequenceElement = int(sequenceElementF); \n',
                '   int secondSequenceElement = clamp(firstSequenceElement + 1, sequenceStart, sequenceStart + sequenceLength - 1); \n',
                '   getUV(firstSequenceElement, sequenceNumber, atlasTiles, uv1); \n',
                '   if (interpolateAtlasFrames == 1 && firstSequenceElement != secondSequenceElement) { \n ',
                '       getUV(secondSequenceElement, sequenceNumber, atlasTiles, uv2); \n',
                '   } \n',
                '   float atlasTileWidth = atlasTiles.z; \n',
                '   float atlasTileHeight = atlasTiles.w; \n',

                '   float rotMag = rotation; \n',
                '   mat2 rotMat = mat2(cos(rotMag), -sin(rotMag), sin(rotMag), cos(rotMag)) * mat2(size.x, 0.0, 0.0, size.y);\n',

                '   float rightSide = step(2.0, customIndex); \n',
                '   vec2 upperSideStep = step(vec2(customIndex, 3.0), vec2(0.0, customIndex));\n',
                '   float upperSide = upperSideStep.x + upperSideStep.y;\n',
                '   float uvXOffset = atlasTileWidth * rightSide; \n',
                '   float uvYOffset = atlasTileHeight * upperSide; \n',

                '   vec4 rotVecStep = step(vec4(customIndex, customIndex, 3.0, 2.0), vec4(0.0, 1.0, customIndex, customIndex)); \n',

                '   float uLeftV = rotVecStep.x; \n',
                '   float dLeftV = rotVecStep.y - rotVecStep.x; \n',
                '   float uRightV = rotVecStep.z; \n',
                '   float dRightV = rotVecStep.w - rotVecStep.z; \n',

                '   vec2 rotVec = uLeft * uLeftV + dLeft * dLeftV + dRight * dRightV + uRight * uRightV; \n',

                '   gl_Position = projectionMatrix * (vec4(rotMat * rotVec, 0.0, 0.0) + viewPosition);\n',
                '   vUV1 = vec2(uv1.x + uvXOffset, uv1.y + uvYOffset);\n',
                '   vUV2 = vec2(uv2.x + uvXOffset, uv2.y + uvYOffset);\n',
                '   vFragColor = color; \n',
                '   vFragAlpha = alpha; \n',

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
                shader += [
                    '   vec4 color1 = texture(atlasTexture, vUV1 + uvOffset) * vec4(vFragColor, 1.0);\n',
                    '   vec4 color2 = color1; \n',
                    '   if (interpolateAtlasFrames == 1) color2 = texture(atlasTexture, vUV2 + uvOffset) * vec4(vFragColor, 1.0);\n',
                    '   gl_FragColor = mix(color1, color2, vSequenceElementT);\n',
                    '   gl_FragColor.a *= vFragAlpha; \n'
                ].join('\n');
            } else {
                shader += [
                    '   vec4 color1 = texture2D(atlasTexture, vUV1 + uvOffset) * vec4(vFragColor, 1.0);\n',
                    '   vec4 color2 = color1; \n',
                    '   if (interpolateAtlasFrames == 1) color2 = texture(atlasTexture, vUV2 + uvOffset) * vec4(vFragColor, 1.0);\n',
                    '   gl_FragColor = mix(color1, color2, vSequenceElementT);\n',
                    '   gl_FragColor.a *= vFragAlpha; \n'
                ].join('\n');
            }

            shader += '}\n';

            return shader;
        }
    };

}
