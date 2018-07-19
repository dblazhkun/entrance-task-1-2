import mapServerData from './mappers'

export function loadList () {
  return window.fetch('/api/stations')
    .then(response => response.json())
    .then(mapServerData)
}

export function loadDetails (id) {
  return window.fetch(`/api/stations/${id}`).then(response => response.json())
}
