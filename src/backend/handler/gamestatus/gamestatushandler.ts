import { GameStatus, GameStatusMap } from 'common/types'
import { getMainWindow } from '../../utils'
import Store from 'electron-store'

const store = new Store({
  cwd: 'store',
  name: 'progress-handler'
})

function initGameStatusHandler() {
  const handlers = getAllGameStatus()
  for (const key in handlers) {
    const status = handlers[key]
    status.previousProgress = status.progress
    status.status = 'done'
  }

  store.set('gameStatus', handlers)
}

function setGameStatusOfElement(status: GameStatus) {
  const emptyMap = () => {
    const handlers = {}
    handlers[status.appName] = status
    store.set('gameStatus', handlers)
  }

  if (!store.has('gameStatus')) {
    emptyMap()
  } else {
    const handlers = store.get('gameStatus') as GameStatusMap

    if (!Object.keys(handlers).length) {
      emptyMap()
    } else {
      handlers[status.appName] = status
      store.set('gameStatus', handlers)
    }
  }

  const mainWindow = getMainWindow()
  if (mainWindow?.webContents) {
    getMainWindow().webContents.send('handleGameStatus', status)
  }
}

function deleteGameStatusOfElement(appName: string) {
  if (store.has('gameStatus')) {
    const handlers = store.get('gameStatus') as GameStatusMap

    if (Object.keys(handlers)) {
      const status = handlers[appName]
      if (status) {
        status.status = 'done'
      }

      delete handlers[appName]
      store.set('gameStatus', handlers)

      const mainWindow = getMainWindow()
      if (mainWindow?.webContents) {
        getMainWindow().webContents.send('handleGameStatus', status)
      }
    }
  }
}

function getGameStatusOfElement(appName: string): GameStatus | undefined {
  if (store.has('gameStatus')) {
    const handlers = store.get('gameStatus') as GameStatusMap

    return handlers[appName]
  }
  return
}

function getAllGameStatus(): GameStatusMap {
  const emptyMap = {}
  if (store.has('gameStatus')) {
    const handlers = store.get('gameStatus') as GameStatusMap
    return handlers ?? emptyMap
  }
  return emptyMap
}

export {
  initGameStatusHandler,
  setGameStatusOfElement,
  deleteGameStatusOfElement,
  getGameStatusOfElement,
  getAllGameStatus
}
