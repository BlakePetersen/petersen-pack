// ABOUTME: Tests for error code enum and structured error Zod schemas.
// ABOUTME: Validates all six error codes and the BlinkError shape with optional slug.
import { BlinkErrorCode, BlinkErrorSchema } from '../src/index'

describe('BlinkErrorCode', () => {
  it.each([
    'ARTIFACT_NOT_FOUND',
    'REGISTRY_UNREACHABLE',
    'MANIFEST_CORRUPT',
    'CHECKSUM_MISMATCH',
    'MARKER_BROKEN',
    'DEPENDENCY_MISSING'
  ])('accepts "%s"', value => {
    expect(BlinkErrorCode.safeParse(value).success).toBe(true)
  })

  it.each(['UNKNOWN_ERROR', 'artifact_not_found', ''])(
    'rejects "%s"',
    value => {
      expect(BlinkErrorCode.safeParse(value).success).toBe(false)
    }
  )
})

describe('BlinkErrorSchema', () => {
  it('accepts a valid error with slug', () => {
    const error = {
      code: 'ARTIFACT_NOT_FOUND',
      message: 'Could not find artifact',
      slug: 'eslint-config'
    }
    expect(BlinkErrorSchema.safeParse(error).success).toBe(true)
  })

  it('accepts a valid error without slug', () => {
    const error = {
      code: 'REGISTRY_UNREACHABLE',
      message: 'Registry is down'
    }
    expect(BlinkErrorSchema.safeParse(error).success).toBe(true)
  })

  it('rejects invalid error code', () => {
    const error = {
      code: 'INVALID_CODE',
      message: 'Something went wrong'
    }
    expect(BlinkErrorSchema.safeParse(error).success).toBe(false)
  })

  it('rejects missing message', () => {
    const error = {
      code: 'ARTIFACT_NOT_FOUND'
    }
    expect(BlinkErrorSchema.safeParse(error).success).toBe(false)
  })

  it('rejects missing code', () => {
    const error = {
      message: 'Something went wrong'
    }
    expect(BlinkErrorSchema.safeParse(error).success).toBe(false)
  })
})
