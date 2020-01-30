import * as types from './actionTypes'

const OPERATION_REX = new RegExp(`^${types.OPERATION}/\\S+`)
const COMPLETE_REX = new RegExp(`^${types.COMPLETE}/\\S+`)
const FAILURE_REX = new RegExp(`^${types.FAILURE}/\\S+`)
const AOPS_REX = new RegExp(`^(${types.OPERATION}|${types.COMPLETE}|${types.FAILURE})/(\\S+)$`)

export const isOperation = (actionType) => OPERATION_REX.test(actionType)
export const isCompletion = (actionType) => COMPLETE_REX.test(actionType)
export const isFailure = (actionType) => FAILURE_REX.test(actionType)

export const operationName = (actionType) => {
  const matches = (actionType || '').match(AOPS_REX)
  if (!matches || !matches.length === 3) {
    return null
  }
  return matches[2]
}

export const actionTypes = (operationName) => {
  return [
    `${types.OPERATION}/${operationName}`,
    `${types.COMPLETE}/${operationName}`,
    `${types.FAILURE}/${operationName}`
  ]
}
