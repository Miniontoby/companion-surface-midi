import type { RgbColor, SurfaceContext, SurfaceInputVariable, SurfaceOutputVariable } from '@companion-surface/base'
import type { MidiMessage, Output } from '@julusian/midi/lazy'
import { getClosestApcColor, getClosestApcMiniColor, getClosestLpColor, parseControlId } from './util.js'

export interface MidiButtonDefinition {
	id: string

	type: 'noteon' | 'cc' | 'cc-encoder' | 'noteon-encoder'
	channel: number
	note: number
	extendedModeOnly?: true
}

export interface MidiLayoutDefinition {
	/** Does this surface support full RGB range, so we can apply brightness to it? */
	supportsBrightness: boolean
	/** Do we have extraButtons that we can utilize for changePage actions? If so, label which button Can Change Page */
	canChangePage?: { label: string } | undefined
	/** All the buttons of the main grid */
	buttons: MidiButtonDefinition[]
	/** Extra buttons that do not belong in the grid. For example dedicated page up/down buttons */
	extraButtons?: (MidiButtonDefinition & { id: 'page/left' | 'page/right' })[]
	/** Extra variables for input or output. For example encoders/sliders as inputs, or extra lights as outputs */
	transferVariables?: Array<
		| (SurfaceInputVariable & Omit<MidiButtonDefinition, 'type'> & { msg_type: 'noteon' | 'cc' })
		| (SurfaceOutputVariable & { callback: (output: Output, value: unknown) => void })
	>
	/** MidiMessage/bytes to startup/clear the device. Also like just for when stuff dangles around, to just reset the colors. For example by exiting and entering DAW/programmer mode, and requesting slider/fader values, or just setting some settings */
	command_clearPanel: () => MidiMessage[]
	/** MidiMessage/bytes to clean up the device before closing the connection */
	command_shutdown: () => MidiMessage[]
	/** MidiMessage/bytes to send the color to the controlId button */
	command_writeKeyColour: (controlId: string, color: RgbColor) => MidiMessage
	/** Utility for those devices that do not have a full RGB range. Used to check if the current grabbed color of your companion button is too dark to even show up on the device, and then it will try another location instead */
	isColorTooBlack: (color: RgbColor) => boolean
	/** Extra function to parse a Sysex message. For example when you requested the slider/fader values using the command_clearPanel and then you receive it back using sysex */
	parseSysex?: (context: SurfaceContext, bytes: Buffer<ArrayBufferLike>) => void
}

// TODO - this should be moved to a json file kind of system or something...

///////////////////////////////
// Launchpad MK2 collection: //
///////////////////////////////

// TODO still needs testing
const NovationLaunchpadMiniLayoutTest: MidiLayoutDefinition = {
	// https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/novation/downloads/10780/launchpad-s-and-mini-advanced-features-guide.pdf
	// Not really helpful documentation tho.
	supportsBrightness: true,
	buttons: [
		// Row 0 - cc 104-112
		{ id: '0/0', type: 'cc', channel: 0, note: 104 },
		{ id: '0/1', type: 'cc', channel: 0, note: 105 },
		{ id: '0/2', type: 'cc', channel: 0, note: 106 },
		{ id: '0/3', type: 'cc', channel: 0, note: 107 },
		{ id: '0/4', type: 'cc', channel: 0, note: 108 },
		{ id: '0/5', type: 'cc', channel: 0, note: 109 },
		{ id: '0/6', type: 'cc', channel: 0, note: 110 },
		{ id: '0/7', type: 'cc', channel: 0, note: 111 },
		{ id: '0/8', type: 'cc', channel: 0, note: 112 },

		// Row 1 - notes 0-8
		{ id: '1/0', type: 'noteon', channel: 0, note: 0 },
		{ id: '1/1', type: 'noteon', channel: 0, note: 1 },
		{ id: '1/2', type: 'noteon', channel: 0, note: 2 },
		{ id: '1/3', type: 'noteon', channel: 0, note: 3 },
		{ id: '1/4', type: 'noteon', channel: 0, note: 4 },
		{ id: '1/5', type: 'noteon', channel: 0, note: 5 },
		{ id: '1/6', type: 'noteon', channel: 0, note: 6 },
		{ id: '1/7', type: 'noteon', channel: 0, note: 7 },
		{ id: '1/8', type: 'noteon', channel: 0, note: 8 },

		// Row 2 - notes 16-24
		{ id: '2/0', type: 'noteon', channel: 0, note: 16 },
		{ id: '2/1', type: 'noteon', channel: 0, note: 17 },
		{ id: '2/2', type: 'noteon', channel: 0, note: 18 },
		{ id: '2/3', type: 'noteon', channel: 0, note: 19 },
		{ id: '2/4', type: 'noteon', channel: 0, note: 20 },
		{ id: '2/5', type: 'noteon', channel: 0, note: 21 },
		{ id: '2/6', type: 'noteon', channel: 0, note: 22 },
		{ id: '2/7', type: 'noteon', channel: 0, note: 23 },
		{ id: '2/8', type: 'noteon', channel: 0, note: 24 },

		// Row 3 - notes 32-40
		{ id: '3/0', type: 'noteon', channel: 0, note: 32 },
		{ id: '3/1', type: 'noteon', channel: 0, note: 33 },
		{ id: '3/2', type: 'noteon', channel: 0, note: 34 },
		{ id: '3/3', type: 'noteon', channel: 0, note: 35 },
		{ id: '3/4', type: 'noteon', channel: 0, note: 36 },
		{ id: '3/5', type: 'noteon', channel: 0, note: 37 },
		{ id: '3/6', type: 'noteon', channel: 0, note: 38 },
		{ id: '3/7', type: 'noteon', channel: 0, note: 39 },
		{ id: '3/8', type: 'noteon', channel: 0, note: 40 },

		// Row 4 - notes 48-56
		{ id: '4/0', type: 'noteon', channel: 0, note: 48 },
		{ id: '4/1', type: 'noteon', channel: 0, note: 49 },
		{ id: '4/2', type: 'noteon', channel: 0, note: 50 },
		{ id: '4/3', type: 'noteon', channel: 0, note: 51 },
		{ id: '4/4', type: 'noteon', channel: 0, note: 52 },
		{ id: '4/5', type: 'noteon', channel: 0, note: 53 },
		{ id: '4/6', type: 'noteon', channel: 0, note: 54 },
		{ id: '4/7', type: 'noteon', channel: 0, note: 55 },
		{ id: '4/8', type: 'noteon', channel: 0, note: 56 },

		// Row 5 - notes 64-72
		{ id: '5/0', type: 'noteon', channel: 0, note: 64 },
		{ id: '5/1', type: 'noteon', channel: 0, note: 65 },
		{ id: '5/2', type: 'noteon', channel: 0, note: 66 },
		{ id: '5/3', type: 'noteon', channel: 0, note: 67 },
		{ id: '5/4', type: 'noteon', channel: 0, note: 68 },
		{ id: '5/5', type: 'noteon', channel: 0, note: 69 },
		{ id: '5/6', type: 'noteon', channel: 0, note: 70 },
		{ id: '5/7', type: 'noteon', channel: 0, note: 71 },
		{ id: '5/8', type: 'noteon', channel: 0, note: 72 },

		// Row 6 - notes 80-88
		{ id: '6/0', type: 'noteon', channel: 0, note: 80 },
		{ id: '6/1', type: 'noteon', channel: 0, note: 81 },
		{ id: '6/2', type: 'noteon', channel: 0, note: 82 },
		{ id: '6/3', type: 'noteon', channel: 0, note: 83 },
		{ id: '6/4', type: 'noteon', channel: 0, note: 84 },
		{ id: '6/5', type: 'noteon', channel: 0, note: 85 },
		{ id: '6/6', type: 'noteon', channel: 0, note: 86 },
		{ id: '6/7', type: 'noteon', channel: 0, note: 87 },
		{ id: '6/8', type: 'noteon', channel: 0, note: 88 },

		// Row 7 - notes 96-104
		{ id: '7/0', type: 'noteon', channel: 0, note: 96 },
		{ id: '7/1', type: 'noteon', channel: 0, note: 97 },
		{ id: '7/2', type: 'noteon', channel: 0, note: 98 },
		{ id: '7/3', type: 'noteon', channel: 0, note: 99 },
		{ id: '7/4', type: 'noteon', channel: 0, note: 100 },
		{ id: '7/5', type: 'noteon', channel: 0, note: 101 },
		{ id: '7/6', type: 'noteon', channel: 0, note: 102 },
		{ id: '7/7', type: 'noteon', channel: 0, note: 103 },
		{ id: '7/8', type: 'noteon', channel: 0, note: 104 },

		// Row 8 - notes 112-120
		{ id: '8/0', type: 'noteon', channel: 0, note: 112 },
		{ id: '8/1', type: 'noteon', channel: 0, note: 113 },
		{ id: '8/2', type: 'noteon', channel: 0, note: 114 },
		{ id: '8/3', type: 'noteon', channel: 0, note: 115 },
		{ id: '8/4', type: 'noteon', channel: 0, note: 116 },
		{ id: '8/5', type: 'noteon', channel: 0, note: 117 },
		{ id: '8/6', type: 'noteon', channel: 0, note: 118 },
		{ id: '8/7', type: 'noteon', channel: 0, note: 119 },
		{ id: '8/8', type: 'noteon', channel: 0, note: 120 },
	],
	command_clearPanel: function () {
		return [[0x0b]]
	},
	command_shutdown: function () {
		return [[0x0b]]
	},
	command_writeKeyColour: function (controlId, color) {
		const { column: x, row: y } = parseControlId(controlId)
		if (isNaN(x) || x < 0 || isNaN(y) || y < 0) return []
		return [0x0f, (x + 1) & 0x7f, (y + 1) & 0x7f, color.r & 0x7f, color.g & 0x7f, color.b & 0x7f]
	},
	isColorTooBlack: function (color) {
		return Math.floor(color.r / 32) === 0 && Math.floor(color.g / 32) === 0 && Math.floor(color.b / 32) === 0
	},
}

