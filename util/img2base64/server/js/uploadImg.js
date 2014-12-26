window.onload = function () {
	var imgArea = document.querySelector('.img-area');
	var processBar = document.querySelector('.process-bar');
	var codeArea = document.querySelector('.code-area');

	function dragInit () {
		getDragImg();
	}

	function getDragImg () {

		imgArea.addEventListener('drag', handleDrag, false);
		imgArea.addEventListener('dragover', handleDragOver, false);
		imgArea.addEventListener('drop', handleDrop, false);
	}

	function handleDragOver (e) {
		e.preventDefault();
	}
	function handleDrag () {

	}
	function handleDrop (e) {
        e.stopPropagation();
        e.preventDefault();
		console.log(e.dataTransfer);
	}

	dragInit();
}