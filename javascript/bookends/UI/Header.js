(function(){
	Matcher.register('header, .header', function(elements){
		elements.each(function(element){
			var left = element.getElement('.left');
			var right = element.getElement('.right');
			var title = element.getElement('h1');
			
			if (!left) {
				left = new Element('div', {'class': 'left'}).inject(element);
			}
			if (!right) {
				right = new Element('div', {'class': 'right'}).inject(element);
			}
			
			var fullSize = element.getSize().x;
			var leftSize = left.getSize().x;
			var rightSize = right.getSize().x;
			var centerSize = 0;
			var availableSize = fullSize - leftSize - rightSize;
			var biggerSide = null;
			
			if (leftSize > rightSize) {
				centerSize = fullSize - leftSize * 2;
				biggerSide = 'left';
			} else if (rightSize > leftSize) {
				centerSize = fullSize - rightSize * 2;
				biggerSide = 'right';
			}
			
			if (title) {
				// we'll use this to check the title size against the available space
				var header_check = new Element('div', {'id': 'header_check'}).inject(element.getParent());
				title.clone().inject(header_check);

				var titleWidth = header_check.getSize().x;

				if (titleWidth < centerSize) {
					// if we're smaller than the center size, make sure that we center the text by
					// making the smaller side the same size as the larger one.
					if (biggerSide == 'right') {
						left.setStyle('width', rightSize);
					} else if (biggerSide == 'left') {
						right.setStyle('width', leftSize);
					}
				} else if (titleWidth < availableSize) {
					// otherwise, if we're smaller than the available size,
					// left align the text so it dosn't look wonky
					title.setStyle('text-align', 'left');
				}
			}
		});
	});
})();