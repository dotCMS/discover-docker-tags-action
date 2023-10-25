import * as core from '@actions/core'
import * as discoverer from './discover-docker-tags'

/**
 * Main entry point for this action.
 */
function run() {
  // Call module logic to discover tags
  const tags = discoverer.discoverTags(
    core.getInput('version'),
    core.getInput('hash'),
    core.getInput('label'),
    core.getInput('update_stable'),
    core.getInput('also_latest') === 'true',
    parseInt(core.getInput('base_tag_size')),
    core.getInput('image_name')
  )
  const tagsStr = tags.join(',')
  const formattedTags = tags.map(tag => `\`${tag}\``).join(', ')

  core.info(`Found these tags: [ ${tagsStr} ]`)
  core.setOutput('discovered_tags', tagsStr)
  core.setOutput('formatted_tags', formattedTags)
}

// Run main function
run()
