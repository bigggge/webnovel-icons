const Svgo = require('svgo');
const cheerio = require('cheerio')

/**
 * Convert string to CamelCase.
 * @param {string} str - A string.
 * @returns {string}
 */
function CamelCase(str) {
  return str.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())
}

/**
 * Optimize SVG with `svgo`.
 * @param {string} svg - An SVG string.
 * @returns {Promise<string>}
 */
function optimize(svg) {
  const svgo = new Svgo({
    plugins: [
      {removeViewBox: false}
      // { convertShapeToPath: false },
      // { mergePaths: false },
      // { removeAttrs: { attrs: '(fill|stroke.*)' } },
      // { removeTitle: true },
    ],
  });

  return new Promise(resolve => {
    svgo.optimize(svg).then(({data}) => resolve(data));
  });
}

/**
 * remove SVG element.
 * @param {string} svg - An SVG string.
 * @returns {string}
 */
function removeSVGElement(svg) {
  const $ = cheerio.load(svg);
  return {
    ele: $('body').children().html(),
    attrs: {
      viewBox: $('svg').attr('viewBox')
    }
  };
}

/**
 * Process SVG string.
 * @param {string} svg - An SVG string.
 * @param {Promise<string>}
 */
async function processSvg(svg) {
  const optimized = await optimize(svg)
    // remove semicolon inserted by prettier
    // because prettier thinks it's formatting JSX not HTML
    .then(svg => svg.replace(/;/g, ''))
    .then(removeSVGElement)
    .then(({ele, attrs}) => ([
        // 这个会把 fill-rule 转换成 fillRule  svg component 需要
        ele.replace(/([a-z]+)-([a-z]+)=/g, (_, a, b) => `${a}${CamelCase(b)}=`),
        ele,
        attrs
      ]
    ));
  return optimized;
}

module.exports = processSvg;
