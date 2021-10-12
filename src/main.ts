import * as core from '@actions/core'
import * as discoverer from './discover-docker-tags'

/**
 * Main entry point for this action.
 */
function run() {
  // Call module logic to discover tags
  const tags = discoverer
    .discoverTags(
      core.getInput('version'),
      core.getInput('hash'),
      core.getInput('label'),
      core.getInput('update_stable'),
      core.getInput('also_latest') === 'true',
      parseInt(core.getInput('base_tag_Size'))
    )
    .join(', ')

  core.info(`Found these tags: [ ${tags} ]`)
  core.setOutput('discovered_tags', tags)
}

// Run main function
run()
