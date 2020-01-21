import { call, put, takeEvery } from 'redux-saga/effects'
import { OPERATION, COMPLETE, FAILURE } from './actionTypes'
import { call as callOperation } from './operations'
import { enabled as mockEnabled } from './mock'
import { actionTypes, isOperation, operationName } from './utility'

export default function * (action) {
  yield takeEvery(OPERATION, loader)
  yield takeEvery(action => isOperation(action.type), loader)
}

function * loader (action) {
  const { name, channel, args } = action
  const [completeType, errorType] = resultTypes(action.type)
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
      type: completeType,
      response
    }

    yield put(responseAction)
  } catch (error) {
    const errorAction = {
      ...responseObject,
      type: errorType,
      error
    }

    yield put(errorAction)
  }
}

const resultTypes = (operationType) => {
  if (operationType === OPERATION) {
    return [
      COMPLETE,
      FAILURE
    ]
  }

  const name = operationName(operationType)
  return actionTypes(name).slice(1)
}
