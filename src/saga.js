import { call, put, takeEvery } from 'redux-saga/effects'
import { OPERATION, COMPLETE, FAILURE } from './actionTypes'
import { call as callOperation } from './operations'
import { enabled as mockEnabled } from './mock'

export default function * (action) {
  yield takeEvery(OPERATION, loader)
}

function * loader (action) {
  const { name, channel, args } = action
  const responseObject = {
    name,
    channel,
    isMock: mockEnabled(),
    args
  }
  try {
    const response = yield call(callOperation, name, ...action.args)

    const responseAction = {
      ...responseObject,
      type: COMPLETE,
      response
    }

    try {
      yield put(responseAction)
    } catch (e) {
      // redux-saga v0.16 swallows put() exceptions
    }
  } catch (error) {
    const errorAction = {
      ...responseObject,
      type: FAILURE,
      error
    }

    try {
      yield put(errorAction)
    } catch (e) {
      // redux-saga v0.16 swallows put() exceptions
    }
  }
}
