window.onload = function () {
	var imgArea = document.querySelector('.img-area');
	var processBar = document.querySelector('.process-bar');
	var codeArea = document.querySelector('.code-area');
	var result = {};

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
		result = {};
		var files = Array.prototype.slice.call(e.dataTransfer.files);
		var reader = new FileReader();
		files.forEach(function (t) {
			reader.onload = function(event) {
				result[t.name] = event.target.result;
				codeArea.innerHTML = event.target.result;
			}
			reader.readAsDataURL(t);
		})
	}

	dragInit();
}