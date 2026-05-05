// ABOUTME: WebGL canvas component for image transitions with GLSL shaders
// ABOUTME: Implements multiply_blend and other GL transitions between images

'use client'

import { logger } from '@/lib/logger.edge'
import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'

interface WebGLTransitionProps {
  fromImage: string
  toImage: string
  progress: number // 0 to 1
  fromFocalX?: number // 0 to 1, default 0.5
  fromFocalY?: number // 0 to 1, default 0.5
  toFocalX?: number // 0 to 1, default 0.5
  toFocalY?: number // 0 to 1, default 0.5
  className?: string
  style?: React.CSSProperties
  preloadNext?: string // Image to preload for next transition
}

export interface WebGLTransitionRef {
  updateProgress: (progress: number) => void
}

const WebGLTransition = forwardRef<WebGLTransitionRef, WebGLTransitionProps>(
  (
    {
      fromImage,
      toImage,
      progress,
      fromFocalX = 0.5,
      fromFocalY = 0.5,
      toFocalX = 0.5,
      toFocalY = 0.5,
      className = '',
      style = {},
      preloadNext,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const glRef = useRef<WebGLRenderingContext | null>(null)
    const programRef = useRef<WebGLProgram | null>(null)
    const fromTextureRef = useRef<WebGLTexture | null>(null)
    const toTextureRef = useRef<WebGLTexture | null>(null)
    const nextTextureRef = useRef<WebGLTexture | null>(null) // Preload next image
    const fromImageAspectRef = useRef<number>(1)
    const toImageAspectRef = useRef<number>(1)
    const texturesLoadedRef = useRef<boolean>(false)
    const currentProgressRef = useRef<number>(progress)
    const uniformsRef = useRef<{
      progress: WebGLUniformLocation | null
      ratio: WebGLUniformLocation | null
      from: WebGLUniformLocation | null
      to: WebGLUniformLocation | null
      fromAspect: WebGLUniformLocation | null
      toAspect: WebGLUniformLocation | null
      fromFocalX: WebGLUniformLocation | null
      fromFocalY: WebGLUniformLocation | null
      toFocalX: WebGLUniformLocation | null
      toFocalY: WebGLUniformLocation | null
    }>({
      progress: null,
      ratio: null,
      from: null,
      to: null,
      fromAspect: null,
      toAspect: null,
      fromFocalX: null,
      fromFocalY: null,
      toFocalX: null,
      toFocalY: null,
    })

    // Vertex shader - simple pass-through
    const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `

    // Fragment shader with multiply_blend transition
    // Author: Fernando Kuteken
    // License: MIT
    const fragmentShaderSource = `
    precision mediump float;

    varying vec2 v_texCoord;
    uniform sampler2D u_from;
    uniform sampler2D u_to;
    uniform float u_progress;
    uniform float u_ratio;
    uniform float u_fromAspect;
    uniform float u_toAspect;
    uniform float u_fromFocalX;
    uniform float u_fromFocalY;
    uniform float u_toFocalX;
    uniform float u_toFocalY;

    // Apply object-fit: cover with object-position (matches CSS behavior)
    vec2 coverUV(vec2 uv, float imageAspect, float canvasAspect, float focalX, float focalY) {
      // Calculate visible ratio for each dimension after cover scaling
      vec2 scale;
      if (canvasAspect > imageAspect) {
        // Canvas is wider: scale to fit width, crop height
        scale.x = 1.0;
        scale.y = imageAspect / canvasAspect;
      } else {
        // Canvas is taller: scale to fit height, crop width
        scale.x = canvasAspect / imageAspect;
        scale.y = 1.0;
      }

      // Calculate overflow (portion of image that extends beyond viewport)
      vec2 overflow = vec2(1.0) - scale;

      // Apply focal point offset (matches CSS object-position behavior)
      vec2 focalOffset = vec2(focalX, focalY) * overflow;

      // Transform UV: offset by focal point, then scale to visible portion
      return focalOffset + uv * scale;
    }

    vec4 getFromColor(vec2 uv) {
      vec2 coveredUV = coverUV(uv, u_fromAspect, u_ratio, u_fromFocalX, u_fromFocalY);
      return texture2D(u_from, coveredUV);
    }

    vec4 getToColor(vec2 uv) {
      vec2 coveredUV = coverUV(uv, u_toAspect, u_ratio, u_toFocalX, u_toFocalY);
      return texture2D(u_to, coveredUV);
    }

    // Multiply blend helper
    vec4 blend(vec4 a, vec4 b) {
      return a * b;
    }

    // Multiply blend transition from gl-transitions
    vec4 transition(vec2 uv) {
      vec4 blended = blend(getFromColor(uv), getToColor(uv));

      if (u_progress < 0.5)
        return mix(getFromColor(uv), blended, 2.0 * u_progress);
      else
        return mix(blended, getToColor(uv), 2.0 * u_progress - 1.0);
    }

    void main() {
      gl_FragColor = transition(v_texCoord);
    }
  `

    // Initialize WebGL context and shaders
    const initWebGL = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return false

      const gl: WebGLRenderingContext | null =
        (canvas.getContext('webgl') as WebGLRenderingContext) ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext)
      if (!gl) {
        logger.warn('WebGL not supported, falling back to CSS transitions')
        return false
      }

      glRef.current = gl

      // Create shaders
      const vertexShader = createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexShaderSource
      )
      const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      )

      if (!vertexShader || !fragmentShader) return false

      // Create program
      const program = createProgram(gl, vertexShader, fragmentShader)
      if (!program) return false

      programRef.current = program
      gl.useProgram(program)

      // Set up geometry (full-screen quad)
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1,
          -1, // bottom left
          1,
          -1, // bottom right
          -1,
          1, // top left
          1,
          1, // top right
        ]),
        gl.STATIC_DRAW
      )

      const positionLocation = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // Set up texture coordinates
      const texCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          0,
          1, // bottom left
          1,
          1, // bottom right
          0,
          0, // top left
          1,
          0, // top right
        ]),
        gl.STATIC_DRAW
      )

      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
      gl.enableVertexAttribArray(texCoordLocation)
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

      // Get uniform locations
      uniformsRef.current = {
        progress: gl.getUniformLocation(program, 'u_progress'),
        ratio: gl.getUniformLocation(program, 'u_ratio'),
        from: gl.getUniformLocation(program, 'u_from'),
        to: gl.getUniformLocation(program, 'u_to'),
        fromAspect: gl.getUniformLocation(program, 'u_fromAspect'),
        toAspect: gl.getUniformLocation(program, 'u_toAspect'),
        fromFocalX: gl.getUniformLocation(program, 'u_fromFocalX'),
        fromFocalY: gl.getUniformLocation(program, 'u_fromFocalY'),
        toFocalX: gl.getUniformLocation(program, 'u_toFocalX'),
        toFocalY: gl.getUniformLocation(program, 'u_toFocalY'),
      }

      return true
    }, [])

    // Helper function to create shader
    const createShader = (
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ): WebGLShader | null => {
      const shader = gl.createShader(type)
      if (!shader) return null

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        logger.error(
          { infoLog: gl.getShaderInfoLog(shader) },
          'Shader compilation error'
        )
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    // Helper function to create program
    const createProgram = (
      gl: WebGLRenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ): WebGLProgram | null => {
      const program = gl.createProgram()
      if (!program) return null

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        logger.error(
          { infoLog: gl.getProgramInfoLog(program) },
          'Program linking error'
        )
        gl.deleteProgram(program)
        return null
      }

      return program
    }

    // Load image as WebGL texture
    const loadTexture = useCallback(
      (
        gl: WebGLRenderingContext,
        imageUrl: string,
        isFrom: boolean
      ): Promise<WebGLTexture | null> => {
        return new Promise((resolve) => {
          const texture = gl.createTexture()
          if (!texture) {
            resolve(null)
            return
          }

          const image = new Image()
          image.crossOrigin = 'anonymous'

          image.onload = () => {
            // Store aspect ratio
            const aspectRatio = image.width / image.height
            if (isFrom) {
              fromImageAspectRef.current = aspectRatio
            } else {
              toImageAspectRef.current = aspectRatio
            }

            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              image
            )

            // Set texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

            resolve(texture)
          }

          image.onerror = () => {
            logger.error({ err: imageUrl }, 'Failed to load image')
            gl.deleteTexture(texture)
            resolve(null)
          }

          image.src = imageUrl
        })
      },
      []
    )

    // Render function - no dependencies on props for maximum performance
    const render = useCallback(() => {
      const gl = glRef.current
      const program = programRef.current
      const fromTexture = fromTextureRef.current
      const toTexture = toTextureRef.current
      const canvas = canvasRef.current

      if (
        !gl ||
        !program ||
        !fromTexture ||
        !toTexture ||
        !canvas ||
        !texturesLoadedRef.current
      )
        return

      // Set viewport
      gl.viewport(0, 0, canvas.width, canvas.height)
      // Always clear with transparent to prevent any background showing
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Set uniforms using currentProgressRef
      gl.uniform1f(uniformsRef.current.progress, currentProgressRef.current)
      gl.uniform1f(uniformsRef.current.ratio, canvas.width / canvas.height)
      gl.uniform1f(uniformsRef.current.fromAspect, fromImageAspectRef.current)
      gl.uniform1f(uniformsRef.current.toAspect, toImageAspectRef.current)
      gl.uniform1f(uniformsRef.current.fromFocalX, fromFocalX)
      gl.uniform1f(uniformsRef.current.fromFocalY, fromFocalY)
      gl.uniform1f(uniformsRef.current.toFocalX, toFocalX)
      gl.uniform1f(uniformsRef.current.toFocalY, toFocalY)

      // Bind textures
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fromTexture)
      gl.uniform1i(uniformsRef.current.from, 0)

      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, toTexture)
      gl.uniform1i(uniformsRef.current.to, 1)

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }, [fromFocalX, fromFocalY, toFocalX, toFocalY])

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        updateProgress: (newProgress: number) => {
          currentProgressRef.current = newProgress
          render()
        },
      }),
      [render]
    )

    // Initialize WebGL on mount
    useEffect(() => {
      initWebGL()
    }, [initWebGL])

    // Load textures when images change
    useEffect(() => {
      const gl = glRef.current
      if (!gl) return

      texturesLoadedRef.current = false

      const loadTextures = async () => {
        const [fromTex, toTex] = await Promise.all([
          loadTexture(gl, fromImage, true),
          loadTexture(gl, toImage, false),
        ])

        if (fromTex) fromTextureRef.current = fromTex
        if (toTex) toTextureRef.current = toTex

        if (fromTex && toTex) {
          texturesLoadedRef.current = true
          // Trigger initial render once textures are loaded
          render()
        }
      }

      loadTextures()

      // Cleanup
      return () => {
        texturesLoadedRef.current = false
        if (fromTextureRef.current) {
          gl.deleteTexture(fromTextureRef.current)
          fromTextureRef.current = null
        }
        if (toTextureRef.current) {
          gl.deleteTexture(toTextureRef.current)
          toTextureRef.current = null
        }
      }
    }, [fromImage, toImage, loadTexture, render])

    // Render when progress changes
    useEffect(() => {
      render()
    }, [render])

    // Handle canvas resize
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const resizeCanvas = () => {
        const { clientWidth, clientHeight } = canvas
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth
          canvas.height = clientHeight
          render()
        }
      }

      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      return () => window.removeEventListener('resize', resizeCanvas)
    }, [render])

    // Preload next image
    useEffect(() => {
      if (preloadNext && glRef.current) {
        loadTexture(glRef.current, preloadNext, false).then((texture) => {
          if (texture) {
            if (nextTextureRef.current) {
              glRef.current?.deleteTexture(nextTextureRef.current)
            }
            nextTextureRef.current = texture
          }
        })
      }
    }, [preloadNext, loadTexture])

    // Update progress when prop changes (fallback for non-ref updates)
    useEffect(() => {
      currentProgressRef.current = progress
      render()
    }, [progress, render])

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          ...style,
        }}
      />
    )
  }
)

WebGLTransition.displayName = 'WebGLTransition'

export default WebGLTransition
