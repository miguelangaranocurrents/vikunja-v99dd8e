import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain-text copy keeps list markers, so a copied bullet list still reads as a list
// when pasted into a plain text field or another markdown document.

function listLines(list: ProseMirrorNode): string[] {
	const lines: string[] = []
	let number = Number(list.attrs.start ?? 1)
	list.forEach(item => {
		const marker = list.type.name === 'orderedList' ? `${number++}. ` : '- '
		lines.push(...listItemLines(item, marker))
	})
	return lines
}

function listItemLines(item: ProseMirrorNode, marker: string): string[] {
	const lines: string[] = []
	item.forEach((child, _offset, index) => {
		const childLines = isList(child)
			? listLines(child).map(line => `  ${line}`)
			: child.textContent.split('\n')
		if (index === 0) {
			lines.push(`${marker}${childLines[0] ?? ''}`, ...childLines.slice(1))
		} else {
			lines.push(...childLines.map(line => `  ${line}`))
		}
	})
	return lines
}

function isList(node: ProseMirrorNode): boolean {
	return node.type.name === 'bulletList' || node.type.name === 'orderedList'
}

export function sliceToPlainText(slice: Slice): string {
	const blocks: string[] = []
	slice.content.forEach(node => {
		blocks.push(isList(node) ? listLines(node).join('\n') : node.textContent)
	})
	return blocks.join('\n\n')
}
