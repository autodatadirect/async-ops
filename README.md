# Async-Operations
Async-Ops is a library for performing asynchronous service calls in Redux applications.  Async-Ops is made for use with [Redux-Sagas](https://redux-saga.js.org/).

## Motivations
> Why does Async-Ops exist?  What problem is this library trying to solve?

When using Redux with Redux-Sagas, asynchronous options end up being fairly complicated.  By using a separate saga for each service call, you have to create boilerplate code for action types, action creators, sagas, and reducers.  These bits of code end up being duplicative and cluttering up the code base.

Other libraries exist for handling asynchronous actions, usually by including middlewares.  However, if you are already using the Redux-Saga middleware, it adds an extra layer of complication to add a new middleware on top of Redux-Sagas.

**Async-Ops** uses the Redux-Saga middleware to handle asynchronous operations, unifying all types of async calls under a small number of actionTypes which are handled by a single saga.  Whenever you want to add a new asynchronous operation, all that you need to do is create an operation function using whatever technology you like (we like to use the Javascript `fetch` API for simplicity), register that operation, and fire the Async-Ops actions with the registered name and, boom.

## Usage
Async-Ops is available on npm with the following command:
```bash
  npm install --save async-ops
```

The library offers two distinct usage styles: the original API and a newer simplified API. You can use either API or a mix of the two.

## Simplified API

### `registerOperation(name:String, operation:Function, mockOperation: Function) : Function`

Registers the `operation` and `mockOperation` functions under a given name, and returns an object with a full operation definition.

#### Arguments

**`name : String [required]`** The name which will be used to key operation in Async-Ops.  This name will be referenced when calling the operation.

**`operation(...args) : Function [required]`** A function that will be called when the Async-Ops operation is called by name.

**`mockOperation(...args) : Function [optional]`** A function that will be called when the Async-Ops operation is called by name while `mock` is enabled.

#### Return : Object

The return value is an object that contains everything that you need to interact with your operation:

**`name: String`** The name of your operation (as passed in `registerOperation`).

**`action(...args) : Function`** A redux action creator function that you can use to invoke your operation. It can be passed to `dispatch` or mapped in `mapDispatchToProps`.

**`status(state): Function`** A selector for the current state of your operation (`{ error, loading }`). This assumes you have mounted this package's `reducer` function, as described below.

**`OPERATION: String`** The `action.type` dispatched by your `action` function (`ASYNC_OPERATION/{name}`).

**`COMPLETE: String`** The `action-type` dispatched when your operation completes successfully (`ASYNC_COMPLETE/{name}`).

**`FAILURE: String`** The `action.type` dispatched when your operation encounters an error (`ASYNC_FAILURE/{name}`).

**`toString(): Function`** Returns `name`

#### Example

```javascript
// define service in fetchData.js
import { registerOperation } from 'async-ops'

const service = id => window.fetch(`http://httpbin.org/get?id=${id}`)

const mock = id => Promise.reject(Error('id is invalid'))

export default registerOperation('fetchData', service, mock)

// Usage in component
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import fetchData from './fetchData'

const Component = ({ id, startFetchData, opStatus }) => {
  useEffect(() => {
    startFetchData(id)
  }, [id])

  if (opStatus.loading) {
    return <p>Busy....</p>
  }

  return <p>Ready!</p>
}

const mapStateToProps = state => ({
  opStatus: fetchData.status(state)
})

const mapDispatchToProps = {
  startFetchData: fetchData.action
}

export default connect(mapStateToProps, mapDispatchToProps)(Component)

// Usage in reducer
import fetchData from './fetchData'

export default function(state = {}, action) {
  switch (action.type) {
    case fetchData.OPERATION: // ASYNC_OPERATION/fetchData
      return handleOperationStarted(state, action.args)
    case fetchData.COMPLETE: // ASYNC_COMPLETE/fetchData
      return handleOperationComplete(state, action.response)
    case fetchData.FAILURE: // ASYNC_FAILURE/fetchData
      return handleOperationFailed(state, action.error)
    default:
      return state;
  }
}
```

### Example useService.js hook to add to your project

```javascript
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

export const selectStatus = service => state => {
  return {
    loading: false,
    error: null,
    ...(service.status(state) || {})
  }
}

/*
Service required, args optional
args will be passed into the service invocation
args used as dependencies for useEffect
*/
export default (service, args = []) => {
  const dispatch = useDispatch()
  const status = useSelector(selectStatus(service)) || {}
  useEffect(() => {
    dispatch(service.action(...args))
  }, args)

  return [status.loading, status.error]
}
```

### Example usage of useService.js
```javascript
import useService from './useService'
import fetchData from './fetchData'


export const Component = ({ id }) => {
  const [loading, error] = useService(fetchData, [id])

  if (loading) {
    return <p>Busy....</p>
  }

  return <p>Ready!</p>
}

```

### Shared functions

The usage of `saga`, `reducer`, `enableMock`, and `disableMock` are the same as the original API. See below for usage.

## Original API

### `register(name:String, operation:Function, mockOperation: Function) : Function`
The `register` function registers an `operation` function and a `mockOperation` function under a given name.  Operations must be registered prior to being used by the application.

#### Arguments

**`name : String [required]`** The name which will be used to key operation in Async-Ops.  This name will be referenced when calling the operation.

**`operation(...args) : Function [required]`** A function that will be called when the Async-Ops operation is called by name.

**`mockOperation(...args) : Function [optional]`** A function that will be called when the Async-Ops operation is called by name while `mock` is enabled.

#### Example
```javascript
import { register } from 'async-ops'

const service = request => window.fetch(request)

const mock = request => Promise.reject(Error('request is invalid'))

register('fetchData', service, mock)
```

### `callOperation(name:String, ...args) : Function`
The `callOperation` function retrieves the `operation` registered at the provided name and then calls it, passing in `..args` to the called function.

#### Arguments

**`name : String [required]`** The name of the operation.

**`...args [optional]`** The arguments to be passed to the `operation` when it is called.


#### Return : Promise(result)
`callOperation` returns the result of the previously registered `operation` function (or its `mockOperation`) after invoking it with the provided `...args`.  If the `operation` result is not a `Promise`, it will be wrapped in a resolved `Promise`.

#### Example
```javascript
import { register, callOperation } from 'async-ops'

const service = arg => 1 + arg

register('fetchData', service)

...

const x = await callOperation('fetchData', 1) // x = 2
```

### `actions : Object`

The `actions` object contains action creator functions which create the actions which are used by the Async-Ops `saga` to automatically run and process Async-Ops operations.

### `actions.asyncOperationStart : Function(name:String | options:Object, ...args)`

The `asyncOperationStart` function creates an action which starts an async operation.

#### Arguments

**`name : String`** The name of the operation to be called.

**`options : Object`** An options object to use to call.  The options object has the following possible properties:
* *`name : String [required]`* The operation name.
* *`channel : String [optional]`* A channel name to isolate operation call from other calls of the same operation.

**`...args`** The arguments to be passed to the `operation` when it is called.

#### Return : Object
The `asyncOperationStart` function returns a Redux-formatted action object with the following properties:
  * *`type : String`* This is always set to `'ASYNC_OPERATION'`
  * *`...args : Array[arg1, arg2, ...]`* an array of the args provided.
  * *`...options`* any other option values provided to the function

#### Example
```javascript
import { actions } from 'async-ops'

const fireAction = store => {
  const action = actions.asyncOperationStart('fetchData', 'test')
  store.dispatch(action)
}
```

### `actionTypes : Object`

The `actionTypes` object contains the Redux action type strings for Async-Ops actions.  The action types are:

* `actionTypes.OPERATION = 'ASYNC_OPERATION'`
* `actionTypes.COMPLETE = 'ASYNC_COMPLETE'`
* `actionTypes.FAILURE = 'ASYNC_FAILURE'`

### `isAsyncOperation, isAsyncComplete, isAsyncFailure : Function(name:String, channel:String)`

These three functions are helper functions.  They return a match function which takes an action Object and matches the actionType, name, and channel.  This can used for Redux-Saga matching and React-Redux reducer matching.

#### Arguments

**`name : String [required]`** The name of the operation to be matched.

**`channel : String [optional]`** A channel name to be matched.

#### Return : Function(action : Object)
The function returned from the helper functions takes an action object and returns either `true` if the action matches the provided info or `false` if the action does not.

### `loadingSelector : Function`

This selector function can be used to determine the loading state of an asynchronous operation.

#### Arguments

**`name : String [required]`** The name of the operation.

**`channel : String [optional]`** The name of the channel.

#### Return : Function(action : Object)
The function returned from the selector functions takes a state object and returns either `true` if the asynchronous operation is currently loading or `false` if it is not.

#### Example
```javascript
import { selectors } from 'async-ops'

const mapStateToProps = state => ({
  testOpIsLoading: selectors.loadingSelector('testOp')(state)
})
```

### `errorSelector : Function`

This selector function can be used to retrieve error data from an asynchronous operation.

#### Arguments

**`name : String [required]`** The name of the operation.

**`channel : String [optional]`** The name of the channel.

#### Return : Function(action : Object)
The function returned from the selector functions takes a state object and returns either null if the asynchronous operation did not error or an error object.

#### Example
```javascript
import { selectors } from 'async-ops'

const mapStateToProps = state => ({
  testOpError: selectors.errorSelector('testOp')(state)
})
```

## Shared API

### `saga : Function`

The `saga` is a generator function which can be used with the `redux-saga` middleware.  Once started, the Saga will listen for `OPERATION` actions and automatically call the associated operation.  Once the operation is completed, an `COMPLETE` or `FAILURE` action will be fired with the result data.

_Note on `action.type` naming_: When using the original API, all action types are `ASYNC_OPERATION`, `ASYNC_COMPLETE`, and `ASYNC_FAILURE`. You will need to use the `isAsyncOperation/isAsyncComplete/isAsyncFailure` helper functions to determine if the operation applies to your operation.

Using the simplified API, each operation has unique action types created by appending the operation name to the three action types (for example, `ASYNC_OPERATION/FOOBAR`). These three action types are available as the `OPERATION`, `COMPLETE`, and `FAILURE` properties of the object returned by `registerOperation`.

#### Example
```javascript
import { saga } from 'async-ops'
import sagaMiddleware from './sagaMiddleware'

sagaMiddleware.run(saga)
```

### `reducer : Function`

The `reducer` is a Redux reducer function that can be added to an app's reducer to keep the store updated with the status about the latest async-ops calls.  It must be put under the key 'asyncops' which can be imported from the async-ops package as `STORE_DOMAIN`. It is optional, but provides a common place to track operation status.

#### Example
```javascript
import { combineReducers } from 'redux'
import { reducer as asyncops } from 'async-ops'

const rootReducer = combineReducers({
  asyncops
})
```

### `enableMock() : Function`
The `enableMock` function causes `callOperation` to use the `mockOperation` function rather than the  `operation` function.  The current mock status is set in the client's Local Storage.

### `disableMock() : Function`
The `disableMock` function causes `callOperation` to use the `mockOperation` function rather than the  `operation` function.  The current mock status is set in the client's Local Storage.

