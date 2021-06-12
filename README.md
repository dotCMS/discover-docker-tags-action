# Discover Docker Tags Action
Node based action to discover the tags to be used in an eventual Docker image publish.

## Usage
```yaml
- name: Discover docker tags
  id: discover-docker-tags
  uses: dotcms/discover-docker-tags-action@main
  with:
    version: 21.06.2
    hash: a2b3e56d
    label: lts
    updateStable: true
```

Should return something like
`[ 21.06.2_lts_a2b3e56d 21.06.2_lts 21.06_lts 21.06 ]`