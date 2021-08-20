import { Color } from 'digital-ink';


const { $ } = window;

let layout = {
  init: function () {

    $('nav .Tool').addClass('Button');

    $('nav .Tool.Selectable').on('click', function () {
      const { WILL } = window;

      if (this.classList.contains('Selected')) return;

      $('nav .Tool.Selected').removeClass('Selected');
      $(this).addClass('Selected');

      WILL?.setTool(this.id);
    });

    $('nav .ColorBox input[type=color]').on('change', function () {
      $('.ColorBox .Color').css('background-color', this.value);
    });

    if (!PointerEvent.prototype.getPredictedEvents)
      $('.Button.pointerPrediction').css('display', 'none');

  },

  selectTool(id) {
    $(`nav .Tool.Selectable#${id}`).trigger('click');
  },

  selectColor: function (input) {
		const { WILL } = window.app;

    let color = this.extractColor(input);
    $('.ColorBox .Color').css('background-color', input.value);
    WILL.setColor(color);
  },

  setPaperSize(width, height) {
    let sheet = Array.from(document.styleSheets).filter(sheet => sheet.title === 'main').first;
    let rule = Array.from(sheet.rules).filter(
      rule => rule.selectorText === '.Wrapper::before'
    ).first;

    rule.style.width = `${width}px`;
    rule.style.height = `${height}px`;
  },

  extractColor(node, opacity) {
    let rgba = [];

    if (node.tagName === 'INPUT') {
      let value = node.value.substring(1);

      rgba.push(parseInt(value.substring(0, 2), 16));
      rgba.push(parseInt(value.substring(2, 4), 16));
      rgba.push(parseInt(value.substring(4), 16));
      rgba.push(opacity || 1);
    } else {
      rgba = eval(node.getStyle('background-color').replace(/rgba?/, 'new Array'));
      if (!rgba[3]) rgba[3] = node.getMathStyle('opacity');
    }

    return Color.fromColor(rgba);
  },

};

export default layout;
