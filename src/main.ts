import type { DetectionSurfaceInfo, OpenSurfaceResult, SurfaceContext, SurfacePlugin } from '@companion-surface/base'
import { Input, Output } from '@julusian/midi/lazy'
import { DeviceMappings, DeviceMappingsWithRegex, type MidiLayoutDefinition } from './tmp-layout.js'
import { MidiWrapper } from './instance.js'
import { createSurfaceSchema } from './surface-schema.js'
import { createPincodeMap } from './pincode.js'
import { getInputs, getOutputs } from './midi-helper.js'

export interface MidiDeviceInfo {
	inputPortName: string
	outputPortName?: string
	layout: MidiLayoutDefinition
}

const MidiPlugin: SurfacePlugin<MidiDeviceInfo> = {
	init: async (): Promise<void> => {
		// Nothing to do
	},
	destroy: async (): Promise<void> => {
		// Nothing to do
	},

	scanForSurfaces: async (): Promise<DetectionSurfaceInfo<MidiDeviceInfo>[]> => {
		const discovered: DetectionSurfaceInfo<MidiDeviceInfo>[] = []

		const outputs = getOutputs()
		getInputs().forEach((name, i) => {
			let deviceMapping = DeviceMappings[name]
			if (!deviceMapping) {
				deviceMapping = DeviceMappings[name.replace(/ [0-9]+$/m, '')]
				if (!deviceMapping) {
					for (const { regex, name: regexName } of DeviceMappingsWithRegex) {
						if (regex.exec(name) !== null) {
							deviceMapping = DeviceMappings[regexName]
							if (deviceMapping.outputName !== undefined)
								deviceMapping.outputName = name.replace(regex, deviceMapping.outputName)
						}
					}
				}
			}

			if (deviceMapping?.layout)
				discovered.push({
					deviceHandle: `midi:${name}`,
					surfaceId: `midi:${name}`,
					description: `MIDI Port ${i}: ${name}`,
					pluginInfo: {
						inputPortName: name,
						outputPortName:
							outputs.find(
								(output) =>
									(deviceMapping.outputName ? output === deviceMapping.outputName : false) ||
									output === name ||
									output.replace(/ [0-9]+$/m, '') === name,
							) ?? name,
						layout: deviceMapping.layout,
					},
				})
		})

		return discovered
	},

	openSurface: async (
		surfaceId: string,
		pluginInfo: MidiDeviceInfo,
		context: SurfaceContext,
	): Promise<OpenSurfaceResult> => {
		const layout: MidiLayoutDefinition = pluginInfo.layout

		const input = new Input()
		const output = new Output()

		try {
			const inputPortName = pluginInfo.inputPortName
			const outputPortName = pluginInfo.outputPortName ?? pluginInfo.inputPortName

			// Use index based off name (as name already gets an index number after the port name when duplicate name), then just indexOf
			input.openPort(getInputs().indexOf(inputPortName))
			const outputPortIndex = getOutputs().indexOf(outputPortName)
			if (outputPortIndex > -1) output.openPort(outputPortIndex) // TODO what to do when this is not found?

			return {
				surface: new MidiWrapper(surfaceId, input, output, inputPortName, outputPortName, context, layout),
				registerProps: {
					brightness: layout.supportsBrightness,
					canChangePage: layout.canChangePage,
					surfaceLayout: createSurfaceSchema(layout),
					pincodeMap: createPincodeMap(layout),
					transferVariables: layout.transferVariables ?? [],
					configFields: [
						{
							id: 'extendedMode',
							type: 'checkbox',
							label: 'Enable extended mode',
							description:
								'SOME devices contain extra buttons that do not have color support, and therefor will not be usable by default.\n' +
								'But if you really care about utilizing those buttons, you can enable this. Just be aware those extra buttons do not have color support or only one color.',
							isVisibleExpression: `${layout.buttons.find((btn) => btn.extendedModeOnly === true) ? 1 : 0} == 1`,
							default: false,
						},
					],
					location: null,
				},
			}
		} catch (e) {
			input.closePort()
			output?.closePort()

			throw e
		}
	},
}
export default MidiPlugin
