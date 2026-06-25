import type { CSSProperties } from 'react'
import type { SxProps, Theme } from '@mui/material'
import { Box } from '@mui/material'

type Gap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

type BoxProps = {
	children: React.ReactNode
	g?: Gap
	p?: Gap
	m?: Gap
	jc?: CSSProperties['justifyContent']
	ai?: CSSProperties['alignItems']
	as?: CSSProperties['alignSelf']
	sx?: SxProps<Theme>
}

export const C = ({ children, g = 2, jc, ai, as, sx }: BoxProps) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: g,
				...(jc ? { justifyContent: jc } : {}),
				...(ai ? { alignItems: ai } : {}),
				...(as ? { alignSelf: as } : {}),
				...sx,
			}}
		>
			{children}
		</Box>
	)
}

export const R = ({ children, g = 2, jc, ai, as, sx }: BoxProps) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'row',
				gap: g,
				...(jc ? { justifyContent: jc } : {}),
				...(ai ? { alignItems: ai } : {}),
				...(as ? { alignSelf: as } : {}),
				...sx,
			}}
		>
			{children}
		</Box>
	)
}
