const selectedGroupStorageKey = 'mylab:selected-research-group'

export function getSelectedResearchGroupId() {
  try {
    return window.localStorage.getItem(selectedGroupStorageKey)
  } catch {
    return null
  }
}

export function setSelectedResearchGroupId(groupId: string) {
  try {
    window.localStorage.setItem(selectedGroupStorageKey, groupId)
  } catch {
    void 0
  }
}
