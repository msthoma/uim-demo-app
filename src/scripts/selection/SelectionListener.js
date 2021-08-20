const { $ } = window;

let SelectionListener = {
	timeout: 50,
	repository: [],
	contextMenuActive: false,

	stack: [],
	activeSurface: undefined,

	add(selection) {
		this.repository.push(selection);
		this.attachCanvasContextMenu(selection);
	},

	remove(selection) {
		this.repository.remove(selection);
	},

	activate(surface) {
		this.activeSurface = surface;
		this.stack.push(surface);
	},

	deactivate(surface) {
		this.stack.remove(surface);
		this.activeSurface = this.stack.last;
	},

	attachCanvasContextMenu(selection) {
		if (!selection.canvasSelector) return;
	},

	close(e) {
		setTimeout(() => {
			if (this.contextMenuActive) return;

			this.repository.forEach(selection => {
				if (selection.active && !selection.frame.contains(e.target))
					selection.close();
			});
		}, this.timeout);
	}
};

document.addEventListener("pointerdown", SelectionListener.close.bind(SelectionListener));

export default SelectionListener;