// Works
const NovationLaunchpadProLayout: MidiLayoutDefinition = {
	// https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20Pro%20Programmers%20Reference%20Guide%201.01.pdf
	supportsBrightness: true,
	buttons: [
		// Row 0 - cc 91-98
		{ id: '0/0', type: 'cc', channel: 0, note: -1 },
		{ id: '0/1', type: 'cc', channel: 0, note: 91 },
		{ id: '0/2', type: 'cc', channel: 0, note: 92 },
		{ id: '0/3', type: 'cc', channel: 0, note: 93 },
		{ id: '0/4', type: 'cc', channel: 0, note: 94 },
		{ id: '0/5', type: 'cc', channel: 0, note: 95 },
		{ id: '0/6', type: 'cc', channel: 0, note: 96 },
		{ id: '0/7', type: 'cc', channel: 0, note: 97 },
		{ id: '0/8', type: 'cc', channel: 0, note: 98 },
		{ id: '0/9', type: 'cc', channel: 0, note: -1 },

		// Row 1 - notes 80-89
		{ id: '1/0', type: 'cc', channel: 0, note: 80 },
		{ id: '1/1', type: 'noteon', channel: 0, note: 81 },
		{ id: '1/2', type: 'noteon', channel: 0, note: 82 },
		{ id: '1/3', type: 'noteon', channel: 0, note: 83 },
		{ id: '1/4', type: 'noteon', channel: 0, note: 84 },
		{ id: '1/5', type: 'noteon', channel: 0, note: 85 },
		{ id: '1/6', type: 'noteon', channel: 0, note: 86 },
		{ id: '1/7', type: 'noteon', channel: 0, note: 87 },
		{ id: '1/8', type: 'noteon', channel: 0, note: 88 },
		{ id: '1/9', type: 'cc', channel: 0, note: 89 },

		// Row 2 - notes 70-79
		{ id: '2/0', type: 'cc', channel: 0, note: 70 },
		{ id: '2/1', type: 'noteon', channel: 0, note: 71 },
		{ id: '2/2', type: 'noteon', channel: 0, note: 72 },
		{ id: '2/3', type: 'noteon', channel: 0, note: 73 },
		{ id: '2/4', type: 'noteon', channel: 0, note: 74 },
		{ id: '2/5', type: 'noteon', channel: 0, note: 75 },
		{ id: '2/6', type: 'noteon', channel: 0, note: 76 },
		{ id: '2/7', type: 'noteon', channel: 0, note: 77 },
		{ id: '2/8', type: 'noteon', channel: 0, note: 78 },
		{ id: '2/9', type: 'cc', channel: 0, note: 79 },

		// Row 3 - notes 60-69
		{ id: '3/0', type: 'cc', channel: 0, note: 60 },
		{ id: '3/1', type: 'noteon', channel: 0, note: 61 },
		{ id: '3/2', type: 'noteon', channel: 0, note: 62 },
		{ id: '3/3', type: 'noteon', channel: 0, note: 63 },
		{ id: '3/4', type: 'noteon', channel: 0, note: 64 },
		{ id: '3/5', type: 'noteon', channel: 0, note: 65 },
		{ id: '3/6', type: 'noteon', channel: 0, note: 66 },
		{ id: '3/7', type: 'noteon', channel: 0, note: 67 },
		{ id: '3/8', type: 'noteon', channel: 0, note: 68 },
		{ id: '3/9', type: 'cc', channel: 0, note: 69 },

		// Row 4 - notes 50-59
		{ id: '4/0', type: 'cc', channel: 0, note: 50 },
		{ id: '4/1', type: 'noteon', channel: 0, note: 51 },
		{ id: '4/2', type: 'noteon', channel: 0, note: 52 },
		{ id: '4/3', type: 'noteon', channel: 0, note: 53 },
		{ id: '4/4', type: 'noteon', channel: 0, note: 54 },
		{ id: '4/5', type: 'noteon', channel: 0, note: 55 },
		{ id: '4/6', type: 'noteon', channel: 0, note: 56 },
		{ id: '4/7', type: 'noteon', channel: 0, note: 57 },
		{ id: '4/8', type: 'noteon', channel: 0, note: 58 },
		{ id: '4/9', type: 'cc', channel: 0, note: 59 },

		// Row 5 - notes 40-49
		{ id: '5/0', type: 'cc', channel: 0, note: 40 },
		{ id: '5/1', type: 'noteon', channel: 0, note: 41 },
		{ id: '5/2', type: 'noteon', channel: 0, note: 42 },
		{ id: '5/3', type: 'noteon', channel: 0, note: 43 },
		{ id: '5/4', type: 'noteon', channel: 0, note: 44 },
		{ id: '5/5', type: 'noteon', channel: 0, note: 45 },
		{ id: '5/6', type: 'noteon', channel: 0, note: 46 },
		{ id: '5/7', type: 'noteon', channel: 0, note: 47 },
		{ id: '5/8', type: 'noteon', channel: 0, note: 48 },
		{ id: '5/9', type: 'cc', channel: 0, note: 49 },

		// Row 6 - notes 30-39
		{ id: '6/0', type: 'cc', channel: 0, note: 30 },
		{ id: '6/1', type: 'noteon', channel: 0, note: 31 },
		{ id: '6/2', type: 'noteon', channel: 0, note: 32 },
		{ id: '6/3', type: 'noteon', channel: 0, note: 33 },
		{ id: '6/4', type: 'noteon', channel: 0, note: 34 },
		{ id: '6/5', type: 'noteon', channel: 0, note: 35 },
		{ id: '6/6', type: 'noteon', channel: 0, note: 36 },
		{ id: '6/7', type: 'noteon', channel: 0, note: 37 },
		{ id: '6/8', type: 'noteon', channel: 0, note: 38 },
		{ id: '6/9', type: 'cc', channel: 0, note: 39 },

		// Row 7 - notes 20-29
		{ id: '7/0', type: 'cc', channel: 0, note: 20 },
		{ id: '7/1', type: 'noteon', channel: 0, note: 21 },
		{ id: '7/2', type: 'noteon', channel: 0, note: 22 },
		{ id: '7/3', type: 'noteon', channel: 0, note: 23 },
		{ id: '7/4', type: 'noteon', channel: 0, note: 24 },
		{ id: '7/5', type: 'noteon', channel: 0, note: 25 },
		{ id: '7/6', type: 'noteon', channel: 0, note: 26 },
		{ id: '7/7', type: 'noteon', channel: 0, note: 27 },
		{ id: '7/8', type: 'noteon', channel: 0, note: 28 },
		{ id: '7/9', type: 'cc', channel: 0, note: 29 },

		// Row 8 - notes 10-19
		{ id: '8/0', type: 'cc', channel: 0, note: 10 },
		{ id: '8/1', type: 'noteon', channel: 0, note: 11 },
		{ id: '8/2', type: 'noteon', channel: 0, note: 12 },
		{ id: '8/3', type: 'noteon', channel: 0, note: 13 },
		{ id: '8/4', type: 'noteon', channel: 0, note: 14 },
		{ id: '8/5', type: 'noteon', channel: 0, note: 15 },
		{ id: '8/6', type: 'noteon', channel: 0, note: 16 },
		{ id: '8/7', type: 'noteon', channel: 0, note: 17 },
		{ id: '8/8', type: 'noteon', channel: 0, note: 18 },
		{ id: '8/9', type: 'cc', channel: 0, note: 19 },

		// Row 9 - notes 1-8
		{ id: '9/0', type: 'cc', channel: 0, note: -1 },
		{ id: '9/1', type: 'cc', channel: 0, note: 1 },
		{ id: '9/2', type: 'cc', channel: 0, note: 2 },
		{ id: '9/3', type: 'cc', channel: 0, note: 3 },
		{ id: '9/4', type: 'cc', channel: 0, note: 4 },
		{ id: '9/5', type: 'cc', channel: 0, note: 5 },
		{ id: '9/6', type: 'cc', channel: 0, note: 6 },
		{ id: '9/7', type: 'cc', channel: 0, note: 7 },
		{ id: '9/8', type: 'cc', channel: 0, note: 8 },
		{ id: '9/9', type: 'cc', channel: 0, note: -1 },
	],
	command_clearPanel: function () {
		// Turn on programmer mode
		return [[0xf0, 0x00, 0x20, 0x29, 0x02, 0x0c, 0x0e, 0x01, 0xf7]]
	},
	command_shutdown: function () {
		// Turn programmer mode off to reset?
		return [[0xf0, 0x00, 0x20, 0x29, 0x02, 0x0c, 0x0e, 0x00, 0xf7]]
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button || button.note === -1) return []
		return [
			0xf0,
			0x00,
			0x20,
			0x29,
			0x02,
			0x10,
			0x0b,
			button.note & 0x7f,
			Math.floor(color.r / 4) & 0x3f, // 0 to 64 instead of 0 to 255 -> 255 / 4 = 64
			Math.floor(color.g / 4) & 0x3f, // 0 to 64 instead of 0 to 255 -> 255 / 4 = 64
			Math.floor(color.b / 4) & 0x3f, // 0 to 64 instead of 0 to 255 -> 255 / 4 = 64
			0xf7,
		]
	},
	isColorTooBlack: function (color) {
		return Math.floor(color.r / 32) === 0 && Math.floor(color.g / 32) === 0 && Math.floor(color.b / 32) === 0
	},
}

