import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('App wraps router-view with dialog provider for admin dialogs', () => {
  const appSource = readFileSync(resolve(process.cwd(), 'src/App.vue'), 'utf8')

  assert.match(
    appSource,
    /<n-message-provider>[\s\S]*<n-notification-provider>[\s\S]*<n-dialog-provider>[\s\S]*<router-view\s*\/>[\s\S]*<\/n-dialog-provider>/,
  )
})
