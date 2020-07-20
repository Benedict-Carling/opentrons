// @flow
import * as React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import noop from 'lodash/noop'

import * as navigation from '../../../nav'
import { PrimaryButton, OutlineButton, Tooltip } from '@opentrons/components'
import { Continue } from '../Continue'

import type { State } from '../../../types'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../nav')

const MOCK_STATE: State = ({ mockState: true }: any)
const MOCK_STORE = {
  getState: () => MOCK_STATE,
  dispatch: noop,
  subscribe: noop,
}

const getCalibrateLocation: JestMockFn<
  [State],
  $Call<typeof navigation.getCalibrateLocation, State>
> = navigation.getCalibrateLocation

function stubSelector<R>(mock: JestMockFn<[State], R>, rVal: R) {
  mock.mockImplementation(state => {
    expect(state).toBe(MOCK_STATE)
    return rVal
  })
}

const mockCalPath = '/path/to/cal'

describe('Continue to run or calibration button component', () => {
  const render = (labwareCalibrated: boolean = false) => {
    return mount(
      <Provider store={MOCK_STORE}>
        <MemoryRouter>
          <Continue />
        </MemoryRouter>
      </Provider>
    )
  }
  const CALIBRATE_SELECTOR = {
    id: 'calibrate',
    path: mockCalPath,
    title: 'CALIBRATE',
    iconName: 'ot-calibrate',
    disabledReason: null,
  }

  const CALIBRATE_SELECTOR_DISABLED = {
    id: 'calibrate',
    path: mockCalPath,
    title: 'CALIBRATE',
    iconName: 'ot-calibrate',
    disabledReason: 'check your toolbox!',
  }

  beforeEach(() => {
    stubSelector(getCalibrateLocation, CALIBRATE_SELECTOR)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Default button renders to continue to labware when not all labware is calibrated', () => {
    const wrapper = render()
    const button = wrapper.find(PrimaryButton)
    const secondarybutton = wrapper.find(OutlineButton)
    const tooltip = wrapper.find(Tooltip)

    expect(tooltip.exists()).toEqual(false)
    expect(button.children().text()).toEqual('Proceed to Calibrate')
    expect(secondarybutton.exists()).toEqual(false)
    expect(button.props().to).toEqual(mockCalPath)
  })

  it('Test tool tip when disabled reason given', () => {
    stubSelector(getCalibrateLocation, CALIBRATE_SELECTOR_DISABLED)
    const wrapper = render()
    const tooltip = wrapper.find(Tooltip)
    expect(tooltip.exists()).toEqual(true)
    expect(tooltip.prop('children')).toBe(
      CALIBRATE_SELECTOR_DISABLED.disabledReason
    )
  })
})