// Works
const NovationLaunchpadMK2Layout: MidiLayoutDefinition = {
	// https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20MK2%20Programmers%20Reference%20Manual%20v1.03.pdf
	// or even https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/novation/downloads/10535/prg-max-files-v1.zip
	...NovationLaunchpadProLayout,
	buttons: [
		// Row 0 - cc 91-99
		{ id: '0/0', type: 'cc', channel: 0, note: 104 },
		{ id: '0/1', type: 'cc', channel: 0, note: 105 },
		{ id: '0/2', type: 'cc', channel: 0, note: 106 },
		{ id: '0/3', type: 'cc', channel: 0, note: 107 },
		{ id: '0/4', type: 'cc', channel: 0, note: 108 },
		{ id: '0/5', type: 'cc', channel: 0, note: 109 },
		{ id: '0/6', type: 'cc', channel: 0, note: 110 },
		{ id: '0/7', type: 'cc', channel: 0, note: 111 },
		{ id: '0/8', type: 'cc', channel: 0, note: -1 }, // Placeholder. This one doesn't actually exist

		// Row 1 - notes 81-89
		{ id: '1/0', type: 'noteon', channel: 0, note: 81 },
		{ id: '1/1', type: 'noteon', channel: 0, note: 82 },
		{ id: '1/2', type: 'noteon', channel: 0, note: 83 },
		{ id: '1/3', type: 'noteon', channel: 0, note: 84 },
		{ id: '1/4', type: 'noteon', channel: 0, note: 85 },
		{ id: '1/5', type: 'noteon', channel: 0, note: 86 },
		{ id: '1/6', type: 'noteon', channel: 0, note: 87 },
		{ id: '1/7', type: 'noteon', channel: 0, note: 88 },
		{ id: '1/8', type: 'noteon', channel: 0, note: 89 },

		// Row 2 - notes 71-79
		{ id: '2/0', type: 'noteon', channel: 0, note: 71 },
		{ id: '2/1', type: 'noteon', channel: 0, note: 72 },
		{ id: '2/2', type: 'noteon', channel: 0, note: 73 },
		{ id: '2/3', type: 'noteon', channel: 0, note: 74 },
		{ id: '2/4', type: 'noteon', channel: 0, note: 75 },
		{ id: '2/5', type: 'noteon', channel: 0, note: 76 },
		{ id: '2/6', type: 'noteon', channel: 0, note: 77 },
		{ id: '2/7', type: 'noteon', channel: 0, note: 78 },
		{ id: '2/8', type: 'noteon', channel: 0, note: 79 },

		// Row 3 - notes 61-69
		{ id: '3/0', type: 'noteon', channel: 0, note: 61 },
		{ id: '3/1', type: 'noteon', channel: 0, note: 62 },
		{ id: '3/2', type: 'noteon', channel: 0, note: 63 },
		{ id: '3/3', type: 'noteon', channel: 0, note: 64 },
		{ id: '3/4', type: 'noteon', channel: 0, note: 65 },
		{ id: '3/5', type: 'noteon', channel: 0, note: 66 },
		{ id: '3/6', type: 'noteon', channel: 0, note: 67 },
		{ id: '3/7', type: 'noteon', channel: 0, note: 68 },
		{ id: '3/8', type: 'noteon', channel: 0, note: 69 },

		// Row 4 - notes 51-59
		{ id: '4/0', type: 'noteon', channel: 0, note: 51 },
		{ id: '4/1', type: 'noteon', channel: 0, note: 52 },
		{ id: '4/2', type: 'noteon', channel: 0, note: 53 },
		{ id: '4/3', type: 'noteon', channel: 0, note: 54 },
		{ id: '4/4', type: 'noteon', channel: 0, note: 55 },
		{ id: '4/5', type: 'noteon', channel: 0, note: 56 },
		{ id: '4/6', type: 'noteon', channel: 0, note: 57 },
		{ id: '4/7', type: 'noteon', channel: 0, note: 58 },
		{ id: '4/8', type: 'noteon', channel: 0, note: 59 },

		// Row 5 - notes 41-49
		{ id: '5/0', type: 'noteon', channel: 0, note: 41 },
		{ id: '5/1', type: 'noteon', channel: 0, note: 42 },
		{ id: '5/2', type: 'noteon', channel: 0, note: 43 },
		{ id: '5/3', type: 'noteon', channel: 0, note: 44 },
		{ id: '5/4', type: 'noteon', channel: 0, note: 45 },
		{ id: '5/5', type: 'noteon', channel: 0, note: 46 },
		{ id: '5/6', type: 'noteon', channel: 0, note: 47 },
		{ id: '5/7', type: 'noteon', channel: 0, note: 48 },
		{ id: '5/8', type: 'noteon', channel: 0, note: 49 },

		// Row 6 - notes 31-39
		{ id: '6/0', type: 'noteon', channel: 0, note: 31 },
		{ id: '6/1', type: 'noteon', channel: 0, note: 32 },
		{ id: '6/2', type: 'noteon', channel: 0, note: 33 },
		{ id: '6/3', type: 'noteon', channel: 0, note: 34 },
		{ id: '6/4', type: 'noteon', channel: 0, note: 35 },
		{ id: '6/5', type: 'noteon', channel: 0, note: 36 },
		{ id: '6/6', type: 'noteon', channel: 0, note: 37 },
		{ id: '6/7', type: 'noteon', channel: 0, note: 38 },
		{ id: '6/8', type: 'noteon', channel: 0, note: 39 },

		// Row 7 - notes 21-29
		{ id: '7/0', type: 'noteon', channel: 0, note: 21 },
		{ id: '7/1', type: 'noteon', channel: 0, note: 22 },
		{ id: '7/2', type: 'noteon', channel: 0, note: 23 },
		{ id: '7/3', type: 'noteon', channel: 0, note: 24 },
		{ id: '7/4', type: 'noteon', channel: 0, note: 25 },
		{ id: '7/5', type: 'noteon', channel: 0, note: 26 },
		{ id: '7/6', type: 'noteon', channel: 0, note: 27 },
		{ id: '7/7', type: 'noteon', channel: 0, note: 28 },
		{ id: '7/8', type: 'noteon', channel: 0, note: 29 },

		// Row 8 - notes 11-19
		{ id: '8/0', type: 'noteon', channel: 0, note: 11 },
		{ id: '8/1', type: 'noteon', channel: 0, note: 12 },
		{ id: '8/2', type: 'noteon', channel: 0, note: 13 },
		{ id: '8/3', type: 'noteon', channel: 0, note: 14 },
		{ id: '8/4', type: 'noteon', channel: 0, note: 15 },
		{ id: '8/5', type: 'noteon', channel: 0, note: 16 },
		{ id: '8/6', type: 'noteon', channel: 0, note: 17 },
		{ id: '8/7', type: 'noteon', channel: 0, note: 18 },
		{ id: '8/8', type: 'noteon', channel: 0, note: 19 },
	],
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button || button.note === -1) return []
		return [
			0xf0,
			0x00,
			0x20,
			0x29,
			0x02,
			0x18,
			0x0b,
			button.note & 0x7f,
			Math.floor(color.r / 4) & 0x3f, // 0 to 64 instead of 0 to 255 -> 255 / 4 = 64
			Math.floor(color.g / 4) & 0x3f, // 0 to 64 instead of 0 to 255 -> 255 / 4 = 64
			Math.floor(color.b / 4) & 0x3f, // 0 to 64 instead of 0 to 255 -> 255 / 4 = 64
			0xf7,
		]
	},
}

///////////////////////////////
// Launchpad MK3 collection: //
///////////////////////////////

