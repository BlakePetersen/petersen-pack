// ABOUTME: Throwaway spike route for react-live React 19 compatibility check.
// ABOUTME: Delete after plan 24-01 verdict is recorded.
'use client'

import { useEffect } from 'react'
import { LiveProvider, LivePreview, LiveError } from 'react-live'
import { Button } from 'artax-ui'
import * as artaxUI from 'artax-ui'

export default function ReactLiveSpikePage() {
  useEffect(() => {
    // Probe for Open Question 2: how many named exports does wildcard scope pull in?
    // If this is large, spreading ...artaxUI into scope may defeat tree-shaking.
    // eslint-disable-next-line no-console
    console.log('[spike] Object.keys(artaxUI).length =', Object.keys(artaxUI).length)
  }, [])

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h1>react-live spike</h1>

      <section>
        <h2>Narrow scope: {'{ Button }'}</h2>
        <LiveProvider code="<Button>spike</Button>" scope={{ Button }}>
          <LivePreview />
          <LiveError />
        </LiveProvider>
      </section>

      <section>
        <h2>Wildcard scope: {'{ ...artaxUI }'}</h2>
        <LiveProvider
          code={'<Button variant="outline">wildcard-scope</Button>'}
          scope={{ ...artaxUI }}
        >
          <LivePreview />
          <LiveError />
        </LiveProvider>
      </section>
    </div>
  )
}
