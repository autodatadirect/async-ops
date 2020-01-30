import * as actionTypes from './actionTypes'
import { isOperation, isCompletion, isFailure } from './utility'

export const STORE_DOMAIN = 'asyncops'

const initialState = {}

const initialEntry = {
  error: null,
  loading: false
}

export const getReducerkey = ({ name, channel }) => name + (channel ? '__' + channel : '')

const operation = (state, action) => ({
  ...state,
  [getReducerkey(action)]: {
    ...initialEntry,
    loading: true
  }
})

const failure = (state, action) => ({
  ...state,
  [getReducerkey(action)]: {
    ...initialEntry,
    error: action.error
  }
})

const complete = (state, action) => {
  const nState = { ...state }
  delete nState[getReducerkey(action)]
  return nState
}

export default (state = initialState, action) => {
  if (isOperation(action.type) || action.type === actionTypes.OPERATION) {
    return operation(state, action)
  }
  if (isFailure(action.type) || action.type === actionTypes.FAILURE) {
    return failure(state, action)
  }
  if (isCompletion(action.type) || action.type === actionTypes.COMPLETE) {
    return complete(state, action)
  }
  return state
}
