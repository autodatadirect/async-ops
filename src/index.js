import { enable as enableMock, disable as disableMock } from './mock'
import * as actions from './actions'
import * as actionTypes from './actionTypes'
import saga from './saga'
import { call as callOperation, register, registerOperation } from './operations'
import * as reducerHelpers from './helpers'
import reducer, { STORE_DOMAIN } from './reducer'
import * as selectors from './selectors'

const isAsyncOperation = reducerHelpers.isAsyncOperation
const isAsyncComplete = reducerHelpers.isAsyncComplete
const isAsyncFailure = reducerHelpers.isAsyncFailure

export {
  registerOperation,
  register,
  callOperation,
  enableMock,
  disableMock,
  actions,
  actionTypes,
  saga,
  reducerHelpers,
  isAsyncOperation,
  isAsyncComplete,
  isAsyncFailure,
  reducer,
  selectors,
  STORE_DOMAIN
}

export default {
  registerOperation,
  register,
  callOperation,
  enableMock,
  disableMock,
  actions,
  actionTypes,
  saga,
  reducerHelpers,
  isAsyncOperation,
  isAsyncComplete,
  isAsyncFailure,
  reducer,
  selectors,
  STORE_DOMAIN
}
