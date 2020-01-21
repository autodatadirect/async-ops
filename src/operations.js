import mock from './mock'
import { statusSelector } from './selectors'
import { actionTypes } from './utility'

const operations = {}
const mocks = {}

export const register = (name, operation, mock) => {
  if (!name) throw new Error('Unable to register: No service name has been provided')
  if (!operation) throw new Error('Unable to register: No operation has been provided for: ' + name)
  if (operations[name]) console.log('WARNING: Overwriting existing service for: ' + name)
  operations[name] = operation
  mocks[name] = mock
}

export const get = name => (mock.enabled() && mocks[name]) ? mocks[name] : operations[name]

export const call = async (name, ...args) => {
  const operation = get(name)
  if (!operation) throw new Error('ASYNC_OPERATION_NOT_REGISTERED')
  return operation(...args)
}

export const registerOperation = (name, operation, mock) => {
  register(name, operation, mock)

  const [OPERATION, COMPLETE, FAILURE] = actionTypes(name)
  const actionCreator = (...args) => {
    return {
      name,
      type: OPERATION,
      args
    }
  }

  return {
    name,
    OPERATION,
    COMPLETE,
    FAILURE,
    action: actionCreator,
    status: statusSelector(name),
    toString: () => name
  }
}