// TODO still needs testing
const NovationLaunchpadXMK3Layout: MidiLayoutDefinition = {
	// https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20X%20-%20Programmers%20Reference%20Manual.pdf
	...NovationLaunchpadProLayout, // Same clearPanel and shutdown functions!
	buttons: [
		// Row 0 - cc 91-99
		{ id: '0/0', type: 'cc', channel: 0, note: 91 },
		{ id: '0/1', type: 'cc', channel: 0, note: 92 },
		{ id: '0/2', type: 'cc', channel: 0, note: 93 },
		{ id: '0/3', type: 'cc', channel: 0, note: 94 },
		{ id: '0/4', type: 'cc', channel: 0, note: 95 },
		{ id: '0/5', type: 'cc', channel: 0, note: 96 },
		{ id: '0/6', type: 'cc', channel: 0, note: 97 },
		{ id: '0/7', type: 'cc', channel: 0, note: 98 },
		{ id: '0/8', type: 'cc', channel: 0, note: 99 },

		// Row 1 - notes 81-89
		{ id: '1/0', type: 'noteon', channel: 0, note: 81 },
		{ id: '1/1', type: 'noteon', channel: 0, note: 82 },
		{ id: '1/2', type: 'noteon', channel: 0, note: 83 },
		{ id: '1/3', type: 'noteon', channel: 0, note: 84 },
		{ id: '1/4', type: 'noteon', channel: 0, note: 85 },
		{ id: '1/5', type: 'noteon', channel: 0, note: 86 },
		{ id: '1/6', type: 'noteon', channel: 0, note: 87 },
		{ id: '1/7', type: 'noteon', channel: 0, note: 88 },
		{ id: '1/8', type: 'cc', channel: 0, note: 89 },

		// Row 2 - notes 16-24
		{ id: '2/0', type: 'noteon', channel: 0, note: 71 },
		{ id: '2/1', type: 'noteon', channel: 0, note: 72 },
		{ id: '2/2', type: 'noteon', channel: 0, note: 73 },
		{ id: '2/3', type: 'noteon', channel: 0, note: 74 },
		{ id: '2/4', type: 'noteon', channel: 0, note: 75 },
		{ id: '2/5', type: 'noteon', channel: 0, note: 76 },
		{ id: '2/6', type: 'noteon', channel: 0, note: 77 },
		{ id: '2/7', type: 'noteon', channel: 0, note: 78 },
		{ id: '2/8', type: 'cc', channel: 0, note: 79 },

		// Row 3 - notes 32-40
		{ id: '3/0', type: 'noteon', channel: 0, note: 61 },
		{ id: '3/1', type: 'noteon', channel: 0, note: 62 },
		{ id: '3/2', type: 'noteon', channel: 0, note: 63 },
		{ id: '3/3', type: 'noteon', channel: 0, note: 64 },
		{ id: '3/4', type: 'noteon', channel: 0, note: 65 },
		{ id: '3/5', type: 'noteon', channel: 0, note: 66 },
		{ id: '3/6', type: 'noteon', channel: 0, note: 67 },
		{ id: '3/7', type: 'noteon', channel: 0, note: 68 },
		{ id: '3/8', type: 'cc', channel: 0, note: 69 },

		// Row 4 - notes 48-56
		{ id: '4/0', type: 'noteon', channel: 0, note: 51 },
		{ id: '4/1', type: 'noteon', channel: 0, note: 52 },
		{ id: '4/2', type: 'noteon', channel: 0, note: 53 },
		{ id: '4/3', type: 'noteon', channel: 0, note: 54 },
		{ id: '4/4', type: 'noteon', channel: 0, note: 55 },
		{ id: '4/5', type: 'noteon', channel: 0, note: 56 },
		{ id: '4/6', type: 'noteon', channel: 0, note: 57 },
		{ id: '4/7', type: 'noteon', channel: 0, note: 58 },
		{ id: '4/8', type: 'cc', channel: 0, note: 59 },

		// Row 5 - notes 64-72
		{ id: '5/0', type: 'noteon', channel: 0, note: 41 },
		{ id: '5/1', type: 'noteon', channel: 0, note: 42 },
		{ id: '5/2', type: 'noteon', channel: 0, note: 43 },
		{ id: '5/3', type: 'noteon', channel: 0, note: 44 },
		{ id: '5/4', type: 'noteon', channel: 0, note: 45 },
		{ id: '5/5', type: 'noteon', channel: 0, note: 46 },
		{ id: '5/6', type: 'noteon', channel: 0, note: 47 },
		{ id: '5/7', type: 'noteon', channel: 0, note: 48 },
		{ id: '5/8', type: 'cc', channel: 0, note: 49 },

		// Row 6 - notes 80-88
		{ id: '6/0', type: 'noteon', channel: 0, note: 31 },
		{ id: '6/1', type: 'noteon', channel: 0, note: 32 },
		{ id: '6/2', type: 'noteon', channel: 0, note: 33 },
		{ id: '6/3', type: 'noteon', channel: 0, note: 34 },
		{ id: '6/4', type: 'noteon', channel: 0, note: 35 },
		{ id: '6/5', type: 'noteon', channel: 0, note: 36 },
		{ id: '6/6', type: 'noteon', channel: 0, note: 37 },
		{ id: '6/7', type: 'noteon', channel: 0, note: 38 },
		{ id: '6/8', type: 'cc', channel: 0, note: 39 },

		// Row 7 - notes 96-104
		{ id: '7/0', type: 'noteon', channel: 0, note: 21 },
		{ id: '7/1', type: 'noteon', channel: 0, note: 22 },
		{ id: '7/2', type: 'noteon', channel: 0, note: 23 },
		{ id: '7/3', type: 'noteon', channel: 0, note: 24 },
		{ id: '7/4', type: 'noteon', channel: 0, note: 25 },
		{ id: '7/5', type: 'noteon', channel: 0, note: 26 },
		{ id: '7/6', type: 'noteon', channel: 0, note: 27 },
		{ id: '7/7', type: 'noteon', channel: 0, note: 28 },
		{ id: '7/8', type: 'cc', channel: 0, note: 29 },

		// Row 8 - notes 112-120
		{ id: '8/0', type: 'noteon', channel: 0, note: 11 },
		{ id: '8/1', type: 'noteon', channel: 0, note: 12 },
		{ id: '8/2', type: 'noteon', channel: 0, note: 13 },
		{ id: '8/3', type: 'noteon', channel: 0, note: 14 },
		{ id: '8/4', type: 'noteon', channel: 0, note: 15 },
		{ id: '8/5', type: 'noteon', channel: 0, note: 16 },
		{ id: '8/6', type: 'noteon', channel: 0, note: 17 },
		{ id: '8/7', type: 'noteon', channel: 0, note: 18 },
		{ id: '8/8', type: 'cc', channel: 0, note: 19 },
	],
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button || button.note === -1) return []
		return [
			0xf0,
			0x00,
			0x20,
			0x29,
			0x02,
			0x0c,
			0x03,
			0x03, // lighting type 3 is RGB
			button.note & 0x7f,
			Math.floor(color.r / 2) & 0x7f,
			Math.floor(color.g / 2) & 0x7f,
			Math.floor(color.b / 2) & 0x7f,
			0xf7,
		] // There's a chance this might work

		// const lpColorIndex = getClosestLpColor(color)
		// return [(button.type === 'noteon' ? 0x90 : 0xb0) | (button.channel & 0x0f), button.note & 0x7f, lpColorIndex & 0x7f]
	},
}

/*
// TODO still needs testing
const NovationLaunchpadProMK3Layout: MidiLayoutDefinition = {
	// https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/LPP3_prog_ref_guide_200415.pdf
	...NovationLaunchpadXMK3Layout, // I DONT KNOW
	command_clearPanel: function () {
		// Turn on programmer mode
		return [[0xf0, 0x00, 0x20, 0x29, 0x02, 0x0e, 0x00, 0x11, 0x00, 0x00, 0xf7]]
	},
	command_shutdown: function () {
		// Turn programmer mode off to reset?
		return [[0xf0, 0x00, 0x20, 0x29, 0x02, 0x0e, 0x0e, 0x00, 0x00, 0x00, 0xf7]]
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button || button.note === -1) return []
		return [
			0xf0,
			0x00,
			0x20,
			0x29,
			0x02,
			0x0e,
			0x03,
			0x03, // lighting type 3 is RGB
			button.note & 0x7f,
			Math.floor(color.r / 2) & 0x7f,
			Math.floor(color.g / 2) & 0x7f,
			Math.floor(color.b / 2) & 0x7f,
			0xf7,
		]
	},
}
*/

// Works
const NovationLaunchpadMiniMK3Layout: MidiLayoutDefinition = {
	// https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20Mini%20-%20Programmers%20Reference%20Manual.pdf
	...NovationLaunchpadXMK3Layout, // same layout
	command_clearPanel: function () {
		// Turn on programmer mode
		return [[0xf0, 0x00, 0x20, 0x29, 0x02, 0x0d, 0x0e, 0x01, 0xf7]]
	},
	command_shutdown: function () {
		// Turn programmer mode off to reset?
		return [[0xf0, 0x00, 0x20, 0x29, 0x02, 0x0d, 0x0e, 0x00, 0xf7]]
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button || button.note === -1) return []
		return [
			0xf0,
			0x00,
			0x20,
			0x29,
			0x02,
			0x0d,
			0x03,
			0x03, // lighting type 3 is RGB
			button.note & 0x7f,
			Math.floor(color.r / 2) & 0x7f,
			Math.floor(color.g / 2) & 0x7f,
			Math.floor(color.b / 2) & 0x7f,
			0xf7,
		]
	},
}

///////////////////////////////
// Launchkey MK3 collection: //
///////////////////////////////

