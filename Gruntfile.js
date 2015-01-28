module.exports = function(grunt) {

	var tasks = ['coffee', 'less', 'uglify', 'usebanner'];

	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		usebanner: {
			all: {
				options: {
					position: 'top',
					banner: '/* <%= pkg.title %> v<%= pkg.version %> | <%= pkg.homepage %> | ' +
						'Licensed <%= pkg.license %> | Built <%= grunt.template.today() %> */' + "\n" +
						'/* Forked from original project @ <%= pkg.originalHomepage %> */',
					linebreak: true
				},
				files: {
					src: ['dist/*']
				}
			}
		},

		coffee: {
			all: {
				src: 'coffee/jquery.resizableColumns.coffee',
				dest: 'dist/jquery.resizableColumns.js',
				options: { bare: true }
			}
		},

		less: {
			all: {
				files: {
					'dist/jquery.resizableColumns.css': 'less/jquery.resizableColumns.less',
					'demo/demo.css': 'less/demo.less'
				}
			}
		},

		uglify: {
			all: {
				files: {
					'dist/jquery.resizableColumns.min.js': 'dist/jquery.resizableColumns.js'
				}
			}
		},

		watch: {
			options: {
				livereload: true
			},
			app: {
				files: ['./coffee/*.coffee', './less/*.less'],
				tasks: tasks
			}
		}
	});

	grunt.registerTask('default', tasks);

};
