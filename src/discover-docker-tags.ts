import * as core from '@actions/core'

const LTS_LABEL = 'lts'
const SNAPSHOT_LABEL = 'SNAPSHOT'

interface VersionProps {
  version: string
  label?: string
}

/**
 * Based on a provided version discover the stable tag versions it needs
 * to update when publishing the Docker image.
 *
 * @param version provided version (e.g. 21.07)
 * @param hash trucanted commit id used to define name for unique tag
 * @param label custom label used to define name for stable tags
 * @param updateStable value for updating stable tags
 * @param alsoLatest flag for updating "latest" tag
 * @param baseTagSize size of elements which conform a base stable tag (must likely to be 2)
 * @returns a string array of the discovered tags
 */
export function discoverTags(
  version: string,
  hash: string,
  label: string,
  updateStable: string,
  alsoLatest: boolean,
  baseTagSize: number
): string[] {
  // Validations for paramameters
  if (version === '') {
    core.error('Provided version is empty, not returning any tags')
    return []
  }
  if (hash === '') {
    core.error('Provided hash is empty, not returning any tags')
    return []
  }

  // Normalize version
  const versionProps = normalizeVersion(version, label)
  // Determine if this is a SNAPSHOT tag
  const isSnapshot = versionProps.label === SNAPSHOT_LABEL

  // Define result array
  const discoveredTags = []
  // Define unique tag with version, hash and label and push it
  discoveredTags.push(formatTag(versionProps.version, hash, versionProps.label))

  // When single specified, then just add another single tag
  if (updateStable === 'single' && !isSnapshot) {
    discoveredTags.push(formatTag(versionProps.version, '', versionProps.label))
  }

  // When SNAPSHOT label detected add it to discovered tags with no hash as well
  if (isSnapshot) {
    // Push tag without the hash in case label is 'SNAPSHOT'
    discoveredTags.push(formatTag(versionProps.version, '', SNAPSHOT_LABEL))
  }

  // Return just the unique tag when "update stable tags" flag is true
  if (updateStable !== 'true' || isSnapshot) {
    core.info('Not updating stable tags')
    return discoveredTags
  }

  // Split the version elements
  const versionSchema = versionProps.version.split('.')
  // Extract the base version (e.g. 21.06 in case version is 21.06.2)
  const baseTag = versionSchema.splice(0, baseTagSize).join('.')
  // Put back the base version as the first element (e.g.[ '21.06' '2' ])
  versionSchema.unshift(baseTag)
  core.info(`Version array: ${versionSchema.join(' ')}`)

  // Loop over the version array until one element (base version) is left
  while (versionSchema.length > 1) {
    // If label is blank or 'lts' then add a tag to result array
    if (versionProps.label === '' || versionProps.label === LTS_LABEL) {
      discoveredTags.push(
        formatTag(versionSchema.join('.'), '', versionProps.label)
      )
    }
    // Remove last array element
    versionSchema.pop()
  }

  // When label is 'lts' add the tag to result array
  if (versionProps.label === LTS_LABEL) {
    discoveredTags.push(formatTag(versionSchema[0], '', LTS_LABEL))
  }

  // When label is blank or 'lts' add the tag to result array
  if (versionProps.label === '' || versionProps.label === LTS_LABEL) {
    discoveredTags.push(formatTag(versionSchema[0], ''))
  }

  // When updateStable and alsoLatest flags are true then add 'latest' tag
  if (updateStable === 'true' && alsoLatest) {
    discoveredTags.push(formatTag('latest', ''))
  }

  return discoveredTags
}

/**
 * Based on a provided version, decorates it with hash and label values.
 * (e.g. version: 21.06.2, hash: a2b3e56d, label: lts => 21.06.2_lts_a2b3e56d)
 *
 * @param version version
 * @param hash hash to be included with a '_' prefix
 * @param label optional label added with a '_' prefix
 * @returns a decotared version.
 */
function formatTag(version: string, hash: string, label?: string): string {
  const hashValue = hash !== '' ? `_${hash}` : ''
  const labelValue = label ? `_${label}` : ''
  return label === SNAPSHOT_LABEL
    ? `\`${version}${hashValue}${labelValue}\``
    : `\`${version}${labelValue}${hashValue}\``
}

/**
 * Normalizes the version in case a label is not provided and the version ends with the suffix '_lts' or '_canary'.
 * Then that part of the version becomes the label.
 *
 * @param version provided version
 * @param label provided label
 * @returns a VersionProps object holding the normalized version and label
 */
function normalizeVersion(version: string, label?: string): VersionProps {
  // Make sure label is in lowercase
  const lowered = label?.toLowerCase()
  const definitive =
    lowered === SNAPSHOT_LABEL.toLowerCase() ? SNAPSHOT_LABEL : lowered

  if (
    !(
      version.endsWith(`_${LTS_LABEL}`) ||
      version.endsWith(`_${SNAPSHOT_LABEL}`)
    )
  ) {
    return {
      version,
      label: definitive
    }
  }

  const schema = version.split('_')
  const popped = schema.pop()
  return {
    version: schema.join(),
    label: popped
  }
}
