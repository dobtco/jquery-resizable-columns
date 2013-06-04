module.exports = function(grunt) {

  var path = require('path');
  var exec = require('child_process').exec;
  var tasks = ['coffee', 'sass', 'uglify'];

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({

    pkg: '<json:package.json>',

    coffee: {
      all: {
        src: 'coffee/jquery.resizableColumns.coffee',
        dest: 'js/jquery.ResizableColumns.js',
        options: {bare: true}
      },
    },

    sass: {
      all: {
        files: {
          'css/jquery.resizableColumns.css': 'scss/jquery.resizableColumns.scss',
          'css/demo.css': 'scss/demo.scss'
        }
      }
    },

    uglify: {
      options: {},
      all: {
        files: {
          'dist/jquery.resizableColumns.min.js': 'js/jquery.resizableColumns.js'
        }
      }
    },

    watch: {
      app: {
        files: ['./coffee/*.coffee', './scss/*.scss'],
        tasks: tasks
      }
    }
  });

  grunt.registerTask('default', tasks);

};
