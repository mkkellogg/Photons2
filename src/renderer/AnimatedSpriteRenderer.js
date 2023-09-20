import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { ParticleStateAttributeArray } from './ParticleStateAttributeArray.js';
import { Atlas } from './Atlas.js';

export class AnimatedSpriteRenderer extends Renderer {

    constructor(atlas, interpolateAtlasFrames = false, blending = THREE.NormalBlending) {
        super();
        this.particleStateArray = null;
        this.material = null;
        this.mesh = null;
        this.atlas = atlas;
        this.interpolateAtlasFrames = interpolateAtlasFrames;
        this.blending = blending;
    }

    setOwner(owner) {
        super.setOwner(owner);
    }

    getParticleStateArray() {
        return this.particleStateArray;
    }

    setSimulateInWorldSpace(simulateInWorldSpace) {
        super.setSimulateInWorldSpace(simulateInWorldSpace);
        if (this.material) {
            this.material.uniforms.simulateInWorldSpace.value = simulateInWorldSpace ? 1 : 0;
            this.material.uniformsNeedUpdate = true;
        }
    }

    init(particleCount, simulateInWorldSpace = false) {
        if (super.init(particleCount)) {
            this.setSimulateInWorldSpace(simulateInWorldSpace);
            this.particleStateArray = new ParticleStateAttributeArray();
            this.particleStateArray.init(particleCount);
            this.material = this.createMaterial(null, null, null, true, false);
            this.material.blending = this.blending;
            this.mesh = new THREE.Mesh(this.particleStateArray.getGeometry(), this.material);
            // TODO: At some point remove this and perform proper bounds calculations
            this.mesh.frustumCulled = false;
            this.owner.add(this.mesh);
        }
    }

    dispose() {
        this.particleStateArray.dispose();
    }