// Works
const NovationLaunchkeyMiniMK3Layout: MidiLayoutDefinition = {
	// https://fael-downloads-prod.focusrite.com/customer/prod/downloads/launchkey_mk3_programmer_s_reference_guide_v1_en.pdf
	supportsBrightness: false, // Colors are limited, most of them will become just black when allowing brightness, so we say we don't support it.
	canChangePage: { label: 'Shift+Arp and Shift+FixedChord change Page' },
	buttons: [
		// Row 1 - notes 0-8 plus ">" button
		{ id: '0/0', type: 'noteon', channel: 9, note: 40 },
		{ id: '0/1', type: 'noteon', channel: 9, note: 41 },
		{ id: '0/2', type: 'noteon', channel: 9, note: 42 },
		{ id: '0/3', type: 'noteon', channel: 9, note: 43 },
		{ id: '0/4', type: 'noteon', channel: 9, note: 48 },
		{ id: '0/5', type: 'noteon', channel: 9, note: 49 },
		{ id: '0/6', type: 'noteon', channel: 9, note: 50 },
		{ id: '0/7', type: 'noteon', channel: 9, note: 51 },
		{ id: '0/8', type: 'cc', channel: 0, note: 104 },
		{ id: '0/9', type: 'cc', channel: 15, note: 115, extendedModeOnly: true }, // Play button - Does not support RGB: off/dimmed/on white - Extended mode only

		// Row 2 - notes 9-16 plus "Stop/Solo/Mute" button
		{ id: '1/0', type: 'noteon', channel: 9, note: 36 },
		{ id: '1/1', type: 'noteon', channel: 9, note: 37 },
		{ id: '1/2', type: 'noteon', channel: 9, note: 38 },
		{ id: '1/3', type: 'noteon', channel: 9, note: 39 },
		{ id: '1/4', type: 'noteon', channel: 9, note: 44 },
		{ id: '1/5', type: 'noteon', channel: 9, note: 45 },
		{ id: '1/6', type: 'noteon', channel: 9, note: 46 },
		{ id: '1/7', type: 'noteon', channel: 9, note: 47 },
		{ id: '1/8', type: 'cc', channel: 0, note: 105 },
		{ id: '1/9', type: 'cc', channel: 15, note: 117, extendedModeOnly: true }, // Record button - Does not support RGB: off/dimmed/on white - Extended mode only
	],
	extraButtons: [
		{ id: 'page/left', type: 'cc', channel: 15, note: 103 },
		{ id: 'page/right', type: 'cc', channel: 15, note: 102 },
	],
	transferVariables: [
		// Encoder Pots/Knobs, above the first row of buttons, all CC
		{
			id: '0/0',
			name: 'Pot 1',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 21,
		},
		{
			id: '0/1',
			name: 'Pot 2',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 22,
		},
		{
			id: '0/2',
			name: 'Pot 3',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 23,
		},
		{
			id: '0/3',
			name: 'Pot 4',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 24,
		},
		{
			id: '0/4',
			name: 'Pot 5',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 25,
		},
		{
			id: '0/5',
			name: 'Pot 6',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 26,
		},
		{
			id: '0/6',
			name: 'Pot 7',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 27,
		},
		{
			id: '0/7',
			name: 'Pot 8',
			type: 'input',
			msg_type: 'cc',
			channel: 15,
			note: 28,
		},

		/*
		// This does work, but extendedMode is now a thing, so technically you can use that now and a black or white background
		{
			id: 'output-play-btn',
			name: 'Play button light up',
			description: '0 = Off, 1-126 = Dimmed on, 127 = Bright on',
			type: 'output',
			callback(output: Output, value: unknown): void {
				if (typeof value === 'number' && value >= 0 && value <= 127) {
					// CC ch=15, control=115
					output.sendMessage([0xb0 | (15 & 0x0f), 115 & 0x7f, value & 0x7f])
				}
			},
		},
		{
			id: 'output-rec-btn',
			name: 'Capture MIDI button light up',
			description: '0 = Off, 1-126 = Dimmed on, 127 = Bright on',
			type: 'output',
			callback(output: Output, value: unknown): void {
				if (typeof value === 'number' && value >= 0 && value <= 127) {
					// CC ch=15, control=117
					output.sendMessage([0xb0 | (15 & 0x0f), 117 & 0x7f, value & 0x7f])
				}
			},
		},
		*/
	],
	command_clearPanel: function () {
		return [
			// Turn DAW mode off to reset
			[0x90 | (15 & 0x0f), 12, 0],
			// Turn DAW mode back on
			[0x90 | (15 & 0x0f), 12, 127],
			// Set pots mode to Device
			[0xb0 | (15 & 0x0f), 9, 2],
		]
	},
	command_shutdown: function () {
		// Turn DAW mode off to reset
		return [[0x90 | (15 & 0x0f), 12, 0]]
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button) return []

		if (button.extendedModeOnly) {
			return [
				(button.type === 'noteon' ? 0x90 : 0xb0) | (button.channel & 0x0f),
				button.note & 0x7f,
				this.isColorTooBlack(color) ? 0 : 127,
			]
		}

		const lpColorIndex = getClosestLpColor(color)
		return [(button.type === 'noteon' ? 0x90 : 0xb0) | (button.channel & 0x0f), button.note & 0x7f, lpColorIndex & 0x7f]
	},
	isColorTooBlack: function (color) {
		return getClosestLpColor(color) === 0
	},
}

