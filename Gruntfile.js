/* Grunt configuration */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    browserify: {
      options: {
        debug: true
      },
      browser: {
        options: {
          standalone: 'carvoyant'
        },
        files: {
          'carvoyant.js': ['lib/carvoyant.js']
        }
      },
      test: {
        files: {
          'test/carvoyant-test.js': ['test/karma_testrunner.js']
        }
      }
    },
    clean: {
      docs: ['docs'],
      browser: ['carvoyant.js', 'carvoyant.min.js'],
      test: ['test/carvoyant-test.js']
    },
    jsdoc: {
      src: ['lib/*.js'],
      options: {
        configure: '.jsdoc',
        destination: 'docs'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*_test.js']
      },
    },
    karma: {
      browser: {
        configFile: 'karma.conf.js'
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js'],
    },
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! Compiled/Compressed version of <%= pkg.name %> (Version: <%= pkg.version %>) created on <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        compress: true
      },
      browser: {
        files: {
          'carvoyant.min.js': ['carvoyant.js']
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-karma');

  // Default task.
  grunt.registerTask('default', ['clean', 'jshint', 'nodeunit', 'browserify', 'karma', 'uglify', 'clean:test']);

};
