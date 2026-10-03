import type { SurfaceSchemaLayoutDefinition } from '@companion-surface/base'
import type { MidiLayoutDefinition } from './tmp-layout.js'
import { parseControlId } from './util.js'

export function createSurfaceSchema(
	layout: MidiLayoutDefinition,
	// extendedMode: boolean = false,
): SurfaceSchemaLayoutDefinition {
	const surfaceLayout: SurfaceSchemaLayoutDefinition = {
		stylePresets: {
			default: {
				colors: 'hex',
				bitmap: {
					w: 8,
					h: 8,
					format: 'rgb',
				},
			},
		},
		controls: {},
	}

	for (const buttonId in layout.buttons) {
		// if (button.extendedModeOnly === true && !extendedMode) continue // skip these
		const { row, column } = parseControlId(buttonId)
		surfaceLayout.controls[buttonId] = {
			row: row,
			column: column,
		}
	}

	return surfaceLayout
}
