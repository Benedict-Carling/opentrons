// @flow
import * as React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import { mockTipLengthCalibrationSessionDetails } from '../../../sessions/__fixtures__'
import * as Sessions from '../../../sessions'

import { TipPickUp } from '../TipPickUp'

describe('TipPickUp', () => {
  let render

  const mockSendCommand = jest.fn()
  const mockDeleteSession = jest.fn()

  const getPickUpTipButton = wrapper =>
    wrapper.find('PrimaryButton[children="Pick up tip"]').find('button')

  const getJogButton = (wrapper, direction) =>
    wrapper.find(`JogButton[name="${direction}"]`).find('button')

  const getConfirmTipButton = wrapper =>
    wrapper.find('PrimaryButton[children="Yes, continue"]').find('button')

  const getInvalidateTipButton = wrapper =>
    wrapper.find('PrimaryButton[children="No, try again"]').find('button')

  beforeEach(() => {
    render = (props: $Shape<React.ElementProps<typeof TipPickUp>> = {}) => {
      const {
        hasBlock = true,
        instrument = mockTipLengthCalibrationSessionDetails.instrument,
        labware = mockTipLengthCalibrationSessionDetails.labware,
        sendSessionCommand = mockSendCommand,
        deleteSession = mockDeleteSession,
      } = props
      return mount(
        <TipPickUp
          hasBlock={hasBlock}
          labware={labware}
          instrument={instrument}
          sendSessionCommand={sendSessionCommand}
          deleteSession={deleteSession}
        />
      )
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('allows jogging in z axis', () => {
    const wrapper = render()

    const jogDirections = ['left', 'right', 'back', 'forward', 'up', 'down']
    const jogParamsByDirection = {
      up: [0, 0, 0.1],
      down: [0, 0, -0.1],
      left: [-0.1, 0, 0],
      right: [0.1, 0, 0],
      back: [0, 0.1, 0],
      forward: [0, -0.1, 0],
    }
    jogDirections.forEach(direction => {
      act(() => getJogButton(wrapper, direction).invoke('onClick')())
      wrapper.update()

      expect(mockSendCommand).toHaveBeenCalledWith(
        Sessions.tipCalCommands.JOG,
        { vector: jogParamsByDirection[direction] }
      )
    })
  })
  it('clicking pick up tip proceeds to inspect, and confirm', () => {
    const wrapper = render()

    act(() => getPickUpTipButton(wrapper).invoke('onClick')())
    wrapper.update()

    expect(mockSendCommand).toHaveBeenCalledWith(
      Sessions.tipCalCommands.PICK_UP_TIP
    )

    act(() => getConfirmTipButton(wrapper).invoke('onClick')())
    wrapper.update()

    expect(mockSendCommand).toHaveBeenCalledWith(
      Sessions.tipCalCommands.MOVE_TO_REFERENCE_POINT
    )
  })
  it('clicking pick up tip proceeds to inspect, and invalidate returns to jog', () => {
    const wrapper = render()

    act(() => getPickUpTipButton(wrapper).invoke('onClick')())
    wrapper.update()
    expect(mockSendCommand).toHaveBeenCalledWith(
      Sessions.tipCalCommands.PICK_UP_TIP
    )

    act(() => getInvalidateTipButton(wrapper).invoke('onClick')())
    wrapper.update()
    expect(mockSendCommand).toHaveBeenCalledWith(
      Sessions.tipCalCommands.INVALIDATE_TIP
    )

    act(() => getJogButton(wrapper, 'left').invoke('onClick')())
    wrapper.update()
    act(() => getPickUpTipButton(wrapper).invoke('onClick')())
    wrapper.update()
    expect(mockSendCommand).toHaveBeenCalledWith(
      Sessions.tipCalCommands.PICK_UP_TIP
    )

    act(() => getConfirmTipButton(wrapper).invoke('onClick')())
    wrapper.update()
    expect(mockSendCommand).toHaveBeenCalledWith(
      Sessions.tipCalCommands.MOVE_TO_REFERENCE_POINT
    )
  })
})