// Works
const AkaiAPCMiniMK2Layout: MidiLayoutDefinition = {
	// https://cdn.inmusicbrands.com/akai/attachments/APC%20mini%20mk2%20-%20Communication%20Protocol%20-%20v1.0.pdf
	supportsBrightness: true, // Brightness for preset colors would be done using the channel number: 0 = 10%, 1 = 25%, 2 = 50%, 3 = 65%, 4 = 75%, 5 = 90%, 6 = 100% but we have full RGB
	canChangePage: { label: 'Track button 7 & 8 (arrow left and right) change Page' },
	buttons: [
		// Row 1
		{ id: '0/0', type: 'noteon', channel: 0, note: 0x38 },
		{ id: '0/1', type: 'noteon', channel: 0, note: 0x39 },
		{ id: '0/2', type: 'noteon', channel: 0, note: 0x3a },
		{ id: '0/3', type: 'noteon', channel: 0, note: 0x3b },
		{ id: '0/4', type: 'noteon', channel: 0, note: 0x3c },
		{ id: '0/5', type: 'noteon', channel: 0, note: 0x3d },
		{ id: '0/6', type: 'noteon', channel: 0, note: 0x3e },
		{ id: '0/7', type: 'noteon', channel: 0, note: 0x3f },
		{ id: '0/8', type: 'noteon', channel: 0, note: 0x70, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 2
		{ id: '1/0', type: 'noteon', channel: 0, note: 0x30 },
		{ id: '1/1', type: 'noteon', channel: 0, note: 0x31 },
		{ id: '1/2', type: 'noteon', channel: 0, note: 0x32 },
		{ id: '1/3', type: 'noteon', channel: 0, note: 0x33 },
		{ id: '1/4', type: 'noteon', channel: 0, note: 0x34 },
		{ id: '1/5', type: 'noteon', channel: 0, note: 0x35 },
		{ id: '1/6', type: 'noteon', channel: 0, note: 0x36 },
		{ id: '1/7', type: 'noteon', channel: 0, note: 0x37 },
		{ id: '1/8', type: 'noteon', channel: 0, note: 0x71, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 3
		{ id: '2/0', type: 'noteon', channel: 0, note: 0x28 },
		{ id: '2/1', type: 'noteon', channel: 0, note: 0x29 },
		{ id: '2/2', type: 'noteon', channel: 0, note: 0x2a },
		{ id: '2/3', type: 'noteon', channel: 0, note: 0x2b },
		{ id: '2/4', type: 'noteon', channel: 0, note: 0x2c },
		{ id: '2/5', type: 'noteon', channel: 0, note: 0x2d },
		{ id: '2/6', type: 'noteon', channel: 0, note: 0x2e },
		{ id: '2/7', type: 'noteon', channel: 0, note: 0x2f },
		{ id: '2/8', type: 'noteon', channel: 0, note: 0x72, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 4
		{ id: '3/0', type: 'noteon', channel: 0, note: 0x20 },
		{ id: '3/1', type: 'noteon', channel: 0, note: 0x21 },
		{ id: '3/2', type: 'noteon', channel: 0, note: 0x22 },
		{ id: '3/3', type: 'noteon', channel: 0, note: 0x23 },
		{ id: '3/4', type: 'noteon', channel: 0, note: 0x24 },
		{ id: '3/5', type: 'noteon', channel: 0, note: 0x25 },
		{ id: '3/6', type: 'noteon', channel: 0, note: 0x26 },
		{ id: '3/7', type: 'noteon', channel: 0, note: 0x27 },
		{ id: '3/8', type: 'noteon', channel: 0, note: 0x73, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 5
		{ id: '4/0', type: 'noteon', channel: 0, note: 0x18 },
		{ id: '4/1', type: 'noteon', channel: 0, note: 0x19 },
		{ id: '4/2', type: 'noteon', channel: 0, note: 0x1a },
		{ id: '4/3', type: 'noteon', channel: 0, note: 0x1b },
		{ id: '4/4', type: 'noteon', channel: 0, note: 0x1c },
		{ id: '4/5', type: 'noteon', channel: 0, note: 0x1d },
		{ id: '4/6', type: 'noteon', channel: 0, note: 0x1e },
		{ id: '4/7', type: 'noteon', channel: 0, note: 0x1f },
		{ id: '4/8', type: 'noteon', channel: 0, note: 0x74, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 6
		{ id: '5/0', type: 'noteon', channel: 0, note: 0x10 },
		{ id: '5/1', type: 'noteon', channel: 0, note: 0x11 },
		{ id: '5/2', type: 'noteon', channel: 0, note: 0x12 },
		{ id: '5/3', type: 'noteon', channel: 0, note: 0x13 },
		{ id: '5/4', type: 'noteon', channel: 0, note: 0x14 },
		{ id: '5/5', type: 'noteon', channel: 0, note: 0x15 },
		{ id: '5/6', type: 'noteon', channel: 0, note: 0x16 },
		{ id: '5/7', type: 'noteon', channel: 0, note: 0x17 },
		{ id: '5/8', type: 'noteon', channel: 0, note: 0x75, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 7
		{ id: '6/0', type: 'noteon', channel: 0, note: 0x08 },
		{ id: '6/1', type: 'noteon', channel: 0, note: 0x09 },
		{ id: '6/2', type: 'noteon', channel: 0, note: 0x0a },
		{ id: '6/3', type: 'noteon', channel: 0, note: 0x0b },
		{ id: '6/4', type: 'noteon', channel: 0, note: 0x0c },
		{ id: '6/5', type: 'noteon', channel: 0, note: 0x0d },
		{ id: '6/6', type: 'noteon', channel: 0, note: 0x0e },
		{ id: '6/7', type: 'noteon', channel: 0, note: 0x0f },
		{ id: '6/8', type: 'noteon', channel: 0, note: 0x76, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 8
		{ id: '7/0', type: 'noteon', channel: 0, note: 0x00 },
		{ id: '7/1', type: 'noteon', channel: 0, note: 0x01 },
		{ id: '7/2', type: 'noteon', channel: 0, note: 0x02 },
		{ id: '7/3', type: 'noteon', channel: 0, note: 0x03 },
		{ id: '7/4', type: 'noteon', channel: 0, note: 0x04 },
		{ id: '7/5', type: 'noteon', channel: 0, note: 0x05 },
		{ id: '7/6', type: 'noteon', channel: 0, note: 0x06 },
		{ id: '7/7', type: 'noteon', channel: 0, note: 0x07 },
		{ id: '7/8', type: 'noteon', channel: 0, note: 0x77, extendedModeOnly: true }, // Scene Launch - Does not support RGB: off/on green - Extended mode only

		// Row 9 - Track Buttons 1-8 - Does not support RGB: off/on red - Extended mode only
		{ id: '8/0', type: 'noteon', channel: 0, note: 0x64, extendedModeOnly: true },
		{ id: '8/1', type: 'noteon', channel: 0, note: 0x65, extendedModeOnly: true },
		{ id: '8/2', type: 'noteon', channel: 0, note: 0x66, extendedModeOnly: true },
		{ id: '8/3', type: 'noteon', channel: 0, note: 0x67, extendedModeOnly: true },
		{ id: '8/4', type: 'noteon', channel: 0, note: 0x68, extendedModeOnly: true },
		{ id: '8/5', type: 'noteon', channel: 0, note: 0x69, extendedModeOnly: true },
		{ id: '8/6', type: 'noteon', channel: 0, note: 0x6a, extendedModeOnly: true },
		{ id: '8/7', type: 'noteon', channel: 0, note: 0x6b, extendedModeOnly: true },
		{ id: '8/8', type: 'noteon', channel: 0, note: 0x7a, extendedModeOnly: true }, // Shift button - Does not support color at all - Extended mode only
	],
	extraButtons: [
		{ id: 'page/left', type: 'noteon', channel: 0, note: 0x6a },
		{ id: 'page/right', type: 'noteon', channel: 0, note: 0x6b },
	],
	transferVariables: [
		// Faders below the last row
		{
			id: '0/0',
			name: 'Channel Fader 1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x30,
		},
		{
			id: '0/1',
			name: 'Channel Fader 2',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x31,
		},
		{
			id: '0/2',
			name: 'Channel Fader 3',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x32,
		},
		{
			id: '0/3',
			name: 'Channel Fader 4',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x33,
		},
		{
			id: '0/4',
			name: 'Channel Fader 5',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x34,
		},
		{
			id: '0/5',
			name: 'Channel Fader 6',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x35,
		},
		{
			id: '0/6',
			name: 'Channel Fader 7',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x36,
		},
		{
			id: '0/7',
			name: 'Channel Fader 8',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x37,
		},
		{
			id: '0/8',
			name: 'Master Fader',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x38,
		},
	],
	command_clearPanel: function () {
		// 												   0x41, 0x09, 0x01, 0x04 ???
		return [[0xf0, 0x47, 0x7f, 0x4f, 0x60, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00, 0xf7]]
	},
	command_shutdown: function () {
		return [] // Unsure what to do here
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button) return []

		if (button.extendedModeOnly) {
			return [
				(button.type === 'noteon' ? 0x90 : 0xb0) | (button.channel & 0x0f),
				button.note & 0x7f,
				this.isColorTooBlack(color) ? 0 : 127, // 0 = off, 1 and 3-127 = on, 2 = blink
			]
		}

		return [
			0xf0,
			0x47,
			0x7f,
			0x4f,
			0x24,

			(8 >> 7) & 0x01, // 8 bytes to follow
			8 & 0x7f,

			button.note & 0x3f, // from
			button.note & 0x3f, // to
			(color.r >> 7) & 0x01, // MSB
			color.r & 0x7f, // LSB
			(color.g >> 7) & 0x01,
			color.g & 0x7f,
			(color.b >> 7) & 0x01,
			color.b & 0x7f,

			0xf7,
		]
	},
	isColorTooBlack: function (color) {
		return Math.floor(color.r / 32) === 0 && Math.floor(color.g / 32) === 0 && Math.floor(color.b / 32) === 0
	},
	parseSysex: function (context, bytes) {
		if (this.transferVariables && bytes[0] === 0xf0 && bytes[1] === 0x47 && bytes[bytes.length - 1] === 0xf7) {
			// message type
			if (bytes[4] === 0x61) {
				// size
				// if (((bytes[5] << 7) | bytes[6]) >= 8 && bytes.length === 17) {
				if (bytes.length === 17) {
					context.sendVariableValue(this.transferVariables[0].id, bytes[7])
					context.sendVariableValue(this.transferVariables[1].id, bytes[8])
					context.sendVariableValue(this.transferVariables[2].id, bytes[9])
					context.sendVariableValue(this.transferVariables[3].id, bytes[10])
					context.sendVariableValue(this.transferVariables[4].id, bytes[11])
					context.sendVariableValue(this.transferVariables[5].id, bytes[12])
					context.sendVariableValue(this.transferVariables[6].id, bytes[13])
					context.sendVariableValue(this.transferVariables[7].id, bytes[14])
					if (this.transferVariables[8].id.startsWith('0/'))
						context.sendVariableValue(this.transferVariables[8].id, bytes[15])
				}
			}
		}
	},
}

// Works
const AkaiAPCMiniLayout: MidiLayoutDefinition = {
	// Works the same as the MK2 but only has 3 colors for the buttons. No specific documentation was found for this model.
	...AkaiAPCMiniMK2Layout,
	supportsBrightness: false, // NOPE, theres only 3 colors!!!
	canChangePage: {
		label:
			'Track buttons 3 & 4 (arrow left and right) change Page ---- NOTE about controller: only Green, Red and Yellow colors are available on this controller!',
	},
	extraButtons: [
		{ id: 'page/left', type: 'noteon', channel: 0, note: 66 },
		{ id: 'page/right', type: 'noteon', channel: 0, note: 67 },
	],
	command_clearPanel: function () {
		return [[]]
	},
	command_shutdown: function () {
		return [[]]
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button) return []

		const lpColorIndex = getClosestApcMiniColor(color) // There's only three colors!
		return [(button.type === 'noteon' ? 0x90 : 0xb0) | (button.channel & 0x0f), button.note & 0x7f, lpColorIndex & 0x7f]
	},
	isColorTooBlack: function (color) {
		return getClosestApcMiniColor(color) === 0
	},
}

// TODO still needs testing? I forgot
const AkaiAPC40MK2Layout: MidiLayoutDefinition = {
	// https://cdn.inmusicbrands.com/akai/attachments/apc40II/APC40Mk2_Communications_Protocol_v1.2.pdf
	...AkaiAPCMiniLayout,
	supportsBrightness: false, // NOPE, requires different channel
	canChangePage: {
		label: 'Bank left and right change Page',
	},
	buttons: [
		// Row 1
		{ id: '0/0', type: 'noteon', channel: 0, note: 32 },
		{ id: '0/1', type: 'noteon', channel: 0, note: 33 },
		{ id: '0/2', type: 'noteon', channel: 0, note: 34 },
		{ id: '0/3', type: 'noteon', channel: 0, note: 35 },
		{ id: '0/4', type: 'noteon', channel: 0, note: 36 },
		{ id: '0/5', type: 'noteon', channel: 0, note: 37 },
		{ id: '0/6', type: 'noteon', channel: 0, note: 38 },
		{ id: '0/7', type: 'noteon', channel: 0, note: 39 },

		// Row 2
		{ id: '1/0', type: 'noteon', channel: 0, note: 24 },
		{ id: '1/1', type: 'noteon', channel: 0, note: 25 },
		{ id: '1/2', type: 'noteon', channel: 0, note: 26 },
		{ id: '1/3', type: 'noteon', channel: 0, note: 27 },
		{ id: '1/4', type: 'noteon', channel: 0, note: 28 },
		{ id: '1/5', type: 'noteon', channel: 0, note: 29 },
		{ id: '1/6', type: 'noteon', channel: 0, note: 30 },
		{ id: '1/7', type: 'noteon', channel: 0, note: 31 },

		// Row 3
		{ id: '2/0', type: 'noteon', channel: 0, note: 16 },
		{ id: '2/1', type: 'noteon', channel: 0, note: 17 },
		{ id: '2/2', type: 'noteon', channel: 0, note: 18 },
		{ id: '2/3', type: 'noteon', channel: 0, note: 19 },
		{ id: '2/4', type: 'noteon', channel: 0, note: 20 },
		{ id: '2/5', type: 'noteon', channel: 0, note: 21 },
		{ id: '2/6', type: 'noteon', channel: 0, note: 22 },
		{ id: '2/7', type: 'noteon', channel: 0, note: 23 },

		// Row 4
		{ id: '3/0', type: 'noteon', channel: 0, note: 8 },
		{ id: '3/1', type: 'noteon', channel: 0, note: 9 },
		{ id: '3/2', type: 'noteon', channel: 0, note: 10 },
		{ id: '3/3', type: 'noteon', channel: 0, note: 11 },
		{ id: '3/4', type: 'noteon', channel: 0, note: 12 },
		{ id: '3/5', type: 'noteon', channel: 0, note: 13 },
		{ id: '3/6', type: 'noteon', channel: 0, note: 14 },
		{ id: '3/7', type: 'noteon', channel: 0, note: 15 },

		// Row 5
		{ id: '4/0', type: 'noteon', channel: 0, note: 0 },
		{ id: '4/1', type: 'noteon', channel: 0, note: 1 },
		{ id: '4/2', type: 'noteon', channel: 0, note: 2 },
		{ id: '4/3', type: 'noteon', channel: 0, note: 3 },
		{ id: '4/4', type: 'noteon', channel: 0, note: 4 },
		{ id: '4/5', type: 'noteon', channel: 0, note: 5 },
		{ id: '4/6', type: 'noteon', channel: 0, note: 6 },
		{ id: '4/7', type: 'noteon', channel: 0, note: 7 },
	],
	extraButtons: [
		{ id: 'page/left', type: 'noteon', channel: 0, note: 0x3c },
		{ id: 'page/right', type: 'noteon', channel: 0, note: 0x3d },
	],
	transferVariables: [
		// Track faders
		{
			id: '0/0',
			name: 'Track Fader 1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x07,
		},
		{
			id: '0/1',
			name: 'Track Fader 2',
			type: 'input',
			msg_type: 'cc',
			channel: 1,
			note: 0x07,
		},
		{
			id: '0/2',
			name: 'Track Fader 3',
			type: 'input',
			msg_type: 'cc',
			channel: 2,
			note: 0x07,
		},
		{
			id: '0/3',
			name: 'Track Fader 4',
			type: 'input',
			msg_type: 'cc',
			channel: 3,
			note: 0x07,
		},
		{
			id: '0/4',
			name: 'Track Fader 5',
			type: 'input',
			msg_type: 'cc',
			channel: 4,
			note: 0x07,
		},
		{
			id: '0/5',
			name: 'Track Fader 6',
			type: 'input',
			msg_type: 'cc',
			channel: 5,
			note: 0x07,
		},
		{
			id: '0/6',
			name: 'Track Fader 7',
			type: 'input',
			msg_type: 'cc',
			channel: 6,
			note: 0x07,
		},
		{
			id: '0/7',
			name: 'Track Fader 8',
			type: 'input',
			msg_type: 'cc',
			channel: 7,
			note: 0x07,
		},
		{
			id: '0/8',
			name: 'Master Fader',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x0e,
		},
		{
			id: '0/9',
			name: 'Crossfader',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x0f,
		},

		// Track knobs
		{
			id: '1/0',
			name: 'Track Knob 1 1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x30,
		},
		{
			id: '1/1',
			name: 'Track Knob 1 2',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x31,
		},
		{
			id: '1/2',
			name: 'Track Knob 1 3',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x32,
		},
		{
			id: '1/3',
			name: 'Track Knob 1 4',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x33,
		},
		{
			id: '1/4',
			name: 'Track Knob 1 5',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x34,
		},
		{
			id: '1/5',
			name: 'Track Knob 1 6',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x35,
		},
		{
			id: '1/6',
			name: 'Track Knob 1 7',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x36,
		},
		{
			id: '1/7',
			name: 'Track Knob 1 8',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x37,
		},

		{
			id: '2/0',
			name: 'Track Knob 2 1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x38,
		},
		{
			id: '2/1',
			name: 'Track Knob 2 2',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x39,
		},
		{
			id: '2/2',
			name: 'Track Knob 2 3',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x3a,
		},
		{
			id: '2/3',
			name: 'Track Knob 2 4',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x3b,
		},
		{
			id: '2/4',
			name: 'Track Knob 2 5',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x3c,
		},
		{
			id: '2/5',
			name: 'Track Knob 2 6',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x3d,
		},
		{
			id: '2/6',
			name: 'Track Knob 2 7',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x3e,
		},
		{
			id: '2/7',
			name: 'Track Knob 2 8',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 0x3f,
		},
	],
	command_clearPanel: function () {
		// 0x41 = Ableton mode
		return [[0xf0, 0x47, 0x7f, 0x29, 0x60, 0x00, 0x04, 0x41, 0x01, 0x00, 0x00, 0xf7]]
	},
	command_shutdown: function () {
		return [[]]
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button) return []

		const lpColorIndex = getClosestApcColor(color) // There's only three colors!
		return [(button.type === 'noteon' ? 0x90 : 0xb0) | (button.channel & 0x0f), button.note & 0x7f, lpColorIndex & 0x7f]
	},
	isColorTooBlack: function (color) {
		return getClosestApcColor(color) === 0
	},
}

// Works
const AkaiMpkMiniMk3Layout: MidiLayoutDefinition = {
	// No known documentation. This one was done by 'bruteforcing' with a friend
	supportsBrightness: false, // doesn't even support color...
	buttons: [
		// Bank B - Row 1
		{ id: '0/0', type: 'noteon', channel: 9, note: 48 },
		{ id: '0/1', type: 'noteon', channel: 9, note: 49 },
		{ id: '0/2', type: 'noteon', channel: 9, note: 50 },
		{ id: '0/3', type: 'noteon', channel: 9, note: 51 },
		// Bank B - Row 2
		{ id: '1/0', type: 'noteon', channel: 9, note: 44 },
		{ id: '1/1', type: 'noteon', channel: 9, note: 45 },
		{ id: '1/2', type: 'noteon', channel: 9, note: 46 },
		{ id: '1/3', type: 'noteon', channel: 9, note: 47 },

		// Bank A - Row 1
		{ id: '2/0', type: 'noteon', channel: 9, note: 40 },
		{ id: '2/1', type: 'noteon', channel: 9, note: 41 },
		{ id: '2/2', type: 'noteon', channel: 9, note: 42 },
		{ id: '2/3', type: 'noteon', channel: 9, note: 43 },
		// Bank A - Row 2
		{ id: '3/0', type: 'noteon', channel: 9, note: 36 },
		{ id: '3/1', type: 'noteon', channel: 9, note: 37 },
		{ id: '3/2', type: 'noteon', channel: 9, note: 38 },
		{ id: '3/3', type: 'noteon', channel: 9, note: 39 },
	],
	command_clearPanel: function () {
		return [[]]
	},
	command_shutdown: function () {
		return [[]]
	},
	command_writeKeyColour: function (_controlId, _color) {
		// Only being red... and cannot seem to color any surface...
		return []
	},
	isColorTooBlack: function (_color) {
		return false
	},
}

// TODO still needs testing
const AkaiMIDImixLayout: MidiLayoutDefinition = {
	// https://cdn.inmusicbrands.com/akai/attachments/MIDIMIX/MIDImix-UserGuide-v1.0.pdf
	supportsBrightness: false, // doesn't even support color...
	canChangePage: { label: 'Bank left/right change Page' },
	buttons: [
		// Row 1 - Mute
		{ id: '0/0', type: 'noteon', channel: 0, note: 1 },
		{ id: '0/1', type: 'noteon', channel: 0, note: 4 },
		{ id: '0/2', type: 'noteon', channel: 0, note: 7 },
		{ id: '0/3', type: 'noteon', channel: 0, note: 10 },
		{ id: '0/4', type: 'noteon', channel: 0, note: 13 },
		{ id: '0/5', type: 'noteon', channel: 0, note: 16 },
		{ id: '0/6', type: 'noteon', channel: 0, note: 19 },
		{ id: '0/7', type: 'noteon', channel: 0, note: 22 },

		// Row 2 - Rec arm
		{ id: '1/0', type: 'noteon', channel: 0, note: 3 },
		{ id: '1/1', type: 'noteon', channel: 0, note: 6 },
		{ id: '1/2', type: 'noteon', channel: 0, note: 9 },
		{ id: '1/3', type: 'noteon', channel: 0, note: 12 },
		{ id: '1/4', type: 'noteon', channel: 0, note: 15 },
		{ id: '1/5', type: 'noteon', channel: 0, note: 18 },
		{ id: '1/6', type: 'noteon', channel: 0, note: 21 },
		{ id: '1/7', type: 'noteon', channel: 0, note: 24 },
	],
	extraButtons: [
		{ id: 'page/left', type: 'noteon', channel: 0, note: 25 },
		{ id: 'page/right', type: 'noteon', channel: 0, note: 26 },
	],
	transferVariables: [
		{
			id: '0/0',
			name: 'Knob 1-1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 16,
		},
		{
			id: '0/1',
			name: 'Knob 1-2',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 20,
		},
		{
			id: '0/2',
			name: 'Knob 1-3',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 24,
		},
		{
			id: '0/3',
			name: 'Knob 1-4',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 28,
		},
		{
			id: '0/4',
			name: 'Knob 1-5',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 46,
		},
		{
			id: '0/5',
			name: 'Knob 1-6',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 50,
		},
		{
			id: '0/6',
			name: 'Knob 1-7',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 54,
		},
		{
			id: '0/7',
			name: 'Knob 1-8',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 58,
		},

		{
			id: '1/0',
			name: 'Knob 2-1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 17,
		},
		{
			id: '1/1',
			name: 'Knob 2-2',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 21,
		},
		{
			id: '1/2',
			name: 'Knob 2-3',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 25,
		},
		{
			id: '1/3',
			name: 'Knob 2-4',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 29,
		},
		{
			id: '1/4',
			name: 'Knob 2-5',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 47,
		},
		{
			id: '1/5',
			name: 'Knob 2-6',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 51,
		},
		{
			id: '1/6',
			name: 'Knob 2-7',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 55,
		},
		{
			id: '1/7',
			name: 'Knob 2-8',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 59,
		},

		{
			id: '2/0',
			name: 'Knob 3-1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 18,
		},
		{
			id: '2/1',
			name: 'Knob 3-2',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 22,
		},
		{
			id: '2/2',
			name: 'Knob 3-3',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 26,
		},
		{
			id: '2/3',
			name: 'Knob 3-4',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 30,
		},
		{
			id: '2/4',
			name: 'Knob 3-5',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 48,
		},
		{
			id: '2/5',
			name: 'Knob 3-6',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 52,
		},
		{
			id: '2/6',
			name: 'Knob 3-7',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 56,
		},
		{
			id: '2/7',
			name: 'Knob 3-8',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 60,
		},

		// Faders
		{
			id: '3/0',
			name: 'Fader 1',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 19,
		},
		{
			id: '3/1',
			name: 'Fader 2',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 23,
		},
		{
			id: '3/2',
			name: 'Fader 3',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 27,
		},
		{
			id: '3/3',
			name: 'Fader 4',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 31,
		},
		{
			id: '3/4',
			name: 'Fader 5',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 49,
		},
		{
			id: '3/5',
			name: 'Fader 6',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 53,
		},
		{
			id: '3/6',
			name: 'Fader 7',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 57,
		},
		{
			id: '3/7',
			name: 'Fader 8',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 61,
		},
		{
			id: '3/8',
			name: 'Master Fader',
			type: 'input',
			msg_type: 'cc',
			channel: 0,
			note: 62,
		},
	],
	command_clearPanel: function () {
		return [[]]
	},
	command_shutdown: function () {
		return [[]]
	},
	command_writeKeyColour: function (controlId, color) {
		const button = this.buttons.find((btn) => btn.id === controlId)
		if (!button) return []

		return [
			(button.type === 'noteon' ? 0x90 : 0xb0) | (button.channel & 0x0f),
			button.note & 0x7f,
			this.isColorTooBlack(color) ? 0 : 127,
		]
	},
	isColorTooBlack: function (color) {
		return Math.floor(color.r / 64) === 0 && Math.floor(color.g / 64) === 0 && Math.floor(color.b / 64) === 0
	},
}

// https://www.bax-shop.nl/downloads/products/9000-0072-1850/ayra_digicon-1_user_manual_20210428.pdf
// TODO add Ayra digicon 1 support someday

// Regex devices, can technically use `$1` in the outputName to get the number of the regex
export const DeviceMappings: { [input: string]: { outputName?: string; layout?: MidiLayoutDefinition } } = {
	// Launchpad Mini MK2
	// - Linux:
	'/Launchpad Mini:Launchpad Mini MIDI 1 ([0-9]+):0/': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchpadMiniLayoutTest,
	},

	// Launchpad Pro MK2
	// - Linux:
	'/Launchpad Pro:Launchpad Pro Live Port ([0-9]+):0/': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchpadProLayout,
	},
	// - Windows:
	'Launchpad Pro': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchpadProLayout,
	},

	// Launchpad MK2
	// - Linux:
	'/Launchpad MK2:Launchpad MK2 MIDI 1 ([0-9]+):0/': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchpadMK2Layout,
	},
	// - Windows:
	'Launchpad MK2': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchpadMK2Layout,
	},

	// Launchpad Mini MK3
	// - Linux:
	'/Launchpad Mini MK3:Launchpad Mini MK3 LPMiniMK3 MI ([0-9]+):1/': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchpadMiniMK3Layout,
	},
	// - Windows:
	'LPMiniMK3 MIDI': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchpadMiniMK3Layout,
	},

	// Launchpad Pro MK3
	// - Windows:
	// '???': {
	// 	outputName: '???',
	// 	layout: NovationLaunchpadProMK3Layout,
	// },

	// Launchpad X MK3
	// - Windows:
	'LPX MIDI': {
		outputName: undefined,
		layout: NovationLaunchpadXMK3Layout,
	},

	// Launchkey Mini MK3
	// - Linux:
	'/Launchkey Mini MK3:Launchkey Mini MK3 MIDI 2 ([0-9]+):1/': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchkeyMiniMK3Layout,
	},
	'/Launchkey Mini MK3:Launchkey Mini MK3 Launchkey Mi ([0-9]+):1/': {
		outputName: undefined, // Uses same name as input
		layout: NovationLaunchkeyMiniMK3Layout,
	},
	// - Windows:
	'/MIDIIN2 \\((Launchkey .* MK3)\\)/': {
		outputName: 'MIDIOUT2 ($1)',
		layout: NovationLaunchkeyMiniMK3Layout,
	},

	// Akai APC Mini
	// - Linux:
	'/APC MINI:APC MINI MIDI 1 ([0-9]+):0/': {
		outputName: undefined, // Uses same name as input
		layout: AkaiAPCMiniLayout,
	},
	// - Windows:
	'APC MINI': {
		outputName: undefined, // Uses same name as input
		layout: AkaiAPCMiniLayout,
	},

	// Akai APC Mini MK2
	// - Linux: Unsure if this is try or not, but at least it comes close?
	// '/APC MINI:APC mini mk2 MIDI 1 ([0-9]+):0/': {
	// 	outputName: undefined, // Uses same name as input
	// 	layout: AkaiAPCMiniLayout,
	// },
	// - Windows:
	'APC mini mk2': {
		outputName: undefined, // Uses same name as input
		layout: AkaiAPCMiniMK2Layout,
	},

	// Akai APC 40 mk2
	// - Windows:
	'APC40 mkII': {
		outputName: undefined, // Uses same name as input
		layout: AkaiAPC40MK2Layout,
	},

	// Akai LPD8 MK2
	// - Windows:
	'LPD8 mk2': {
		outputName: undefined, // Uses same name as input
		layout: undefined,
	},

	// Akai MPK Mini MK3
	// - Windows and Fedora:
	'MPK mini 3': {
		outputName: undefined, // Uses same name as input
		layout: AkaiMpkMiniMk3Layout,
	},

	// Akai MIDI mix
	// - Linux:
	'/MIDI Mix:MIDI Mix MIDI 1 ([0-9]+):0/': {
		outputName: undefined, // Uses same name as input
		layout: AkaiMIDImixLayout,
	},
	// - Windows:
	'MIDI Mix': {
		outputName: undefined, // Uses same name as input
		layout: AkaiMIDImixLayout,
	},
}

export const DeviceMappingsWithRegex: { regex: RegExp; name: string }[] = Object.keys(DeviceMappings)
	.map((name) => {
		// Only include regex'ed port names, skip the rest:
		if (!(name.startsWith('/') && name.endsWith('/'))) return undefined
		try {
			// Make sure to match the WHOLE string, instead of doing a contains, by adding the ^ and $ and the m flag
			return { regex: new RegExp('^' + name.substring(1, name.length - 1) + '$', 'm'), name }
		} catch (e) {
			console.error('Regex failure for "' + name + '". error being:', e)
			return undefined
		}
	})
	.filter((obj) => obj !== undefined)
