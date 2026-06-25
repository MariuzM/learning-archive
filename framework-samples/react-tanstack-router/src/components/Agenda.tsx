import { useState } from 'react'

export const Agenda = () => {
	return (
		<div>
			<Grid />
		</div>
	)
}

const WORKERS = [
	{ id: 1, name: 'John Doe' },
	{ id: 2, name: 'Jane Smith' },
	{ id: 3, name: 'Mike Johnson' },
	{ id: 4, name: 'Sarah Wilson' },
	{ id: 5, name: 'Tom Brown' },
]

const CELL_SIZE = 50
const ROWS = 5
const COLS = 50

const Grid = () => {
	const [position, setPosition] = useState({ row: 0, col: 0 })
	const [boxWidth, setBoxWidth] = useState(3)
	const [isDragging, setIsDragging] = useState(false)
	const [isResizing, setIsResizing] = useState(false)
	const [startCol, setStartCol] = useState(0)
	const [initialMouseX, setInitialMouseX] = useState(0)
	const [initialMouseY, setInitialMouseY] = useState(0)
	const [initialPosition, setInitialPosition] = useState(position)

	const handleBoxMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation()
		setIsDragging(true)
		setInitialMouseX(e.clientX)
		setInitialMouseY(e.clientY)
		setInitialPosition(position)
	}

	const handleResizeMouseDown = (e: React.MouseEvent, direction: 'left' | 'right') => {
		e.stopPropagation()
		setStartCol(direction === 'right' ? position.col + boxWidth - 1 : position.col)
		setIsResizing(true)
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
			const deltaX = e.clientX - initialMouseX
			const deltaY = e.clientY - initialMouseY
			const cellsMovedX = Math.round(deltaX / CELL_SIZE)
			const cellsMovedY = Math.round(deltaY / CELL_SIZE)
			const newCol = Math.min(Math.max(initialPosition.col + cellsMovedX, 0), COLS - boxWidth)
			const newRow = Math.min(Math.max(initialPosition.row + cellsMovedY, 0), ROWS - 1)
			setPosition({ row: newRow, col: newCol })
		} else if (isResizing) {
			const newCol = Math.floor(e.clientX / CELL_SIZE)
			const newWidth = Math.max(1, Math.min(newCol - startCol + 1, COLS - position.col))
			setBoxWidth(newWidth)
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
		setIsResizing(false)
	}

	return (
		<div
			className="relative grid h-screen border-l border-t border-gray-300"
			style={{
				gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
				gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
				width: `${COLS * CELL_SIZE}px`,
			}}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			{Array.from({ length: ROWS * COLS }).map((_, index) => (
				<div key={index} className="h-[50px] w-[50px] border-b border-r border-gray-300 bg-white" />
			))}

			<div
				className="absolute z-40 cursor-move border-b border-r border-gray-300 bg-blue-500"
				style={{
					top: `${position.row * CELL_SIZE}px`,
					left: `${position.col * CELL_SIZE}px`,
					height: `${CELL_SIZE}px`,
					width: `${boxWidth * CELL_SIZE}px`,
				}}
				onMouseDown={handleBoxMouseDown}
			>
				<div
					className="absolute right-0 top-0 h-full w-2 cursor-e-resize hover:bg-blue-600"
					onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
				/>
				<div
					className="absolute left-0 top-0 h-full w-2 cursor-w-resize hover:bg-blue-600"
					onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
				/>
			</div>
		</div>
	)
}
