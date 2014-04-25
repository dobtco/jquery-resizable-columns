module.exports = function(grunt) {

	var tasks = ['coffee', 'less', 'uglify'];

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		coffee: {
			all: {
				src: 'coffee/jquery.resizableColumns.coffee',
				dest: 'js/jquery.resizableColumns.js',
				options: { bare: true }
			}
		},

		less: {
			all: {
				files: {
					'css/jquery.resizableColumns.css': 'less/jquery.resizableColumns.less',
					'css/demo.css': 'less/demo.less'
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
				files: ['./coffee/*.coffee', './less/*.less'],
				tasks: tasks
			}
		}
	});

	grunt.registerTask('default', tasks);

};
