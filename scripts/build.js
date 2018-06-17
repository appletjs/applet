import buble from 'rollup-plugin-buble';
const {version} = process.env.VERSION || require('../package.json');

const banner =
  '/*!\n' +
  ' * applet.js v' + version + '\n' +
  ' * (c) 2018' + ' Maofeng Zhang\n' +
  ' * Released under the MIT License.\n' +
  ' */\n';

function result(dest, format = dest) {
  return {
    input: 'src/applet.js',
    output: {
      file: `${dest}.js`,
      format,
      name: 'Applet',
      banner
    },
    plugins: [
      buble()
    ]
  }
}

export default [
  result('index', 'cjs'),
  result('browser', 'umd'),
];