    createMaterial(vertexShader, fragmentShader, customUniforms, useWebGL2, useLogarithmicDepth) {

        let shaderAtlas = [...Array(16).keys()].map(i => new THREE.Vector4());
        if (this.atlas) {
            for (let i = 0; i < this.atlas.getFrameSetCount(); i++) {
                const frameSet = this.atlas.getFrameSet(i);
                shaderAtlas[i] = new THREE.Vector4(frameSet.x, frameSet.y, frameSet.width, frameSet.height);
            }
        }

        const atlasTexture = this.atlas ? this.atlas.getTexture() : null;
        const interpolateAtlasFrames = this.interpolateAtlasFrames;
        const simulateInWorldSpace = this.simulateInWorldSpace;

        const baseUniforms = {
            'atlasFrameSet': {
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
            'simulateInWorldSpace': {
                'value': simulateInWorldSpace
            }
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
                'const int MAX_ATLAS_FRAME_SETS = 16; \n',
                'uniform vec4 atlasFrameSet[MAX_ATLAS_FRAME_SETS]; \n',
                'uniform int interpolateAtlasFrames; \n',
                'uniform int simulateInWorldSpace; \n',
                'attribute float customIndex;\n',
                'attribute vec4 particlePosition;\n',
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

                'void getUV(in int sequenceElement, in int sequenceNumber, in vec4 atlasFrames, out vec2 uv) { \n',
                '   float atlasFrameWidth = atlasFrames.z; \n',
                '   float atlasFrameHeight = atlasFrames.w; \n',
                '   float atlasFrameX = atlasFrames.x; \n',
                '   float atlasFrameY = atlasFrames.y; \n',
                '   int firstRowSections = int((1.0 - atlasFrameX) / atlasFrameWidth); \n',
                '   int maxRowSections = int(1.0 / atlasFrameWidth); \n',

                '   float firstRowX = atlasFrameX + atlasFrameWidth * float(sequenceElement); \n',
                '   float firstRowY = 1.0 - (atlasFrameY + atlasFrameHeight); \n',

                '   int nRowSequenceElement = sequenceElement - firstRowSections; \n',
                '   float SNOverHS = float(nRowSequenceElement) / float(maxRowSections);\n',
                '   int nRowYTile = int(SNOverHS);\n',
                '   int nRowXTile = int((SNOverHS - float(nRowYTile)) * float(maxRowSections));\n',
                '   float nRowX = float(nRowXTile) * atlasFrameWidth;\n',
                '   float nRowY = 1.0 - ((float(nRowYTile) + 1.0) * (atlasFrameHeight) + atlasFrameY + atlasFrameHeight);\n',

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
                
                '   vec4 viewPosition; \n',
                '   if (simulateInWorldSpace == 1) { \n',
                '       viewPosition = viewMatrix * particlePosition;\n',
                '   } else { \n',
                '       viewPosition = viewMatrix * modelMatrix * particlePosition;\n',
                '   } \n',
                '   float sequenceElementF = sequenceElement.x;\n',
                '   int sequenceNumber = int(sequenceElement.y);\n',
                '   int sequenceStart = int(sequenceElement.z);\n',
                '   int sequenceLength = int(sequenceElement.w);\n',
                '   vec4 atlasFrames = atlasFrameSet[sequenceNumber]; \n',

                '   vec2 uv1; \n',
                '   vec2 uv2; \n',
                '   vSequenceElementT = sequenceElementF - float(int(sequenceElementF)); \n',
                '   int firstSequenceElement = int(sequenceElementF); \n',
                '   int secondSequenceElement = clamp(firstSequenceElement + 1, sequenceStart, sequenceStart + sequenceLength - 1); \n',
                '   getUV(firstSequenceElement, sequenceNumber, atlasFrames, uv1); \n',
                '   if (interpolateAtlasFrames == 1 && firstSequenceElement != secondSequenceElement) { \n ',
                '       getUV(secondSequenceElement, sequenceNumber, atlasFrames, uv2); \n',
                '   } \n',
                '   float atlasFrameWidth = atlasFrames.z; \n',
                '   float atlasFrameHeight = atlasFrames.w; \n',

                '   float rotMag = rotation; \n',
                '   mat2 rotMat = mat2(cos(rotMag), -sin(rotMag), sin(rotMag), cos(rotMag)) * mat2(size.x, 0.0, 0.0, size.y);\n',

                '   float rightSide = step(2.0, customIndex); \n',
                '   vec2 upperSideStep = step(vec2(customIndex, 3.0), vec2(0.0, customIndex));\n',
                '   float upperSide = upperSideStep.x + upperSideStep.y;\n',
                '   float uvXOffset = atlasFrameWidth * rightSide; \n',
                '   float uvYOffset = atlasFrameHeight * upperSide; \n',

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

    static fromJSON(params) {
        const atlasJSON = params.atlas;
        const atlasTexture = new THREE.TextureLoader().load(atlasJSON.texturePath);
        const atlas = new Atlas(atlasTexture, atlasJSON.texturePath);
        const framesets = atlasJSON.framesets;
        for (let frameset of framesets) {
            atlas.addFrameSet(frameset.length, frameset.x, frameset.y, frameset.width, frameset.height);
        }
        const renderer = new AnimatedSpriteRenderer(this.simulateInWorldSpace, atlas, atlasJSON.interpolateFrames);
        if (params.blending == 'Additive') {
            renderer.blending = THREE.AdditiveBlending;
        } else {
            renderer.blending = THREE.NormalBlending;
        }
        return renderer;
    }

    toJSON(texturePathGenerator) {

        const defaultTexturePathGenerator = (atlas) => {
            if (atlas.texturePath) return atlas.texturePath;
            const texture = atlas.getTexture();
            const textureSource = texture.source;
            if (textureSource) {
                const textureData = textureSource.data;
                if (textureData) {
                    const baseURI = textureData.baseURI;
                    const currentSrc = textureData.currentSrc;
                    const baseURISubStrLoc = currentSrc.indexOf(baseURI);
                    if (baseURISubStrLoc >= 0) {
                        return currentSrc.substr(baseURI.length, currentSrc.length - baseURI.length);
                    } else {
                        return currentSrc;
                    }
                }
            }
        };

        texturePathGenerator = texturePathGenerator || defaultTexturePathGenerator;

        const frameSets = [];
        for (let i = 0; i < this.atlas.getFrameSetCount(); i++) {
            const frameSet = this.atlas.getFrameSet(i);
            frameSets.push(frameSet);
        }

        let blending = 'Normal';
        if (this.material.blending === THREE.AdditiveBlending) {
            blending = 'Additive';
        }

        const json = {
            'blending': blending,
            'atlas': {
                'interpolateFrames': this.interpolateAtlasFrames,
                'texturePath': texturePathGenerator(this.atlas),
                'framesets': frameSets
            }
        };

        return json;
    }
}
