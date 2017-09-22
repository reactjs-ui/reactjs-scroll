import childProcess from 'child_process';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import opn from 'opn';
import chalk from 'chalk';
import baseConfig from './webpack.config.babel';
import exampleConfig from './webpack.config.example.babel';
import exampleDistConfig from './webpack.config.example.dist.babel';

const {webpackConfig, ip, port} = exampleConfig;
const $ = gulpLoadPlugins();

function compiler(config, callback) {
  const webpackCompiler = webpack(config);
  // run webpack
  webpackCompiler.run((err, stats) => {
    if (err) {
      throw new $.util.PluginError('webpack:build', err);
    }
    $.util.log('[webpack:build]', stats.toString({
      colors: true
    }));

    if (callback) {
      return callback();
    }
  });
}

gulp.task('sass', () => {
  return gulp.src('src/sass/*.scss')
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      flexbox: 'no-2009', // 不生成2009定义的 Flexbox
      browsers: ['last 3 versions', 'Android >= 4.3', 'iOS >=8.1']
    }))
    .pipe(gulp.dest('src/styles'));
});

//清理临时和打包目录
gulp.task('clean', () => {
  return gulp.src(['build'])
    .pipe($.clean({force: true}));
});

//清理临时和打包目录
gulp.task('clean:example', () => {
  return gulp.src(['examples-dist'])
    .pipe($.clean({force: true}));
});

// 用webpack 打包编译
/*eslint-disable camelcase*/
gulp.task('webpack:build', () => {
  const config = Object.create(baseConfig);
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  );

  //先无压缩编译
  compiler(config, () => {
    //在回调函数中再压缩编译
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          /*eslint-disable camelcase*/
          drop_console: true, // 正式环境去掉 console
          warnings: false
        },
        mangle: {
          except: [] // 设置不混淆变量名
        }
      })
    );
    config.output.filename = '[name].min.js';
    compiler(config);
  });
});

//把 es6 解析为 es5
gulp.task('build', () => {
  gulp.start(['webpack:build']);
});

//运行 example
gulp.task('example', () => {
  gulp.start(['sass']);
  gulp.watch('src/sass/*.scss', ['sass']);

  // Start a webpack-dev-server
  const compiler = webpack(webpackConfig);
  new WebpackDevServer(compiler, webpackConfig.devServer)
    .listen(port, ip, (err) => {
      if (err) {
        throw new $.util.PluginError('webpack-dev-server', err);
      }
      // Server listening
      $.util.log('[webpack-dev-server]', `http://${ip}:${port}/`);

      // keep the server alive or continue?
      opn(port === '80' ? `http://${ip}` : `http://${ip}:${port}/`, {app: 'google chrome'});
    });
});

//打包编译例子
gulp.task('example:build', ['clean:example'], () => {
  const compiler = webpack(exampleDistConfig);
  // run webpack
  compiler.run((err, stats) => {
    if (err) {
      throw new $.util.PluginError('example:build', err);
    }
    $.util.log('[example:build]', stats.toString({
      colors: true
    }));
  });
});

// publish npm
gulp.task('publish', () => {
  const {exec} = childProcess;
  exec('npm run publish-pre && cd build && npm publish', (error, stdout, stderr) => {
    if (error) {
      console.log(chalk.magenta(error));

      return;
    }
    if (stdout) {
      console.log(chalk.magenta(`stdout: ${stdout}`));
    }
    if (stderr) {
      console.log(chalk.magenta(`stderr: ${stderr}`));
    }
  });
});

//默认任务
gulp.task('default', () => {
  gulp.start('build');
});
